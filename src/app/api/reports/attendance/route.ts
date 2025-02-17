import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!organizationId) {
      return Response.json({ error: "Missing organizationId" }, { status: 400 });
    }

    // Get all students in the organization
    const students = await prisma.student.findMany({
      where: { organizationId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        studentId: true,
      },
    });

    // Get all rehearsals for the organization within date range
    const rehearsals = await prisma.rehearsal.findMany({
      where: {
        organizationId,
        ...(from && { date: { gte: new Date(from) } }),
        ...(to && { date: { lte: new Date(to) } }),
      },
      include: {
        attendance: {
          select: {
            studentId: true,
          },
        },
        groups: {
          select: {
            students: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    // Calculate attendance for each student
    const studentAttendance = students.map(student => {
      const eligibleRehearsals = rehearsals.filter(r => 
        r.groups.some(g => g.students.some(s => s.id === student.id))
      );
      const totalRehearsals = eligibleRehearsals.length;
      const attended = eligibleRehearsals.filter(r => 
        r.attendance.some(a => a.studentId === student.id)
      ).length;

      return {
        student,
        totalRehearsals,
        attended,
        absent: totalRehearsals - attended,
        attendanceRate: totalRehearsals ? (attended / totalRehearsals) * 100 : 0,
      };
    });

    return Response.json({
      students: studentAttendance,
      totalRehearsals: rehearsals.length,
    });
  } catch (error) {
    console.error("Failed to generate report:", error);
    return Response.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
} 