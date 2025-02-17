"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { data: user, isPending } = useUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const organization = user?.organizations[0];

  const [formData, setFormData] = useState({
    name: "",
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        imageUrl: organization.imageUrl || "",
      });
      if (organization.imageUrl) {
        setPreviewUrl(organization.imageUrl);
      }
    }
  }, [organization]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create a preview URL for the selected image
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      } else if (formData.imageUrl) {
        formDataToSend.append("imageUrl", formData.imageUrl);
      }

      const res = await fetch(`/api/organizations/${organization.id}/update`, {
        method: "PUT",
        body: formDataToSend,
      });

      if (!res.ok) throw new Error("Failed to update organization");

      await queryClient.invalidateQueries({ queryKey: ["user"] });

      toast({
        title: "Settings updated",
        description: "Your organization settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 w-48 bg-slate-700 rounded mb-8"></div>
        <div className="max-w-2xl">
          <div className="h-[200px] w-full bg-slate-800 rounded-lg mb-6"></div>
          <div className="space-y-4">
            <div className="h-10 w-full bg-slate-700 rounded"></div>
            <div className="h-10 w-full bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Organization Settings</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Edit Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter organization name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgImage">Organization Logo</Label>
              <div className="flex items-center gap-4">
                <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-slate-200">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Organization Logo"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No image
                    </div>
                  )}
                </div>
                <Input
                  id="orgImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="max-w-xs"
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
