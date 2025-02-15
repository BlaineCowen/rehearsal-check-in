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
  {
    accessorKey: "grade",
    header: "Grade",
    cell: ({ row }) => <span>{row.original.grade || "-"}</span>,
  },
];

export default function StudentsPage({ students }: { students: Student[] }) {
  const [showImport, setShowImport] = useState(false);
  const [data, setData] = useState(students);

  const handleRowUpdate = async (
    rowIndex: number,
    columnId: string,
    value: string
  ) => {
    // Update your backend here
    const updatedData = data.map((row, index) =>
      index === rowIndex ? { ...row, [columnId]: value } : row
    );
    setData(updatedData);
  };

  const handleRowDelete = async (rowIndex: number) => {
    // Delete from backend here
    const updatedData = data.filter((_, index) => index !== rowIndex);
    setData(updatedData);
  };

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Student Roster</h1>
        <button
          onClick={() => setShowImport(!showImport)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {showImport ? "Cancel Import" : "Import Students"}
        </button>
      </div>

      {showImport ? (
        <ImportStudents />
      ) : (
        <EditableDataTable initialData={data} />
      )}

      <div className="text-center mt-4">
        <Link
          href="/students/manual-add"
          className="text-blue-500 hover:text-blue-700"
        >
          + Add Student Manually
        </Link>
      </div>
    </main>
  );
}
