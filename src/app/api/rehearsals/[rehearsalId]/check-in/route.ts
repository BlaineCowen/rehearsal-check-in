import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function POST(
  req: NextRequest,
  context: { params: Promise<{ rehearsalId: string }> }
) {
  try {
    const { studentId, organizationId } = await req.json();
    const params = await context.params;
    const { rehearsalId } = params;

    // Find the student and check if they're in any of the rehearsal's groups
    const student = await prisma.student.findFirst({
      select: {
        firstName: true,
        lastName: true,
        id: true,
      },
      where: {
        organizationId: organizationId,
        studentId: studentId,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found or not in this rehearsal" },
        { status: 404 }
      );
    }

    // Check if student is already checked in
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        studentId_rehearsalId: {
          studentId: student.id,
          rehearsalId,
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { message: `${student.firstName} ${student.lastName} is already checked in` },
        { status: 200 }
      );
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        studentId: student.id,
        rehearsalId,
        checkInTime: new Date(),
      },
      include: {
        student: true,
      },
    });

    return NextResponse.json({
      message: "Check-in successful",
      student: attendance.student,
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: "Failed to process check-in" },
      { status: 500 }
    );
  }
} 

