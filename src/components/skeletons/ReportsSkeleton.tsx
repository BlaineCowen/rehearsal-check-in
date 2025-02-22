export default function ReportsSkeleton() {
  return (
    <div className="space-y-6 p-8 pt-24 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-slate-700 rounded"></div>
        <div className="h-10 w-64 bg-slate-700 rounded"></div>
      </div>

      <div className="rounded-md border">
        <div className="p-4">
          <div className="grid grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-slate-700 rounded"></div>
            ))}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 mt-4">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="h-6 bg-slate-700/50 rounded"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
