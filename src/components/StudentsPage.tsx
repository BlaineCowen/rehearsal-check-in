"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Student } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import EditableDataTable from "@/components/ui/editable-datatable";
import ImportStudents from "@/components/ImportStudents";

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

// Define your columns with proper typing
const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "firstName",
    header: "First Name",
    cell: ({ row }) => <span>{row.original.firstName}</span>,
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    cell: ({ row }) => <span>{row.original.lastName}</span>,
  },
  {
    accessorKey: "studentId",
    header: "Student ID",
    cell: ({ row }) => <span>{row.original.studentId}</span>,
  },
];

export default function StudentsPage() {
  const { data: user, isLoading } = useUser();
  const [currentData, setCurrentData] = useState<Student[]>([]);
  const router = useRouter();
  useEffect(() => {
    if (user?.organizations[0]?.students) {
      setCurrentData(user.organizations[0].students);
    }
  }, [user]);

  if (isLoading) return <div>Loading...</div>;
  if (!user?.organizations[0]) return null;

  const organizationId = user.organizations[0].id;

  const handleDataChange = (newData: Student[]) => {
    setCurrentData(newData);
  };

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
    const response = await fetch("/api/students/update-students", {
      method: "POST",
      body: JSON.stringify({ students, organizationId }),
    });
    const data = await response.json();
    if (data.error) {
      console.error(data.error);
    } else {
      // redirect to /
      router.push("/");
    }
  };

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Student Roster</h1>
      </div>

      <EditableDataTable<Student>
        initialData={currentData}
        columns={columns}
        onRowUpdate={handleRowUpdate}
        onRowDelete={handleRowDelete}
        onDataChange={handleDataChange}
      />

      <Button onClick={() => updateStudentsPrisma(currentData)}>
        Update Students
      </Button>
    </main>
  );
}
