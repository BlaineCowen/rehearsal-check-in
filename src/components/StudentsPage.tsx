"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Student } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import EditableDataTable from "@/components/ui/editable-datatable";
import ImportStudents from "@/components/ImportStudents";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";

import {
  Table,
  TableCell,
  TableRow,
  TableBody,
  TableHeader,
  TableHead,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { redirect, useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUpDown } from "lucide-react";

// Define your columns with proper typing
const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "studentId" as keyof Student,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Student ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "firstName" as keyof Student,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        First Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "lastName" as keyof Student,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
];

export default function StudentsPage() {
  const { data: user, isLoading } = useUser();
  const [currentData, setCurrentData] = useState<Student[]>([]);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user?.organizations[0]?.students) {
      setCurrentData(user.organizations[0].students);
    }
  }, [user]);

  const handleDataChange = useCallback((newData: Student[]) => {
    // Use requestAnimationFrame to defer the state update
    requestAnimationFrame(() => {
      setCurrentData(newData);
    });
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (!user?.organizations[0]) return null;

  const organizationId = user.organizations[0].id;

  const handleRowUpdate = async (
    rowIndex: number,
    columnId: string,
    value: string
  ) => {
    const updatedData = currentData.map((row, index) =>
      index === rowIndex ? { ...row, [columnId]: value } : row
    );
    setCurrentData(updatedData);
  };

  const handleRowDelete = async (rowIndex: number) => {
    const updatedData = currentData.filter((_, index) => index !== rowIndex);
    setCurrentData(updatedData);
  };

  const updateStudentsPrisma = async (students: Student[]) => {
    toast({
      title: "Updating students...",
    });
    const response = await fetch("/api/students/update-students", {
      method: "POST",
      body: JSON.stringify({ students, organizationId }),
    });
    const data = await response.json();
    if (data.error) {
      console.error(data.error);
    } else {
      toast({
        title: "Students updated",
      });
      // refresh the user query
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    }
  };

  return (
    <main className="p-8 max-w-6xl h-screen bg-base-300 mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Student Roster</h1>
      </div>

      <EditableDataTable<Student>
        initialData={currentData}
        columns={columns}
        organizationId={organizationId}
        onRowUpdate={handleRowUpdate}
        onRowDelete={handleRowDelete}
        onDataChange={handleDataChange}
      />

      <Button color="primary" onClick={() => updateStudentsPrisma(currentData)}>
        Update Students
      </Button>
      <Toaster />
    </main>
  );
}
