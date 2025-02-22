"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { PutBlobResult } from "@vercel/blob";
import Image from "next/image";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ImageIcon } from "lucide-react";
import ImageCropModal from "./image-crop-modal";

type FormData = {
  name: string;
  imageUrl?: string;
  imageBlob?: Blob;
  previewUrl?: string;
};

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
}

export default function UpdateOrgForm() {
  const router = useRouter();
  const { data: user } = useUser();
  const organization = user?.organizations?.[0];
  const orgId = organization?.id;
  const [uploading, setUploading] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      name: organization?.name || "",
      imageUrl: organization?.imageUrl || "",
      previewUrl: "",
    },
  });

  const currentImageUrl = watch("imageUrl");
  const previewUrl = watch("previewUrl");
  const displayUrl = previewUrl || currentImageUrl;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setIsCropModalOpen(true);
  };

  const handleCropComplete = async (croppedImage: string) => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl = croppedImage;
    const imageBlob = base64ToBlob(croppedImage);

    setValue("imageBlob", imageBlob);
    setValue("previewUrl", newPreviewUrl);

    setSelectedImage(null);
    setIsCropModalOpen(false);
  };

  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [selectedImage, previewUrl]);

  const uploadImage = async (imageBlob: Blob) => {
    try {
      setUploading(true);
      const filename = `org-${orgId}-logo.png`;
      const response = await fetch(
        `/api/organizations/upload?filename=${filename}`,
        {
          method: "POST",
          body: imageBlob,
        }
      );

      if (!response.ok) throw new Error("Failed to upload image");

      const blob = (await response.json()) as PutBlobResult;
      return blob.url;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      let finalImageUrl = data.imageUrl;

      if (data.imageBlob) {
        finalImageUrl = await uploadImage(data.imageBlob);
        if (data.previewUrl) {
          URL.revokeObjectURL(data.previewUrl);
        }
      }

      const formData = new FormData();
      formData.append("name", data.name);
      if (finalImageUrl) {
        formData.append("imageUrl", finalImageUrl);
      }

      const response = await fetch(`/api/organizations/${orgId}/update`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to update organization");

      toast({
        description: "Organization updated successfully",
        className: "bg-green-500 text-white",
      });
      router.push("/");
    } catch (error) {
      toast({
        description: "Error updating organization",
        className: "bg-red-500 text-white",
      });
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col pt-24 items-center justify-center">
        <h1 className="text-4xl font-bold text-center mb-12">
          Organization Settings
        </h1>

        <div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input id="name" {...register("name", { required: true })} />
            </div>

            <div className="space-y-4">
              <Label>Organization Logo</Label>

              {displayUrl ? (
                <div className="space-y-4">
                  <div className="relative w-40 h-40 mx-auto rounded-lg overflow-hidden border-2 border-gray-200">
                    <Image
                      src={displayUrl}
                      alt="Organization logo"
                      width={400}
                      height={400}
                      className="object-contain"
                      unoptimized={displayUrl.startsWith("blob:")}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Change Logo"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-lg">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload Logo"}
                  </Button>
                </div>
              )}

              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                ref={fileInputRef}
                className="hidden"
              />
            </div>

            <Button type="submit" disabled={uploading} className="w-full">
              {uploading ? "Uploading..." : "Update Organization"}
            </Button>
          </form>
        </div>
      </div>

      {selectedImage && (
        <ImageCropModal
          isOpen={isCropModalOpen}
          onClose={() => {
            setIsCropModalOpen(false);
            setSelectedImage(null);
            if (selectedImage) {
              URL.revokeObjectURL(selectedImage);
            }
          }}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
}

function base64ToBlob(base64: string): Blob {
  const byteString = atob(base64.split(",")[1]);
  const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}
