import { useState } from "react";
import { useRouter } from "next/router";
import { Group } from "@prisma/client";

export default function ImportStudents({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // For manual entry
  const [studentId, setStudentId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [grade, setGrade] = useState("");
  const [groupId, setGroupId] = useState("");

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/students/import", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to import students");
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Failed to import students");
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/students/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          firstName,
          lastName,
          grade,
          groupId: groupId || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to add student");

      // Clear form
      setStudentId("");
      setFirstName("");
      setLastName("");
      setGrade("");
      setGroupId("");

      alert("Student added successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Import Students</h1>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Upload CSV</h2>
        <form onSubmit={handleFileUpload} className="space-y-4">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full"
          />
          <button
            type="submit"
            disabled={!file || loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Add Student Manually</h2>
        <form onSubmit={handleManualAdd} className="space-y-4">
          <input
            type="text"
            placeholder="Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Grade (optional)"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Group (optional)</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded disabled:opacity-50"
          >
            Add Student
          </button>
        </form>
      </div>
    </main>
  );
}

export async function getServerSideProps() {
  const { prisma } = require("@/lib/prisma");
  const groups = await prisma.group.findMany();
  return { props: { groups } };
}
