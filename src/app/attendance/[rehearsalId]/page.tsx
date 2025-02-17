import { prisma } from "@/lib/prisma";
import CheckInForm from "@/components/CheckInForm";
import { notFound } from "next/navigation";

export default async function RehearsalPage(props: {
  params: Promise<{ rehearsalId: string }>;
}) {
  const params = await props.params;
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

  // Prefetch students
  const students = rehearsal.groups.flatMap((g) => g.students);

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckInForm
        rehearsal={rehearsal}
        orgName={rehearsal.organization.name}
        orgImage={rehearsal.organization.imageUrl}
        students={students}
      />
    </div>
  );
}
