"use client";

import React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { mkConfig, generateCsv, download } from "export-to-csv";
import {
  ColumnDef,
  Row,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { RehearsalWithRelations } from "@/types";
import { isWithinInterval } from "date-fns";

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

type ExportRow = {
  ID: string;
  "First Name": string;
  "Last Name": string;
  Rehearsals: number;
  Attended: number;
  Absent: number;
  "Attendance Rate": string;
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

interface AttendanceTableDateProps {
  rehearsals: RehearsalWithRelations[];
  initialDate: DateRange;
}

export default function AttendanceTableDate({
  rehearsals,
  initialDate,
}: AttendanceTableDateProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [date, setDate] = React.useState<DateRange>(initialDate);
  const [tempDate, setTempDate] = React.useState<DateRange | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const csvConfig = mkConfig({
    fieldSeparator: ",",
    filename: `attendance-report-${format(new Date(), "yyyy-MM-dd")}`,
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  });

  const exportExcel = (rows: Row<StudentAttendance>[]) => {
    const rowData: ExportRow[] = rows.map((row) => ({
      ID: row.original.student.studentId,
      "First Name": row.original.student.firstName,
      "Last Name": row.original.student.lastName,
      Rehearsals: row.original.totalRehearsals,
      Attended: row.original.attended,
      Absent: row.original.absent,
      "Attendance Rate": `${row.original.attendanceRate.toFixed(1)}%`,
    }));

    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  // Filter rehearsals based on selected date range
  const filteredRehearsals = React.useMemo(() => {
    return rehearsals.filter((rehearsal) => {
      const rehearsalDate = new Date(rehearsal.date);
      if (!date.from || !date.to) return false;
      return isWithinInterval(rehearsalDate, {
        start: date.from,
        end: date.to,
      });
    });
  }, [rehearsals, date]);

  // Calculate attendance statistics from filtered rehearsals
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

  const columns: ColumnDef<StudentAttendance>[] = [
    {
      accessorKey: "student.studentId",
      header: ({ column }) => (
        <SortableHeader column={column}>ID</SortableHeader>
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
        <SortableHeader column={column}>Rehearsals</SortableHeader>
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

  const table = useReactTable({
    data: attendanceStats,
    columns,
    state: { sorting },
    // defaultColumn: {
    //   size: 10,
    //   maxSize: 10,
    //   minSize: 10,
    // },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="grid gap-2">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      disabled={!tempDate?.from}
                      onClick={() => {
                        if (tempDate?.from) {
                          setDate({
                            from: tempDate.from,
                            to: tempDate.to,
                          });
                          setIsCalendarOpen(false);
                        }
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button
            onClick={() => exportExcel(table.getRowModel().rows)}
            variant="outline"
            size="sm"
          >
            Export to CSV
          </Button>
        </div>
      </div>

      <div className="rounded-md border max-h-[600px] overflow-auto ">
        <Table className="rounded-md mt-1">
          <TableHeader className="bg-base-100 z-10 sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="border-b border-white" key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="bg-base-300 border-b border-white z-10 sticky top-0"
                  >
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
