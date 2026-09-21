import { Skeleton } from '@/components/ui/Skeleton';

export default function CartLoading() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-20 px-6">
      <div className="max-w-[960px] mx-auto">
        <Skeleton className="h-8 w-24 rounded-pill mb-6" />
        <Skeleton className="h-10 w-48 rounded mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart items skeleton */}
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border border-bloom-border/60">
                <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-6 w-20 rounded" />
                    <Skeleton className="h-8 w-24 rounded-pill" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary skeleton */}
          <div className="p-6 rounded-2xl border border-bloom-border/60 space-y-4">
            <Skeleton className="h-6 w-32 rounded mb-4" />
            <div className="space-y-2">
              <div className="flex justify-between"><Skeleton className="h-4 w-20 rounded" /><Skeleton className="h-4 w-16 rounded" /></div>
              <div className="flex justify-between"><Skeleton className="h-4 w-24 rounded" /><Skeleton className="h-4 w-12 rounded" /></div>
            </div>
            <div className="pt-4 border-t border-bloom-border/60 flex justify-between">
              <Skeleton className="h-6 w-20 rounded" />
              <Skeleton className="h-6 w-24 rounded" />
            </div>
            <Skeleton className="h-12 w-full rounded-pill mt-4" />
          </div>
        </div>
      </div>
    </main>
  );
}
