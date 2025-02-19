import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function RegisterPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth");
  }

  // Check if user exists and has an organization
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { organizations: true },
  });

  if (user?.organizations && user.organizations.length > 0) {
    redirect("/");
  }

  redirect("/create-org");
}
