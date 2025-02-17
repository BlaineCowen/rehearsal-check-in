import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await auth();
    const params = await context.params;
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, studentIds } = await req.json();

    const updatedGroup = await prisma.group.update({
      where: {
        id: params.groupId,
      },
      data: {
        name,
        students: {
          set: studentIds.map((id: string) => ({ id })),
        },
      },
      include: {
        students: true,
      },
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error("Failed to update group:", error);
    return NextResponse.json({ error: "Failed to update group" }, { status: 500 });
  }
} 