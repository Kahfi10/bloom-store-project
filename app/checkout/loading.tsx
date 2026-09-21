import { Skeleton } from '@/components/ui/Skeleton';

export default function CheckoutLoading() {
  return (
    <main className="min-h-screen bg-bloom-bg pt-24 pb-20 px-6">
      <div className="max-w-[1020px] mx-auto">
        <Skeleton className="h-8 w-24 rounded-pill mb-6" />
        <Skeleton className="h-10 w-52 rounded mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Shipping Form Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-bloom-border shadow-card p-6 sm:p-8 space-y-6">
              <Skeleton className="h-6 w-48 rounded" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-bloom-border shadow-card p-6 space-y-5">
              <Skeleton className="h-6 w-36 rounded" />
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-3 w-16 rounded" />
                    </div>
                    <Skeleton className="h-4 w-14 rounded" />
                  </div>
                ))}
              </div>
              <div className="h-px bg-bloom-border" />
              <div className="space-y-2">
                <div className="flex justify-between"><Skeleton className="h-4 w-20 rounded" /><Skeleton className="h-4 w-16 rounded" /></div>
                <div className="flex justify-between"><Skeleton className="h-4 w-24 rounded" /><Skeleton className="h-4 w-12 rounded" /></div>
              </div>
              <div className="h-px bg-bloom-border" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-28 rounded" />
                <Skeleton className="h-6 w-24 rounded" />
              </div>
              <Skeleton className="h-12 w-full rounded-pill mt-4" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
