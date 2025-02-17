"use client";

import { Rehearsal } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface RehearsalCardProps {
  rehearsal: Rehearsal;
  onEnd?: (rehearsalId: string) => void;
}

export default function RehearsalCard({
  rehearsal,
  onEnd,
}: RehearsalCardProps) {
  const router = useRouter();

  const handleView = () => {
    router.push(`/rehearsals/view/${rehearsal.id}`);
  };

  const handleEnd = async () => {
    if (!confirm("Are you sure you want to end this rehearsal?")) return;

    try {
      const res = await fetch(`/api/rehearsals/${rehearsal.id}/end`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to end rehearsal");

      if (onEnd) {
        onEnd(rehearsal.id);
      }
    } catch (error) {
      console.error("Failed to end rehearsal:", error);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Active Rehearsal</h3>
        <p className="text-gray-600">{formatDate(new Date(rehearsal.date))}</p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleView}
          className="flex-1 bg-blue-500 hover:bg-blue-600"
        >
          View
        </Button>
        <Button onClick={handleEnd} variant="destructive" className="flex-1">
          End
        </Button>
      </div>
    </Card>
  );
}
