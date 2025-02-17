import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json({ error: "Missing organizationId" }, { status: 400 });
    }

    const rehearsals = await prisma.rehearsal.findMany({
      where: {
        organizationId,
        active: false,
      },
      include: {
        groups: {
          include: {
            students: true,
          },
        },
        attendance: {
          include: {
            student: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(rehearsals);
  } catch (error) {
    console.error("Failed to fetch attendance report:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance report" },
      { status: 500 }
    );
  }
} 