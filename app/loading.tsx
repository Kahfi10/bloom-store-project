import { ProductGridSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section Skeleton */}
      <div className="relative h-[65vh] min-h-[500px] w-full bg-bloom-surface skeleton-shimmer flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-[600px] px-6 text-center">
          <Skeleton className="h-4 w-40 rounded-full" />
          <Skeleton className="h-12 w-80 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-full mt-2" />
          <div className="flex gap-4 mt-6">
            <Skeleton className="h-12 w-36 rounded-pill" />
            <Skeleton className="h-12 w-32 rounded-pill" />
          </div>
        </div>
      </div>

      {/* Product Grid Section Skeleton */}
      <div className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="flex flex-col items-center gap-3 mb-14 text-center">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-full" />
        </div>
        <ProductGridSkeleton count={6} />
      </div>
    </div>
  );
}
