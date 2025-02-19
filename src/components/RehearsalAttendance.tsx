"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
};

type AttendanceRecord = {
  student: Student;
  checkInTime: string;
};

type AbsentRecord = {
  student: Student;
  status: "absent";
};

type CombinedRecord = {
  student: Student;
  status: "present" | "absent";
  checkInTime?: string;
};

type AttendanceData = {
  present: AttendanceRecord[];
  absent: AbsentRecord[];
  totalStudents: number;
};

function SortableHeader({
  column,
  children,
}: {
  column: any;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="hover:bg-transparent"
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

export default function RehearsalAttendance({
  rehearsalId,
}: {
  rehearsalId: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<CombinedRecord>[] = [
    {
      accessorKey: "student.studentId",
      header: ({ column }) => (
        <SortableHeader column={column}>Student ID</SortableHeader>
      ),
    },
    {
      accessorKey: "student.lastName",
      header: ({ column }) => (
        <SortableHeader column={column}>Name</SortableHeader>
      ),
      cell: ({ row }) =>
        `${row.original.student.firstName} ${row.original.student.lastName}`,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <SortableHeader column={column}>Status</SortableHeader>
      ),
      cell: ({ row }) => (
        <span
          className={
            row.original.status === "present"
              ? "text-green-500 font-medium"
              : "text-red-500 font-medium"
          }
        >
          {row.original.status === "present" ? "Present" : "Absent"}
        </span>
      ),
    },
    {
      accessorKey: "checkInTime",
      header: ({ column }) => (
        <SortableHeader column={column}>Check-in Time</SortableHeader>
      ),
      cell: ({ row }) =>
        row.original.checkInTime
          ? formatDate(new Date(row.original.checkInTime))
          : "—",
    },
  ];

  const { data, isLoading } = useQuery<AttendanceData>({
    queryKey: ["attendance", rehearsalId],
    queryFn: async () => {
      const res = await fetch(`/api/rehearsals/${rehearsalId}/attendance`);
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return res.json();
    },
    refetchInterval: 5000,
  });

  // Combine present and absent records
  const combinedRecords: CombinedRecord[] = useMemo(() => {
    if (!data) return [];

    const presentRecords = data.present.map((record) => ({
      student: record.student,
      status: "present" as const,
      checkInTime: record.checkInTime,
    }));

    const absentRecords = data.absent.map((record) => ({
      student: record.student,
      status: "absent" as const,
    }));

    return [...presentRecords, ...absentRecords];
  }, [data]);

  const table = useReactTable({
    data: combinedRecords,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) return <div>Loading attendance records...</div>;
  if (!data) return <div>No data available</div>;

  const presentCount = data.present.length;
  const attendanceRate = ((presentCount / data.totalStudents) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Rehearsal Attendance</h1>
        <div className="text-right">
          <p className="text-lg font-semibold">
            Present: {presentCount} / {data.totalStudents}
          </p>
          <p className="text-sm text-gray-600">
            Attendance Rate: {attendanceRate}%
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/attendance/${rehearsalId}`}>Go to Sign in Page</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
