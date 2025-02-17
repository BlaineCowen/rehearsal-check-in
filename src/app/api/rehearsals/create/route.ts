import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizationId, groupIds } = await req.json();

    const rehearsal = await prisma.rehearsal.create({
      data: {
        organizationId,
        date: new Date(),
        userId: session.user.id,
        active: true,
        groups: {
          connect: groupIds.map((id: string) => ({ id })),
        },
      },
      include: {
        groups: true,
      },
    });

    return NextResponse.json(rehearsal);
  } catch (error) {
    console.error("Failed to create rehearsal:", error);
    return NextResponse.json(
      { error: "Failed to create rehearsal" },
      { status: 500 }
    );
  }
}
