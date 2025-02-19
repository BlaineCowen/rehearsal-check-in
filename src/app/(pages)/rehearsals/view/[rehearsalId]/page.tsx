export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import RehearsalAttendance from "@/components/RehearsalAttendance";
import { useUser } from "@/hooks/useUser";
export default async function RehearsalViewPage(props: {
  params: Promise<{ rehearsalId: string }>;
}) {
  const params = await props.params;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <RehearsalAttendance rehearsalId={params.rehearsalId} />
    </div>
  );
}
