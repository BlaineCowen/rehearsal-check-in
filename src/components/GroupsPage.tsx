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
import { Button } from "@mui/material";
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
    <div className="p-8">
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          window.location.href = "groups/create";
        }}
      >
        Create Group
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                variant="contained"
                size="small"
                color="primary"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `groups/${group.id}`;
                }}
              >
                <Edit size={16} className="mr-1" />
                Edit
              </Button>

              <Button
                variant="contained"
                size="small"
                color="error"
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(group.id);
                }}
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
