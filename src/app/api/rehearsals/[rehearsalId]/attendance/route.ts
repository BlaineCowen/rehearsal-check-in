import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: { rehearsalId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rehearsalId } = await params;

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
      return Response.json({ error: "Rehearsal not found" }, { status: 404 });
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

    return Response.json({
      present: presentStudents,
      absent: absentStudents,
      totalStudents: allStudents.size,
    });
  } catch (error) {
    console.error("Failed to fetch attendance:", error);
    return Response.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
} 