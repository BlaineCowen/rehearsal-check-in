"use client";

import { Group, Student } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

type GroupWithStudents = Group & {
  students: Student[];
};

export default function GroupsPage({
  groups,
  organizationId,
}: {
  groups: GroupWithStudents[];
  organizationId: string;
}) {
  const router = useRouter();

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Groups</h1>
        <Button
          onClick={() => router.push("/groups/create")}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Add New Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.length === 0 && (
          <div className="col-span-full">
            <p className="text-gray-500">No groups found</p>
          </div>
        )}
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
              <CardDescription>
                {group.students.length} students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Created {new Date(group.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/groups/${group.id}`)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (confirm("Are you sure you want to delete this group?")) {
                    await fetch(`/api/groups/${group.id}`, {
                      method: "DELETE",
                    });
                    router.refresh();
                  }
                }}
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
