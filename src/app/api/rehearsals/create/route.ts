import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(null, { status: 401 });
  }

  try {
    const { groupIds, date } = await req.json();

    // Get organization from first group
    const group = await prisma.group.findUnique({
      where: { id: groupIds[0] },
      select: { organizationId: true },
    });

    if (!group) {
      return new Response(null, { status: 400 });
    }

    // First create the rehearsal
    const rehearsal = await prisma.rehearsal.create({
      data: {
        date: new Date(date),
        userId: session.user.id,
        organizationId: group.organizationId,
        groups: {
          connect: groupIds.map((id: string) => ({ id })),
        },
      },
      include: {
        groups: {
          include: {
            students: true,
          },
        },
      },
    });

    return Response.json(rehearsal);
  } catch (error) {
    console.error("Failed to create rehearsal:", error);
    return new Response(null, { status: 500 });
  }
}
