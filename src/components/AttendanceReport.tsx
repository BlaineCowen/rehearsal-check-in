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
    <div className="container mx-auto p-4 pt-24 space-y-4 max-w-6xl">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Attendance Report</h1>
        <Tabs defaultValue="by-date" className="space-y-6">
          <TabsList className="rounded-lg">
            <TabsTrigger
              className="hover:bg-base-100 data-[state=active]:border-b-2 data-[state=active]:border-primary"
              value="by-date"
            >
              By Date Range
            </TabsTrigger>
            <TabsTrigger
              className="hover:bg-base-100 data-[state=active]:border-b-2 data-[state=active]:border-primary"
              value="by-rehearsal"
            >
              By Rehearsal
            </TabsTrigger>
          </TabsList>
          <TabsContent value="by-date" className="w-full">
            <div className="rounded-md">
              <AttendanceTableDate
                rehearsals={data.rehearsals}
                initialDate={initialDate}
              />
            </div>
          </TabsContent>
          <TabsContent value="by-rehearsal">
            <AttendanceByRehearsal rehearsals={data.rehearsals} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
