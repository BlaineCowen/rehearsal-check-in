import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, organizationId, studentIds } = await req.json();

    const group = await prisma.group.create({
      data: {
        name,
        organizationId,
        students: {
          connect: studentIds.map((id: string) => ({ id })),
        },
      },
      include: {
        students: true,
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
} 