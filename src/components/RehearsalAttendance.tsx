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
import { useState } from "react";
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

  const presentColumns: ColumnDef<AttendanceRecord>[] = [
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
      accessorKey: "checkInTime",
      header: ({ column }) => (
        <SortableHeader column={column}>Check-in Time</SortableHeader>
      ),
      cell: ({ row }) => formatDate(new Date(row.original.checkInTime)),
      sortingFn: (a, b) => {
        return (
          new Date(a.original.checkInTime).getTime() -
          new Date(b.original.checkInTime).getTime()
        );
      },
    },
  ];

  const absentColumns: ColumnDef<AbsentRecord>[] = [
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
      header: "Status",
      cell: () => <span className="text-red-500">Absent</span>,
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

  const presentTable = useReactTable({
    data: data?.present || [],
    columns: presentColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const absentTable = useReactTable({
    data: data?.absent || [],
    columns: absentColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) return <div>Loading attendance records...</div>;
  if (!data) return <div>No data available</div>;

  const presentCount = data.present.length;
  const absentCount = data.absent.length;
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

      <Tabs defaultValue="present" className="w-full">
        <TabsList>
          <TabsTrigger value="present">Present ({presentCount})</TabsTrigger>
          <TabsTrigger value="absent">Absent ({absentCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="present">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {presentTable.getHeaderGroups().map((headerGroup) => (
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
                {presentTable.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="absent">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {absentTable.getHeaderGroups().map((headerGroup) => (
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
                {absentTable.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
