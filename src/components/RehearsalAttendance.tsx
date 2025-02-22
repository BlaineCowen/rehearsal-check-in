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
import ReportsSkeleton from "./skeletons/ReportsSkeleton";

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

type CombinedRecord =
  | {
      student: Student;
      status: "present";
      checkInTime: string;
    }
  | {
      student: Student;
      status: "absent";
      checkInTime?: never;
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

// Format the time using Intl.DateTimeFormat
const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

export default function RehearsalAttendance({
  rehearsalId,
}: {
  rehearsalId: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState<"all" | "present" | "absent">("all");

  const memoizedColumns = useMemo<ColumnDef<CombinedRecord>[]>(
    () => [
      {
        accessorFn: (row) => row.student.studentId.toLowerCase(),
        id: "studentId",
        header: ({ column }) => (
          <SortableHeader column={column}>Student ID</SortableHeader>
        ),
        cell: ({ row }) => row.original.student.studentId,
      },
      {
        accessorFn: (row) => row.student.firstName.toLowerCase(),
        id: "firstName",
        header: ({ column }) => (
          <SortableHeader column={column}>First Name</SortableHeader>
        ),
        cell: ({ row }) => row.original.student.firstName,
      },
      {
        accessorFn: (row) => row.student.lastName.toLowerCase(),
        id: "lastName",
        header: ({ column }) => (
          <SortableHeader column={column}>Last Name</SortableHeader>
        ),
        cell: ({ row }) => row.original.student.lastName,
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
        accessorFn: (row) =>
          row.checkInTime ? new Date(row.checkInTime).getTime() : 0,
        id: "checkInTime",
        header: ({ column }) => (
          <SortableHeader column={column}>Check-in Time</SortableHeader>
        ),
        cell: ({ row }) =>
          row.original.checkInTime
            ? formatTime(new Date(row.original.checkInTime))
            : "—",
      },
    ],
    []
  );

  const { data, isPending } = useQuery<AttendanceData>({
    queryKey: ["attendance", rehearsalId],
    queryFn: async () => {
      const res = await fetch(`/api/rehearsals/${rehearsalId}/attendance`);
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const memoizedData = useMemo(() => {
    if (!data) return [];
    return [
      ...data.present.map((record) => ({
        student: record.student,
        status: "present" as const,
        checkInTime: record.checkInTime,
      })),
      ...data.absent.map((record) => ({
        student: record.student,
        status: "absent" as const,
      })),
    ] as CombinedRecord[];
  }, [data]);

  const table = useReactTable({
    data:
      filter === "all"
        ? memoizedData
        : memoizedData.filter((record) => record.status === filter),
    columns: memoizedColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isPending) return <ReportsSkeleton />;

  if (!data) return <div>No data available</div>;

  const presentCount = data.present.length;
  const attendanceRate = ((presentCount / data.totalStudents) * 100).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col justify-between mt-24 text-center items-center">
        <div className="flex-1 w-full mb-4">
          <h1 className="text-3xl font-bold">Rehearsal Attendance</h1>
        </div>
        <div className="flex-wrap items-center gap-2">
          <p className="text-lg font-semibold">
            Present: {presentCount} / {data.totalStudents}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Attendance Rate: {attendanceRate}%
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link target="_blank" href={`/attendance/${rehearsalId}`}>
            Go to Sign in Page
          </Link>
        </Button>
      </div>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value as typeof filter)}
        className="mb-4 p-2 border rounded"
      >
        <option value="all">All Students</option>
        <option value="present">Present</option>
        <option value="absent">Absent</option>
      </select>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <Table>
            <TableHeader className="bg-base-100 sticky top-0  ">
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
      </div>
    </div>
  );
}
