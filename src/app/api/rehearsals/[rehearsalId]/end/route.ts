import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ rehearsalId: string }> }
) {
  try {
    const params = await context.params;
    const { rehearsalId } = params;

    const rehearsal = await prisma.rehearsal.update({
      where: { id: rehearsalId },
      data: { active: false },
    });

    return NextResponse.json(rehearsal);
  } catch (error) {
    console.error("Failed to end rehearsal:", error);
    return NextResponse.json(
      { error: "Failed to end rehearsal" },
      { status: 500 }
    );
  }
} 