import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreateGroupClient from "@/components/CreateGroupClient";

export default async function CreateGroupPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      organizations: {
        include: {
          students: true,
        },
      },
    },
  });

  if (!user?.organizations[0]) redirect("/");

  return (
    <CreateGroupClient
      initialStudents={user.organizations[0].students}
      organizationId={user.organizations[0].id}
    />
  );
}
