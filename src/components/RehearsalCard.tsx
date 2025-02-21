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
    <div className="p-6 rounded-xl border border-primary bg-accent">
      <h3 className="text-xl font-semibold text-primary-content mb-2">
        Active Rehearsal
      </h3>
      <p className="text-accent-content mb-4">
        Started at {new Date(rehearsal.date).toLocaleTimeString()}
      </p>
      <div className="flex gap-2">
        <Link
          href={`/rehearsals/view/${rehearsal.id}`}
          className="flex-1 text-center py-2  bg-primary text-primary-content rounded-lg hover:bg-primary/80 transition-colors"
        >
          View
        </Link>
        <button
          onClick={() => endRehearsal(rehearsal.id)}
          className="py-2 px-4 bg-error text-error-content rounded-lg hover:bg-error/80 transition-colors"
        >
          End Rehearsal
        </button>
      </div>
    </div>
  );
}
