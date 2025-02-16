import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.organization?.id) {
    return new Response(null, { status: 401 });
  }

  const { name, studentIds } = await req.json();

  try {
    const newGroup = await prisma.group.create({
      data: {
        name,
        organizationId: session.user.organization.id,
        students: {
          connect: studentIds.map((id: string) => ({ id })),
        },
      },
      include: {
        students: true,
      },
    });

    return Response.json(newGroup);
  } catch (error) {
    console.error("Failed to create group:", error);
    return new Response(null, { status: 500 });
  }
} 