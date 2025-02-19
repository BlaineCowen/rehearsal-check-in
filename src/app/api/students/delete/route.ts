import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { studentIds, organizationId } = await request.json();

    if (!studentIds || !organizationId) {
      return NextResponse.json(
        { error: "Missing studentIds or organizationId" },
        { status: 400 }
      );
    }

    // Get all groups for this organization
    const groups = await prisma.group.findMany({
      where: { organizationId }
    });

    // Update each group individually
    await Promise.all(
      groups.map(group =>
        prisma.group.update({
          where: { id: group.id },
          data: {
            students: {
              disconnect: studentIds.map((id: any) => ({ id }))
            }
          }
        })
      )
    );

    // Delete students
    await prisma.student.deleteMany({
      where: {
        id: { in: studentIds },
        organizationId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete students:", error);
    return NextResponse.json(
      { error: "Failed to delete students" },
      { status: 500 }
    );
  }
} 