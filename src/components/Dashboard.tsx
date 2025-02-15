"use client";

import Link from "next/link";
import { Organization } from "@prisma/client";

export default function Dashboard({
  organization,
}: {
  organization: Organization;
}) {
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
          description="View and manage student records"
          href="/students"
          buttonText="View Students"
        />

        <DashboardCard
          title="Attendance"
          description="Review attendance history"
          href="/attendance"
          buttonText="View Attendance"
        />

        <DashboardCard
          title="New Rehearsal"
          description="Start a new rehearsal session"
          href="/rehearsals/new"
          buttonText="Start Rehearsal"
          accent="bg-blue-100"
        />

        <DashboardCard
          title="Reports"
          description="Generate attendance reports"
          href="/reports"
          buttonText="Create Report"
        />
        <DashboardCard
          title="Edit Groups"
          description="Edit groups"
          href="/groups"
          buttonText="Edit Groups"
        />
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  description,
  href,
  buttonText,
  accent = "bg-white",
}: {
  title: string;
  description: string;
  href: string;
  buttonText: string;
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
    </div>
  );
}
