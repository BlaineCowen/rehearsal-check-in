import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get("organizationId");

  if (!organizationId) {
    return NextResponse.json(
      { error: "Organization ID required" },
      { status: 400 }
    );
  }

  const rehearsals = await prisma.rehearsal.findMany({
    where: {
      organizationId,
      active: true
    },
    include: {
      groups: true
    }
  });

  return NextResponse.json(rehearsals);
}