export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import RehearsalAttendance from "@/components/RehearsalAttendance";

export default async function RehearsalViewPage({
  params,
}: {
  params: { rehearsalId: string };
}) {
  const rehearsal = await prisma.rehearsal.findUnique({
    where: { id: params.rehearsalId },
    include: {
      organization: true,
      groups: {
        include: {
          students: true,
        },
      },
    },
  });

  if (!rehearsal) {
    notFound();
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <RehearsalAttendance rehearsalId={params.rehearsalId} />
    </div>
  );
}
