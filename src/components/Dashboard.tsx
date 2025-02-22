"use client";

import Link from "next/link";
import { useUser, useActiveRehearsals } from "@/hooks/useUser";
import { Rehearsal } from "@prisma/client";
import RehearsalCard from "@/components/RehearsalCard";
import { useQueryClient } from "@tanstack/react-query";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: user, isPending: userLoading, error } = useUser();
  const organizationId = user?.organizations?.[0]?.id;
  const { data: activeRehearsals, isPending: rehearsalsLoading } =
    useActiveRehearsals(organizationId);
  const queryClient = useQueryClient();
  const router = useRouter();
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

  const organization = user.organizations[0];

  return (
    <main className="p-8 pt-24 max-w-6xl mx-auto bg-nuetral-content">
      <div className="flex justify-center mb-8">
        <h1 className="text-4xl text-center font-bold">
          {organization.name} Dashboard
        </h1>
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
          title="Reports"
          description="Generate attendance reports"
          href="reports"
          buttonText="Create Report"
        />
        <DashboardCard
          title="New Rehearsal"
          description="Start a new rehearsal session"
          href="rehearsals/new"
          buttonText="Start Rehearsal"
          accent="primary"
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
  accent = "base-200",
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
      className={`p-6 rounded-xl shadow-sm border border-${accent} bg-base-200  `}
      onMouseEnter={prefetchData}
    >
      <h3 className={`text-xl font-semibold mb-2 text-bg-base-200-content`}>
        {title}
      </h3>
      <p className={`text-bg-base-200-content mb-4`}>{description}</p>
      <Link
        href={href}
        prefetch={true}
        className="inline-block w-full text-center py-2 px-4 bg-primary text-primary-content rounded-lg hover:bg-primary/80 transition-colors"
      >
        {buttonText}
      </Link>
      {altButtonText && (
        <Link
          href={altHref || ""}
          prefetch={true}
          className="inline-block w-full text-center py-2 px-4 bg-secondary text-secondary-content rounded-lg hover:bg-secondary/80 transition-colors"
        >
          {altButtonText}
        </Link>
      )}
    </div>
  );
}
