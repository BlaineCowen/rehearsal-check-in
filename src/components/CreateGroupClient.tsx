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
import { Upload } from "lucide-react";
import Papa from "papaparse";

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
  const [fileError, setFileError] = useState<string | null>(null);

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

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const idColumn = results.meta.fields?.find(
          (field) =>
            field.toLowerCase() === "studentid" || field.toLowerCase() === "id"
        );

        if (!idColumn) {
          setFileError("CSV must contain a 'studentId' or 'Id' column");
          return;
        }

        const studentIds = results.data
          .map((row: any) => row[idColumn])
          .filter(Boolean);

        console.log("CSV IDs:", studentIds);
        console.log(
          "Available students:",
          students.map((s: Student) => s.studentId)
        );

        const matchedStudents = students.filter((student: Student) => {
          const matches = studentIds.includes(student.studentId);
          console.log(`Checking ${student.studentId}:`, matches);
          return matches;
        });

        console.log(
          "Matched students:",
          matchedStudents.map((s: Student) => s.studentId)
        );

        setSelectedStudents(matchedStudents);
        event.target.value = "";
      },
      error: (error) => {
        console.error("CSV Parse Error:", error);
        setFileError("Failed to parse CSV file");
      },
    });
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

        <div className="flex items-center gap-4 mb-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            className="hidden"
            id="csv-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("csv-upload")?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Student IDs
          </Button>
          {fileError && (
            <span className="text-sm text-red-500">{fileError}</span>
          )}
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
