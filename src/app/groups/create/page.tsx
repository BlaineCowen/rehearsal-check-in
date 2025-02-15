"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateGroup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First upload image if exists
      let imageUrl = null;
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const { url } = await uploadRes.json();
        imageUrl = url;
      }

      // Create group
      const res = await fetch("/api/groups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, imageUrl }),
      });

      if (!res.ok) throw new Error("Failed to create group");

      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Group</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2">Group Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-800"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Group Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Group"}
        </button>
      </form>
    </main>
  );
}
