"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Student } from "@prisma/client";
import SelectableStudentTable from "@/components/SelectableStudentTable";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

interface CreateGroupFormProps {
  initialStudents: Student[];
  organizationId: string;
}

function CreateGroupForm({
  initialStudents,
  organizationId,
}: CreateGroupFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);

  const { data: students } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await fetch("/api/students/get-all");
      return res.json();
    },
    initialData: initialStudents,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/groups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          organizationId,
          studentIds: selectedStudents.map((s) => s.id),
        }),
      });

      if (!res.ok) throw new Error("Failed to create group");
      router.push("/groups");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Group</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2">Group Name</label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-md"
            required
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Select Students</h2>
          <SelectableStudentTable
            students={students}
            selectedStudents={selectedStudents}
            onSelectionChange={setSelectedStudents}
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !name || selectedStudents.length === 0}
          >
            {loading ? "Creating..." : "Create Group"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("groups")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </main>
  );
}

export default function CreateGroupClient(props: CreateGroupFormProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <CreateGroupForm {...props} />
    </QueryClientProvider>
  );
}
