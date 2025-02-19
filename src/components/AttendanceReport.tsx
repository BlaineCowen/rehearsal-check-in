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
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Rehearsal, Student, Attendance, Group } from "@prisma/client";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import ReportsSkeleton from "@/components/skeletons/ReportsSkeleton";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { isWithinInterval, parseISO } from "date-fns";
import React from "react";

type StudentAttendance = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    studentId: string;
  };
  totalRehearsals: number;
  attended: number;
  absent: number;
  attendanceRate: number;
};

// Define the nested types we get from the API
type RehearsalWithRelations = Rehearsal & {
  groups: (Group & {
    students: Student[];
  })[];
  attendance: (Attendance & {
    student: Student;
  })[];
};

type ApiResponse = {
  rehearsals: RehearsalWithRelations[];
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

export default function AttendanceReport({
  organizationId,
}: {
  organizationId: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    to: new Date(), // Today
  });
  const [tempDate, setTempDate] = useState<DateRange | undefined>();

  const columns: ColumnDef<StudentAttendance>[] = [
    {
      accessorKey: "student.studentId",
      header: ({ column }) => (
        <SortableHeader column={column}>Student ID</SortableHeader>
      ),
    },
    {
      accessorKey: "student.firstName",
      header: ({ column }) => (
        <SortableHeader column={column}>First Name</SortableHeader>
      ),
    },
    {
      accessorKey: "student.lastName",
      header: ({ column }) => (
        <SortableHeader column={column}>Last Name</SortableHeader>
      ),
    },
    {
      accessorKey: "totalRehearsals",
      header: ({ column }) => (
        <SortableHeader column={column}>Total Rehearsals</SortableHeader>
      ),
    },
    {
      accessorKey: "attended",
      header: ({ column }) => (
        <SortableHeader column={column}>Attended</SortableHeader>
      ),
    },
    {
      accessorKey: "absent",
      header: ({ column }) => (
        <SortableHeader column={column}>Absent</SortableHeader>
      ),
    },
    {
      accessorKey: "attendanceRate",
      header: ({ column }) => (
        <SortableHeader column={column}>Attendance Rate</SortableHeader>
      ),
      cell: ({ row }) => `${row.original.attendanceRate.toFixed(1)}%`,
    },
  ];

  const { data, isPending } = useQuery<ApiResponse>({
    queryKey: ["attendance-report", organizationId],
    queryFn: async () => {
      const res = await fetch(
        `/api/reports/attendance?organizationId=${organizationId}`
      );
      if (!res.ok) throw new Error("Failed to fetch report");
      return res.json();
    },
  });

  // Filter rehearsals based on selected date range
  const filteredRehearsals = React.useMemo(() => {
    if (!data?.rehearsals) return [];

    return data.rehearsals.filter((rehearsal) => {
      // Ensure we have valid dates to compare
      const rehearsalDate = new Date(rehearsal.date);
      const fromDate = date?.from ? new Date(date.from) : null;
      const toDate = date?.to ? new Date(date.to) : null;

      if (!fromDate) return true; // Show all if no date filter

      if (toDate) {
        return isWithinInterval(rehearsalDate, {
          start: fromDate,
          end: toDate,
        });
      }

      // If only from date is selected, show rehearsals on or after that date
      return rehearsalDate >= fromDate;
    });
  }, [data?.rehearsals, date]);

  // Calculate attendance statistics
  const attendanceStats = React.useMemo(() => {
    if (!filteredRehearsals.length) return [];

    // Group by student and calculate stats
    const studentStats = new Map();

    filteredRehearsals.forEach((rehearsal) => {
      rehearsal.groups.forEach((group) => {
        group.students.forEach((student) => {
          const stats = studentStats.get(student.id) || {
            student,
            totalRehearsals: 0,
            attended: 0,
            absent: 0,
            attendanceRate: 0,
          };

          stats.totalRehearsals++;
          if (rehearsal.attendance.some((a) => a.studentId === student.id)) {
            stats.attended++;
          } else {
            stats.absent++;
          }
          stats.attendanceRate = (stats.attended / stats.totalRehearsals) * 100;

          studentStats.set(student.id, stats);
        });
      });
    });

    return Array.from(studentStats.values());
  }, [filteredRehearsals]);

  const table = useReactTable({
    data: attendanceStats,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isPending) {
    return <ReportsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Attendance Report</h1>
        <div className="flex items-center gap-4">
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-900" align="start">
                <div className="flex flex-col">
                  <DayPicker
                    fixedWeeks
                    mode="range"
                    numberOfMonths={2}
                    selected={tempDate}
                    onSelect={(value) => {
                      if (!value) {
                        setTempDate(undefined);
                        return;
                      }
                      setTempDate({
                        from: value.from ? new Date(value.from) : undefined,
                        to: value.to ? new Date(value.to) : undefined,
                      });
                    }}
                  />
                  <div className="flex items-center justify-end gap-2 p-3 border-t border-slate-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTempDate(undefined);
                        setDate(undefined);
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      disabled={!tempDate?.from}
                      onClick={() => {
                        setDate(tempDate);
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
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
