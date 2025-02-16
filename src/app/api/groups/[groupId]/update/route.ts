import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(
  req: Request,
  context: { params: { groupId: string } }
) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get("organizationId");
  const { groupId } = await context.params;

  if (!organizationId) {
    return new Response(null, { status: 400 });
  }

  const checkOrganization = await prisma.user.findUnique({
    where: {
      id: session?.user?.id,
    },
    select: {
      organizations: true,
    },
  });

  if (organizationId !== checkOrganization?.organizations[0]?.id) {
    return new Response(null, { status: 401 });
  }

  const { name, studentIds } = await req.json();

  try {
    const updatedGroup = await prisma.group.update({
      where: {
        id: groupId,
      },
      data: {
        name,
        students: {
          set: [], // First clear all connections
          connect: studentIds.map((id: string) => ({ id })), // Then connect new ones
        },
      },
      include: {
        students: true,
      },
    });

    return Response.json(updatedGroup);
  } catch (error) {
    console.error("Failed to update group:", error);
    return new Response(null, { status: 500 });
  }
} 