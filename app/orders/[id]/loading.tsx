import { Skeleton } from '@/components/ui/Skeleton';

export default function OrderDetailLoading() {
  return (
    <main className="min-h-screen bg-bloom-bg pt-24 pb-20 px-6">
      <div className="max-w-[800px] mx-auto space-y-6">
        {/* Top breadcrumb & back button */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-20 rounded-pill" />
          <Skeleton className="h-4 w-40 rounded" />
        </div>

        {/* Status card */}
        <div className="bg-white rounded-2xl border border-bloom-border shadow-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-6 w-48 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
          <Skeleton className="h-4 w-3/4 rounded" />
          <div className="pt-6 border-t border-bloom-border">
            <div className="flex justify-between items-center gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Items & Shipping Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Items */}
          <div className="bg-white rounded-2xl border border-bloom-border shadow-card p-6 space-y-4">
            <Skeleton className="h-5 w-32 rounded" />
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 pt-3 first:pt-0">
                  <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                  </div>
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-bloom-border flex justify-between">
              <Skeleton className="h-5 w-16 rounded" />
              <Skeleton className="h-6 w-24 rounded" />
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-2xl border border-bloom-border shadow-card p-6 space-y-4">
            <Skeleton className="h-5 w-40 rounded" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-4 w-44 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
