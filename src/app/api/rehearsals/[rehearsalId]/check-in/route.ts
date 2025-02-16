import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { rehearsalId: string } }
) {
  try {
    const { studentId } = await req.json();
    const { rehearsalId } = params;

    // Find the student and check if they're in any of the rehearsal's groups
    const student = await prisma.student.findFirst({
      where: {
        studentId,
        groups: {
          some: {
            rehearsalId,
          },
        },
      },
    });

    if (!student) {
      return Response.json(
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
      return Response.json(
        { error: "Student already checked in" },
        { status: 400 }
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

    return Response.json({
      message: "Check-in successful",
      student: attendance.student,
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return Response.json(
      { error: "Failed to process check-in" },
      { status: 500 }
    );
  }
} 