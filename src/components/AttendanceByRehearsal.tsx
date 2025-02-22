"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { RehearsalWithRelations } from "@/types";
import { Check, X, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { mkConfig, generateCsv, download } from "export-to-csv";

interface AttendanceByRehearsalProps {
  rehearsals: RehearsalWithRelations[];
}

type StudentAttendanceRow = {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  isPresent: boolean;
  groupName: string;
};

type ExportRow = {
  "Student ID": string;
  "First Name": string;
  "Last Name": string;
  Group: string;
  Attendance: string;
};

export default function AttendanceByRehearsal({
  rehearsals,
}: AttendanceByRehearsalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedRehearsalId, setSelectedRehearsalId] =
    React.useState<string>("");

  const selectedRehearsal = React.useMemo(
    () => rehearsals.find((r) => r.id === selectedRehearsalId),
    [rehearsals, selectedRehearsalId]
  );

  const attendanceRows = React.useMemo(() => {
    if (!selectedRehearsal) return [];

    const rows: StudentAttendanceRow[] = [];
    selectedRehearsal.groups.forEach((group) => {
      group.students.forEach((student) => {
        rows.push({
          id: student.id,
          studentId: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          isPresent: selectedRehearsal.attendance.some(
            (a) => a.studentId === student.id
          ),
          groupName: group.name,
        });
      });
    });

    return rows.sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [selectedRehearsal]);

  const handleDelete = async () => {
    if (!selectedRehearsalId) return;

    if (!confirm("Are you sure you want to delete this rehearsal?")) return;

    try {
      const response = await fetch(`/api/rehearsals/${selectedRehearsalId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete rehearsal");
      }

      toast({
        description: "Rehearsal deleted successfully",
        className: "bg-green-500 text-white",
      });

      // Clear the selected rehearsal
      setSelectedRehearsalId("");

      // Force a hard refresh to ensure data is updated
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        description:
          error instanceof Error ? error.message : "Error deleting rehearsal",
        variant: "destructive",
      });
    }
  };

  const csvConfig = mkConfig({
    fieldSeparator: ",",
    filename: `rehearsal-attendance-${format(new Date(), "yyyy-MM-dd")}`,
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  });

  const exportToCsv = (rows: StudentAttendanceRow[]) => {
    const rowData: ExportRow[] = rows.map((row) => ({
      "Student ID": row.studentId,
      "First Name": row.firstName,
      "Last Name": row.lastName,
      Group: row.groupName,
      Attendance: row.isPresent ? "Present" : "Absent",
    }));

    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="w-[300px]">
          <div className="flex items-left mb-2 gap-2">
            <Select
              value={selectedRehearsalId}
              onValueChange={setSelectedRehearsalId}
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Select a rehearsal" />
              </SelectTrigger>
              <SelectContent className="bg-base-300">
                {rehearsals.map((rehearsal) => (
                  <SelectItem
                    className="hover:text-accent-content"
                    key={rehearsal.id}
                    value={rehearsal.id}
                  >
                    {format(new Date(rehearsal.date), "MM/dd")} –{" "}
                    {rehearsal.groups.map((g) => g.name).join(", ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRehearsalId && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCsv(attendanceRows)}
              >
                Export to CSV
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Rehearsal
              </Button>
            </div>
          )}
        </div>
      </div>

      {selectedRehearsal && (
        <div className="rounded-md border max-h-[600px] overflow-auto">
          <Table className="rounded-md">
            <TableHeader className="bg-base-100 rounded-md sticky top-0">
              <TableRow className="rounded-md">
                <TableHead>Student ID</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.studentId}</TableCell>
                  <TableCell>{row.firstName}</TableCell>
                  <TableCell>{row.lastName}</TableCell>
                  <TableCell>{row.groupName}</TableCell>
                  <TableCell>
                    {row.isPresent ? (
                      <Check className="text-green-500" />
                    ) : (
                      <X className="text-red-500" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Toaster />
        </div>
      )}
    </div>
  );
}
