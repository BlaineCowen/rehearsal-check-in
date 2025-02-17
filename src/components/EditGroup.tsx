"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useUser,
  useStudents,
  useGroups,
  useOrganization,
} from "@/hooks/useUser";
import { Student, Group } from "@prisma/client";
import SelectableStudentTable from "@/components/SelectableStudentTable";
import { useQueryClient } from "@tanstack/react-query";

export default function EditGroup({ groupId }: { groupId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const { data: groups } = useGroups();
  const { data: students } = useStudents();
  const currentGroup = groups?.find((g: Group) => g.id === groupId);

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
    const res = await fetch(
      `/api/groups/${groupId}/update?organizationId=${user?.organizations[0]?.id}`,
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
      await queryClient.invalidateQueries({ queryKey: ["groups"] });
      router.push("/");
    }
  };

  if (!students || !currentGroup) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Group</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Students
          </label>
          <div className="rounded-md border">
            <SelectableStudentTable
              students={students}
              selectedStudents={formData.selectedStudents}
              onSelectionChange={(selected) =>
                setFormData((prev) => ({ ...prev, selectedStudents: selected }))
              }
            />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Save
        </button>
      </form>
    </div>
  );
}
