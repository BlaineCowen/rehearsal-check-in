import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import CreateOrganization from "@/components/CreateOrganization";

export default async function Home() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { organizations: true },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.organizations.length === 0) {
    return <CreateOrganization />;
  }

  return <Dashboard organization={user.organizations[0]} />;
}
