"use client";

import { useRouter } from "next/navigation";
import { createOrganization } from "@/app/actions";

export default function CreateOrganization() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    await createOrganization(formData);
    router.push("/");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">Create Your Organization</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <input
          name="name"
          placeholder="Organization Name"
          className="w-full p-2 border rounded mb-4"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          Create Organization
        </button>
      </form>
    </main>
  );
}
