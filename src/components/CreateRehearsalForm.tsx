"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GroupWithStudents } from "@/types";
import { useUser } from "@/hooks/useUser";

export default function CreateRehearsalForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isPending } = useUser();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  if (isPending) return <div>Loading groups...</div>;
  if (!user?.organizations[0].groups?.length)
    return <div>No groups found. Create some groups first.</div>;

  const groups = user?.organizations[0].groups;

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSelectAll = () => {
    if (selectedGroups.length === groups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(groups.map((group: GroupWithStudents) => group.id));
    }
  };

  const handleSubmit = async () => {
    if (!selectedGroups.length) {
      alert("Please select at least one group");
      return;
    }

    try {
      const res = await fetch("/api/rehearsals/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId: user?.organizations[0].id,
          groupIds: selectedGroups,
          date: new Date(),
        }),
      });

      if (res.ok) {
        const rehearsal = await res.json();
        await queryClient.invalidateQueries({ queryKey: ["activeRehearsals"] });
        window.open(`/attendance/${rehearsal.id}`, "_blank");
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to create rehearsal:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={handleSelectAll}
          variant="outline"
          className="text-primary border-primary hover:bg-primary/10"
        >
          {selectedGroups.length === groups.length
            ? "Deselect All"
            : "Select All"}
        </Button>
        <span className="text-sm text-primary-content">
          {selectedGroups.length} of {groups.length} groups selected
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group: GroupWithStudents) => (
          <Card
            key={group.id}
            className={`cursor-pointer transition-colors ${
              selectedGroups.includes(group.id)
                ? "bg-base-300 border-primary border-2"
                : "hover:bg-base-300/50"
            }`}
            onClick={() => handleGroupToggle(group.id)}
          >
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
              <CardDescription>
                {group.students?.length || 0} students
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <Button
          onClick={handleSubmit}
          disabled={!selectedGroups.length}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Start Rehearsal ({selectedGroups.length} groups)
        </Button>
      </div>
    </div>
  );
}
