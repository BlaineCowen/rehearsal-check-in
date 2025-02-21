import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ rehearsalId: string }> }
) {
  const params = await context.params;
  try {
    const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      // Delete attendance records first (foreign key constraint)
      await prisma.attendance.deleteMany({
        where: {
          rehearsalId: params.rehearsalId,
        },
      });
  
      // Then delete the rehearsal
    await prisma.rehearsal.delete({
      where: {
        id: params.rehearsalId,
      },
    });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Failed to delete rehearsal:", error);
      return NextResponse.json(
      { error: "Failed to delete rehearsal" },
      { status: 500 }
    );
  }
}
