"use client";

import Link from "next/link";
import { useUser, useActiveRehearsals } from "@/hooks/useUser";
import { Rehearsal } from "@prisma/client";
import RehearsalCard from "@/components/RehearsalCard";
import { useQueryClient } from "@tanstack/react-query";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: user, isPending: userLoading, error } = useUser();
  const organizationId = user?.organizations?.[0]?.id;
  const { data: activeRehearsals, isPending: rehearsalsLoading } =
    useActiveRehearsals(organizationId);
  const queryClient = useQueryClient();

  // Prefetch data for other routes
  useEffect(() => {
    if (organizationId) {
      // Prefetch attendance report data
      queryClient.prefetchQuery({
        queryKey: ["attendance-report", organizationId],
        queryFn: async () => {
          const res = await fetch(
            `/api/reports/attendance?organizationId=${organizationId}`
          );
          if (!res.ok) throw new Error("Failed to fetch report");
          return res.json();
        },
      });

      // Prefetch students data (if you have a students query)
      queryClient.prefetchQuery({
        queryKey: ["students", organizationId],
        queryFn: async () => {
          const res = await fetch(
            `/api/students/get-all?organizationId=${organizationId}`
          );
          if (!res.ok) throw new Error("Failed to fetch students");
          return res.json();
        },
      });

      // Prefetch groups data (if you have a groups query)
      queryClient.prefetchQuery({
        queryKey: ["groups", organizationId],
        queryFn: async () => {
          const res = await fetch(
            `/api/groups?organizationId=${organizationId}`
          );
          if (!res.ok) throw new Error("Failed to fetch groups");
          return res.json();
        },
      });
    }
  }, [organizationId, queryClient]);

  if (error) {
    console.error("User fetch error:", error);
    return <div>Error loading dashboard</div>;
  }

  if (userLoading || rehearsalsLoading) {
    return <DashboardSkeleton />;
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
          description={`${
            organization.students?.length || 0
          } students enrolled`}
          href="students"
          buttonText="View Students"
        />

        <DashboardCard
          title="Groups"
          description={`${organization.groups?.length || 0} active groups`}
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
          <RehearsalCard key={rehearsal.id} rehearsal={rehearsal} />
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
  const { data: user } = useUser();
  const organizationId = user?.organizations?.[0]?.id;
  const queryClient = useQueryClient();

  const prefetchData = () => {
    if (!organizationId) return;

    switch (href) {
      case "students":
        queryClient.prefetchQuery({
          queryKey: ["students", organizationId],
          queryFn: async () => {
            const res = await fetch(
              `/api/students/get-all?organizationId=${organizationId}`
            );
            if (!res.ok) throw new Error("Failed to fetch students");
            return res.json();
          },
        });
        break;
      case "groups":
        queryClient.prefetchQuery({
          queryKey: ["groups", organizationId],
          queryFn: async () => {
            const res = await fetch(
              `/api/groups?organizationId=${organizationId}`
            );
            if (!res.ok) throw new Error("Failed to fetch groups");
            return res.json();
          },
        });
        break;
      case "reports":
        queryClient.prefetchQuery({
          queryKey: ["attendance-report", organizationId],
          queryFn: async () => {
            const res = await fetch(
              `/api/reports/attendance?organizationId=${organizationId}`
            );
            if (!res.ok) throw new Error("Failed to fetch report");
            return res.json();
          },
        });
        break;
    }
  };

  return (
    <div
      className={`p-6 rounded-xl shadow-sm border ${accent}`}
      onMouseEnter={prefetchData}
    >
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
