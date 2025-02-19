"use client";

import { useState, useRef } from "react";
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

type FormData = {
  name: string;
  imageUrl?: string;
};

export default function UpdateOrgForm() {
  const router = useRouter();
  const { data: user } = useUser();
  const organization = user?.organizations?.[0];
  const orgId = organization?.id;
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      name: organization?.name || "",
      imageUrl: organization?.imageUrl || "",
    },
  });

  const currentImageUrl = watch("imageUrl");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    try {
      setUploading(true);
      const file = e.target.files[0];

      const response = await fetch(
        `/api/organizations/upload?filename=org-${orgId}-${file.name}`,
        {
          method: "POST",
          body: file,
        }
      );

      if (!response.ok) throw new Error("Failed to upload image");

      const blob = (await response.json()) as PutBlobResult;
      setValue("imageUrl", blob.url);

      // Update organization with new image URL
      const formData = new FormData();
      formData.append("name", watch("name"));
      formData.append("imageUrl", blob.url);

      const updateResponse = await fetch(`/api/organizations/${orgId}/update`, {
        method: "PUT",
        body: formData,
      });

      if (!updateResponse.ok) throw new Error("Failed to update organization");

      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error uploading logo",
      });
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);

      // If there's an existing image URL, pass it along
      if (data.imageUrl) {
        formData.append("imageUrl", data.imageUrl);
      }

      const response = await fetch(`/api/organizations/${orgId}/update`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to update organization");

      toast({
        title: "Success",
        description: "Organization updated successfully",
      });
      router.push("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error updating organization",
      });
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Organization</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Organization Logo</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              ref={fileInputRef}
            />
          </div>

          {currentImageUrl && (
            <div className="relative w-32 h-32">
              <Image
                src={currentImageUrl}
                alt="Organization logo"
                fill
                className="object-contain"
              />
            </div>
          )}

          <Button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Update Organization"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
