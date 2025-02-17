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
  const [date, setDate] = useState<DateRange | undefined>();
  const [tempDate, setTempDate] = useState<DateRange | undefined>();

  const columns: ColumnDef<StudentAttendance>[] = [
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

  const { data, isLoading } = useQuery({
    queryKey: ["attendance-report", organizationId, date?.from, date?.to],
    queryFn: async () => {
      const params = new URLSearchParams({
        organizationId,
        ...(date?.from && { from: date.from.toISOString() }),
        ...(date?.to && { to: date.to.toISOString() }),
      });

      const res = await fetch(`/api/reports/attendance?${params}`);
      if (!res.ok) throw new Error("Failed to fetch report");
      return res.json();
    },
  });

  const table = useReactTable({
    data: data?.students || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
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
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={tempDate?.from}
                    selected={tempDate}
                    onSelect={setTempDate}
                    numberOfMonths={2}
                    classNames={{
                      months: "flex space-x-4",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium text-white",
                      nav: "space-x-1 flex items-center",
                      nav_button:
                        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell:
                        "text-slate-400 rounded-md w-8 font-normal text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                      day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-800 text-white",
                      day_range_end: "rounded-r-md",
                      day_range_start: "rounded-l-md",
                      day_selected:
                        "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-500",
                      day_today: "bg-slate-800 text-white",
                      day_outside: "text-slate-500 opacity-50",
                      day_disabled: "text-slate-500 opacity-50",
                      day_range_middle: "aria-selected:bg-blue-800/50",
                      day_hidden: "invisible",
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
                      disabled={!tempDate?.from || !tempDate?.to}
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
