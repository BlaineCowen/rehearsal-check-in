// change rehearsal to inactive
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(null, { status: 401 });
  }

  const { rehearsalId } = await req.json();

  const rehearsal = await prisma.rehearsal.update({
    where: { id: rehearsalId },
    data: { active: false },
  });

  return new Response(JSON.stringify(rehearsal), { status: 200 });
}