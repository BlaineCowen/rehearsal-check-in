"use client";

import { useUser } from "@/hooks/useUser";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";

import { GroupWithStudents } from "@/types";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Trash } from "lucide-react";
import GroupsSkeleton from "@/components/skeletons/GroupsSkeleton";

export default function GroupsPage() {
  const { data: user, isPending } = useUser();

  if (isPending) {
    return <GroupsSkeleton />;
  }

  if (!user?.organizations[0].groups) return null;

  const handleDelete = (id: string) => {
    console.log("Deleting group", id);
  };

  return (
    <div className="pt-24 bg-base-300 h-screen p-8">
      <Button
        color="primary"
        onClick={() => {
          window.location.href = "groups/create";
        }}
      >
        Create New Group
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {user?.organizations[0].groups.map((group: GroupWithStudents) => (
          <Card key={group.id} className="relative group">
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
              <CardDescription>
                {group.students?.length || 0} students
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `groups/${group.id}`;
                }}
              >
                <Edit size={16} className="mr-1" />
                Edit
              </Button>

              <Button
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(group.id);
                }}
                className="float-right"
              >
                <Trash size={16} className="mr-1" />
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
