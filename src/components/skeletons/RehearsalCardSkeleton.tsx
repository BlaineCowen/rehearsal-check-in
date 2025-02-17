export default function RehearsalCardSkeleton() {
  return (
    <div className="p-6 rounded-xl border bg-slate-800 animate-pulse">
      <div className="h-6 w-48 bg-slate-700 rounded mb-2"></div>
      <div className="h-4 w-32 bg-slate-700 rounded mb-4"></div>
      <div className="flex gap-2">
        <div className="h-10 w-32 bg-slate-700 rounded"></div>
        <div className="h-10 w-32 bg-slate-700 rounded"></div>
      </div>
    </div>
  );
}
