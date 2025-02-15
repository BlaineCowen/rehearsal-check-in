"use client";

import Link from "next/link";
import { useState } from "react";
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
import { useRouter } from "next/navigation";

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

export default function StudentsPage({
  students,
  organizationId,
}: {
  students: Student[];
  organizationId: string;
}) {
  const [currentData, setCurrentData] = useState(students);
  const router = useRouter();

  const handleDataChange = (newData: Student[]) => {
    setCurrentData(newData);
  };

  const handleRowUpdate = async (
    rowIndex: number,
    columnId: string,
    value: string
  ) => {
    // Update your backend here
    const updatedData = currentData.map((row, index) =>
      index === rowIndex ? { ...row, [columnId]: value } : row
    );
    setCurrentData(updatedData);
  };

  const handleRowDelete = async (rowIndex: number) => {
    // Delete from backend here
    const updatedData = currentData.filter((_, index) => index !== rowIndex);
    setCurrentData(updatedData);
  };

  const updateStudentsPrisma = async (students: Student[]) => {
    // use api/students/update-students
    const response = await fetch("/api/students/update-students", {
      method: "POST",
      body: JSON.stringify({ students, organizationId: organizationId }),
    });
    console.log(JSON.stringify({ students, organizationId: organizationId }));
    const data = await response.json();
    console.log(data);
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

      <Button
        onClick={() => {
          updateStudentsPrisma(currentData);
        }}
      >
        Update Students
      </Button>
    </main>
  );
}
