import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { organizations: true }
  });

  if (!user?.organizations[0]) {
    return NextResponse.json({ error: "No organization found" }, { status: 404 });
  }

  const students = await prisma.student.findMany({
    where: {
      organizationId: user.organizations[0].id
    }
  });

  return NextResponse.json(students);
}