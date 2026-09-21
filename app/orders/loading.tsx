import { Skeleton } from '@/components/ui/Skeleton';

export default function OrdersLoading() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-20 px-6">
      <div className="max-w-[800px] mx-auto space-y-6">
        <Skeleton className="h-8 w-24 rounded-pill" />
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-48 rounded" />
          <Skeleton className="h-5 w-24 rounded" />
        </div>

        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="p-6 rounded-2xl border border-bloom-border/60 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-bloom-border/60">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-6 w-24 rounded-pill" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
            </div>
            <div className="pt-4 border-t border-bloom-border/60 flex justify-between items-center">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-6 w-28 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
