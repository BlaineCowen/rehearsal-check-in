"use client";

import Link from "next/link";
import {
  useUser,
  useStudents,
  useGroups,
  useActiveRehearsals,
} from "@/hooks/useUser";
import { Rehearsal } from "@prisma/client";
import RehearsalCard from "@/components/RehearsalCard";
import { useQueryClient } from "@tanstack/react-query";

export default function Dashboard() {
  const { data: user, isLoading: userLoading, error } = useUser();
  const { data: students } = useStudents();
  const { data: groups } = useGroups();
  const { data: activeRehearsals } = useActiveRehearsals();
  const queryClient = useQueryClient();

  if (error) {
    console.error("User fetch error:", error);
    return <div>Error loading dashboard</div>;
  }

  if (userLoading) {
    console.log("Loading user data...");
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log("No user data");
    return <div>No user found</div>;
  }

  if (!user.organizations?.[0]) {
    window.location.href = "create-org";
    return null;
  }

  const organization = user.organizations[0];

  const handleEndRehearsal = async (rehearsalId: string) => {
    await fetch("/api/rehearsals/end", {
      method: "POST",
      body: JSON.stringify({ rehearsalId }),
    });
    // invalidate active rehearsals query
    queryClient.invalidateQueries({ queryKey: ["activeRehearsals"] });
  };

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">{organization.name} Dashboard</h1>
        <Link
          href="/settings"
          className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Organization Settings
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Students"
          description={`${students?.length || 0} students enrolled`}
          href="students"
          buttonText="View Students"
        />

        <DashboardCard
          title="Groups"
          description={`${groups?.length || 0} active groups`}
          href="groups"
          buttonText="Manage Groups"
        />

        <DashboardCard
          title="New Rehearsal"
          description="Start a new rehearsal session"
          href="rehearsals/new"
          buttonText="Start Rehearsal"
          accent="bg-blue-100"
        />

        <DashboardCard
          title="Reports"
          description="Generate attendance reports"
          href="reports"
          buttonText="Create Report"
        />
        {activeRehearsals?.map((rehearsal: Rehearsal) => (
          <RehearsalCard
            key={rehearsal.id}
            rehearsal={rehearsal}
            onEnd={handleEndRehearsal}
          />
        ))}
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  description,
  href,
  buttonText,
  altButtonText,
  altHref,
  accent = "bg-white",
}: {
  title: string;
  description: string;
  href: string;
  buttonText: string;
  altButtonText?: string;
  altHref?: string;
  accent?: string;
}) {
  return (
    <div className={`p-6 rounded-xl shadow-sm border ${accent}`}>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link
        href={href}
        className="inline-block w-full text-center py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        {buttonText}
      </Link>
      {altButtonText && (
        <Link
          href={altHref || ""}
          className="inline-block w-full text-center py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          {altButtonText}
        </Link>
      )}
    </div>
  );
}
