import { Group, Student } from "@prisma/client";

export type GroupWithStudents = Group & {
  students: Student[];
};