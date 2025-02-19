// this route will update the students in the database

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Student } from "@prisma/client";

export async function POST(req: NextRequest) {
  const { students, organizationId } = await req.json();

  if (!students || !organizationId) {
    return NextResponse.json(
      { error: "Missing students or organizationId" },
      { status: 400 }
    );
  }

  try {
    // First, get all existing students for this organization
    const existingStudents = await prisma.student.findMany({
      where: {
        organizationId,
      },
    });

    // Create a map of existing students by studentId for quick lookup
    const existingStudentMap = new Map(
      existingStudents.map(student => [`${student.studentId}-${student.organizationId}`, student])
    );

    // Process each student
    const processedStudents = await Promise.all(
      students.map(async (student: Partial<Student>) => {
        const key = `${student.studentId}-${organizationId}`;
        const existingStudent = existingStudentMap.get(key);

        if (existingStudent) {
          // Update existing student
          return prisma.student.update({
            where: { id: existingStudent.id },
            data: {
              firstName: student.firstName,
              lastName: student.lastName,
              grade: student.grade || null,
            },
          });
        } else {
          // Create new student
          return prisma.student.create({
            data: {
              studentId: student.studentId!,
              firstName: student.firstName!,
              lastName: student.lastName!,
              grade: student.grade || null,
              organizationId,
            },
          });
        }
      })
    );

    // if "All" group exists, update the group
    const allGroup = await prisma.group.findFirst({
      where: {
        name: "All",
        organizationId,
      },
    });
    if (allGroup) {
      await prisma.group.update({
        where: { id: allGroup.id },
        data: { students: { connect: processedStudents.map(student => ({ id: student.id })) } },
      });
    }

    return NextResponse.json(processedStudents, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update students" },
      { status: 500 }
    );
  }
}


