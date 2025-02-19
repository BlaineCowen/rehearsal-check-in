import { Group, Student, Rehearsal, Attendance } from "@prisma/client";

export type GroupWithStudents = Group & {
  students: Student[];
};

export type RehearsalWithRelations = Rehearsal & {
  groups: (Group & {
    students: Student[];
  })[];
  attendance: (Attendance & {
    student: Student;
  })[];
}; 