import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get("organizationId");

  if (!organizationId) return new Response(null, { status: 400 });

  const groups = await prisma.group.findMany({
    where: {
      organizationId,
    },
    include: {
      students: true,
    },
  });

  return Response.json(groups);
} 