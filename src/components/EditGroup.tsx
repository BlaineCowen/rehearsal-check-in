"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Student, Group } from "@prisma/client";
import SelectableStudentTable from "@/components/SelectableStudentTable";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export default function EditGroup({ groupId }: { groupId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isPending } = useUser();
  const organization = user?.organizations?.[0];
  const currentGroup = organization?.groups?.find(
    (g: Group) => g.id === groupId
  );
  const students = organization?.students;

  const [formData, setFormData] = useState({
    name: "",
    selectedStudents: [] as Student[],
  });

  useEffect(() => {
    if (currentGroup && students) {
      const groupStudents = students.filter((s: Student) =>
        currentGroup.students.some((gs: Student) => gs.id === s.id)
      );
      setFormData({
        name: currentGroup.name,
        selectedStudents: groupStudents,
      });
    }
  }, [currentGroup, students]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;

    const res = await fetch(
      `/api/groups/${groupId}/update?organizationId=${organization.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          studentIds: formData.selectedStudents.map((s) => s.id),
        }),
      }
    );
    if (res.ok) {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/");
    }
  };

  if (isPending || !students || !currentGroup) return <div>Loading...</div>;

  return (
    <main className="justify-center w-screen p-8 pt-24 h-screen max-w-6xl mx-auto mt-16">
      <h1 className="text-3xl font-bold mb-8">Edit Group</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              className="w-full rounded-md border px-3 py-2"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Students</label>
            <SelectableStudentTable
              students={students}
              selectedStudents={formData.selectedStudents}
              onSelectionChange={(selected) =>
                setFormData((prev) => ({ ...prev, selectedStudents: selected }))
              }
            />
          </div>
        </div>

        <Button type="submit" className="mt-6">
          Save Changes
        </Button>
      </form>
    </main>
  );
}
