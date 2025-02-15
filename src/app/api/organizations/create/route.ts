import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, imageUrl } = await req.json();

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        imageUrl,
        userId: user.id,
      }
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error("[ORGANIZATIONS_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 