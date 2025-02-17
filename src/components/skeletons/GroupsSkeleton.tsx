export default function GroupsSkeleton() {
  return (
    <div className="p-8 animate-pulse">
      <div className="h-10 w-32 bg-slate-700 rounded mb-6"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-6 rounded-xl border bg-slate-800">
            <div className="h-6 w-32 bg-slate-700 rounded mb-2"></div>
            <div className="h-4 w-24 bg-slate-700 rounded mb-4"></div>
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-slate-700 rounded"></div>
              <div className="h-8 w-20 bg-slate-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
