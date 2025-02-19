"use client";

import { useRouter } from "next/navigation";
import { createOrganization } from "@/app/actions";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";

export default function CreateOrganization() {
  const router = useRouter();
  const { refetch } = useUser();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      await createOrganization(formData);
      await refetch();
      router.push("/");
    } catch (err: any) {
      if (err.message.includes("already has an organization")) {
        toast.success("Organization created successfully");
        router.push("/");
        return;
      }
      setError(err.message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">Create Your Organization</h1>
      {error && (
        <div className="w-full max-w-sm mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <input
          name="name"
          placeholder="Organization Name"
          className="w-full p-2 border rounded mb-4"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Create Organization
        </button>
      </form>
    </main>
  );
}
