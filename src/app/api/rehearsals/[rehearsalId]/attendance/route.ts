import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ rehearsalId: string }> }
) {
  try {
    const session = await auth();
    const params = await context.params;
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rehearsalId } = params;

    // Get the rehearsal with its groups and all students in those groups
    const rehearsal = await prisma.rehearsal.findUnique({
      where: { id: rehearsalId },
      include: {
        groups: {
          include: {
            students: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                studentId: true,
              },
            },
          },
        },
        attendance: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                studentId: true,
              },
            },
          },
          orderBy: {
            checkInTime: "desc",
          },
        },
      },
    });

    if (!rehearsal) {
      return NextResponse.json({ error: "Rehearsal not found" }, { status: 404 });
    }

    // Get all unique students from all groups
    const allStudents = new Map();
    rehearsal.groups.forEach(group => {
      group.students.forEach(student => {
        allStudents.set(student.id, student);
      });
    });

    // Create present and absent lists
    const presentStudents = rehearsal.attendance;
    const absentStudents = Array.from(allStudents.values())
      .filter(student => !presentStudents.find(a => a.student.id === student.id))
      .map(student => ({
        student,
        status: "absent" as const,
      }));

    return NextResponse.json({
      present: presentStudents,
      absent: absentStudents,
      totalStudents: allStudents.size,
    });
  } catch (error) {
    console.error("Failed to fetch attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
} 