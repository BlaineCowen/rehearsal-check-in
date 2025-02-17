import { prisma } from "@/lib/prisma";
import AttendanceReport from "@/components/AttendanceReport";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { organizations: true },
  });

  if (!user?.organizations[0]?.id) {
    redirect("/create-org");
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <AttendanceReport organizationId={user.organizations[0].id} />
    </div>
  );
}
