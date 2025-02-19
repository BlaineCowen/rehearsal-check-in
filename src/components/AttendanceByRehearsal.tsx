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
import { Check, X } from "lucide-react";

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

export default function AttendanceByRehearsal({
  rehearsals,
}: AttendanceByRehearsalProps) {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="w-[300px]">
          <Select
            value={selectedRehearsalId}
            onValueChange={setSelectedRehearsalId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a rehearsal" />
            </SelectTrigger>
            <SelectContent>
              {rehearsals.map((rehearsal) => (
                <SelectItem key={rehearsal.id} value={rehearsal.id}>
                  {format(new Date(rehearsal.date), "LLL dd, y")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedRehearsal && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
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
        </div>
      )}
    </div>
  );
}
