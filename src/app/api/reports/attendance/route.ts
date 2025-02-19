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
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!organizationId) {
      return NextResponse.json({ error: "Missing organizationId" }, { status: 400 });
    }

    // Get all completed rehearsals with attendance data
    const rehearsals = await prisma.rehearsal.findMany({
      where: {
        organizationId,
        active: false,
        ...(from && to && {
          date: {
            gte: new Date(from),
            lte: new Date(to),
          },
        }),
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

    // Transform data to include dates
    const rehearsalsWithDates = rehearsals.map(rehearsal => ({
      ...rehearsal,
      date: rehearsal.date.toISOString(),
    }));

    return NextResponse.json({ rehearsals: rehearsalsWithDates });
  } catch (error) {
    console.error("Failed to fetch attendance report:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance report" },
      { status: 500 }
    );
  }
} 