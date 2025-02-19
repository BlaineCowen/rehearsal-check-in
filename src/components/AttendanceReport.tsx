"use client";

import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import ReportsSkeleton from "@/components/skeletons/ReportsSkeleton";
import AttendanceTableDate from "./AttendanceTableDate";
import AttendanceByRehearsal from "./AttendanceByRehearsal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AttendanceReport({
  organizationId,
}: {
  organizationId: string;
}) {
  const initialDate = {
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  };

  const { data, isPending } = useQuery({
    queryKey: ["attendance-report", organizationId],
    queryFn: async () => {
      const res = await fetch(
        `/api/reports/attendance?organizationId=${organizationId}`
      );
      if (!res.ok) throw new Error("Failed to fetch report");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isPending) {
    return <ReportsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Attendance Report</h1>
      <Tabs defaultValue="by-date" className="space-y-6">
        <TabsList>
          <TabsTrigger value="by-date">By Date Range</TabsTrigger>
          <TabsTrigger value="by-rehearsal">By Rehearsal</TabsTrigger>
        </TabsList>
        <TabsContent value="by-date">
          <AttendanceTableDate
            rehearsals={data.rehearsals}
            initialDate={initialDate}
          />
        </TabsContent>
        <TabsContent value="by-rehearsal">
          <AttendanceByRehearsal rehearsals={data.rehearsals} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
