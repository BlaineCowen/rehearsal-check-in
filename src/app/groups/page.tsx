import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import GroupsPage from "@/components/GroupsPage";

export default async function Groups() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      organizations: {
        include: {
          groups: {
            include: {
              students: true,
            },
          },
        },
      },
    },
  });

  if (!user?.organizations[0]) redirect("/");

  return (
    <GroupsPage
      groups={user.organizations[0].groups}
      organizationId={user.organizations[0].id}
    />
  );
}
