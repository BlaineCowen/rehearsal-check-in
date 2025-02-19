// this route will update the students in the database

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { Student, Prisma } from "@prisma/client";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const { students, organizationId } = await request.json();

      // Validate input
      if (!students || !Array.isArray(students)) {
        return NextResponse.json(
          { error: "Invalid students data" },
          { status: 400 }
        );
      }

      // Deduplicate students by studentId
      const uniqueStudents = Array.from(
        new Map(students.map(s => [s.studentId, s])).values()
      );

      // Get existing students
      const existingStudents = await prisma.student.findMany({
        where: { organizationId },
      });

      // Create a map of existing studentIds for faster lookup
      const existingStudentMap = new Map(
        existingStudents.map(s => [s.studentId, s])
      );

      const updates: Prisma.StudentUpdateArgs[] = [];
      const creates: Prisma.StudentCreateArgs[] = [];

      for (const student of uniqueStudents) {
        // Validate student data
        if (!student.firstName || !student.lastName || !student.studentId) {
          console.error("Invalid student data:", student);
          continue;
        }

        const existingStudent = existingStudentMap.get(student.studentId);

        if (existingStudent) {
          // Only update if data has changed
          if (
            existingStudent.firstName !== student.firstName ||
            existingStudent.lastName !== student.lastName ||
            existingStudent.grade !== student.grade
          ) {
            updates.push({
              where: { id: existingStudent.id },
              data: {
                firstName: student.firstName,
                lastName: student.lastName,
                grade: student.grade === null ? "0" : student.grade,
              },
            });
          }
        } else {
          creates.push({
            data: {
              firstName: student.firstName,
              lastName: student.lastName,
              studentId: student.studentId,
              grade: student.grade === null ? "0" : student.grade,
              organizationId,
            },
          });
        }
      }

      // Get the "All" group
      const allGroup = await prisma.group.findFirst({
        where: {
          name: "All",
          organizationId,
        },
      });

      // Execute operations only if there are changes
      if (updates.length > 0 || creates.length > 0) {
        const results = await prisma.$transaction(async (tx) => {
          // Perform updates
          const updatedStudents = await Promise.all(
            updates.map(update => tx.student.update(update))
          );

          // Perform creates
          const createdStudents = await Promise.all(
            creates.map(create => tx.student.create(create))
          );

          // Add new students to "All" group if it exists
          if (allGroup && createdStudents.length > 0) {
            await tx.group.update({
              where: { id: allGroup.id },
              data: {
                students: {
                  connect: createdStudents.map(student => ({ id: student.id })),
                },
              },
            });
          }

          return [...updatedStudents, ...createdStudents];
        });

        console.log("Transaction completed:", {
          updatesCount: updates.length,
          createsCount: creates.length,
          resultsCount: results.length,
          addedToAllGroup: allGroup ? creates.length : 0,
        });
      }

      return NextResponse.json({ 
        success: true,
        updated: updates.length,
        created: creates.length,
        skipped: students.length - (updates.length + creates.length),
        addedToAllGroup: allGroup ? creates.length : 0,
      });

    } catch (error: any) {
      console.error("Detailed error:", {
        name: error.name,
        message: error.message,
        code: error.code,
        meta: error.meta,
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return NextResponse.json(error.meta?.target, { status: 400 });
        }
        if (error.code === 'P2034') {
          retries++;
          continue;
        }
      }

      return NextResponse.json(
        { error: "Failed to update students", details: error.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: "Max retries exceeded" },
    { status: 500 }
  );
}


