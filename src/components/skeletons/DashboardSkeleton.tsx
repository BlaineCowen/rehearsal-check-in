export default function DashboardSkeleton() {
  return (
    <div className="p-8 max-w-6xl mx-auto animate-pulse">
      <div className="flex justify-between items-center mb-8">
        <div className="h-10 w-64 bg-base-300 rounded"></div>
        <div className="h-10 w-48 bg-base-300 rounded"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 rounded-xl border bg-base-300">
            <div className="h-6 w-32 bg-base-300 rounded mb-2"></div>
            <div className="h-4 w-48 bg-base-300 rounded mb-4"></div>
            <div className="h-10 w-full bg-base-300 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
