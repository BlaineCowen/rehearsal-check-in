import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { rehearsalId: string } }
) {
  try {
    const { rehearsalId } = params;

    const rehearsal = await prisma.rehearsal.update({
      where: { id: rehearsalId },
      data: { active: false },
    });

    return Response.json(rehearsal);
  } catch (error) {
    console.error("Failed to end rehearsal:", error);
    return Response.json(
      { error: "Failed to end rehearsal" },
      { status: 500 }
    );
  }
} 