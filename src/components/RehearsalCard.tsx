"use client";

import { Rehearsal } from "@prisma/client";
import Link from "next/link";
import { useEndRehearsal } from "@/hooks/useUser";
import RehearsalCardSkeleton from "@/components/skeletons/RehearsalCardSkeleton";

export default function RehearsalCard({ rehearsal }: { rehearsal: Rehearsal }) {
  const { mutate: endRehearsal, isPending } = useEndRehearsal();

  if (isPending) {
    return <RehearsalCardSkeleton />;
  }

  return (
    <div className="p-6 rounded-xl border bg-green-100">
      <h3 className="text-xl font-semibold mb-2">Active Rehearsal</h3>
      <p className="text-gray-600 mb-4">
        Started at {new Date(rehearsal.date).toLocaleTimeString()}
      </p>
      <div className="flex gap-2">
        <Link
          href={`/attendance/${rehearsal.id}`}
          className="inline-block py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          View
        </Link>
        <button
          onClick={() => endRehearsal(rehearsal.id)}
          className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          End Rehearsal
        </button>
      </div>
    </div>
  );
}
