import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer rounded-md ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="relative bg-white rounded-card shadow-card flex flex-col overflow-hidden border border-bloom-border/40">
      {/* Image Skeleton */}
      <div className="relative aspect-square bg-bloom-surface overflow-hidden">
        <Skeleton className="w-full h-full rounded-none" />
        <div className="absolute top-3 left-3 w-16 h-5 rounded-pill bg-white/70 backdrop-blur-sm" />
      </div>

      {/* Body Skeleton */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>

        <Skeleton className="h-4 w-full rounded mt-1" />
        <Skeleton className="h-4 w-4/5 rounded" />

        <div className="flex items-center justify-between gap-3 pt-4 mt-auto border-t border-bloom-border/60">
          <Skeleton className="h-6 w-24 rounded" />
          <Skeleton className="h-9 w-24 rounded-pill" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 lg:py-16">
      {/* Back button */}
      <Skeleton className="h-8 w-24 rounded-pill mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Gallery Skeleton */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square rounded-card overflow-hidden">
            <Skeleton className="w-full h-full rounded-card" />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-20 h-20 rounded-xl flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* Info Skeleton */}
        <div className="flex flex-col gap-6">
          <div>
            <Skeleton className="h-5 w-24 rounded-pill mb-3" />
            <Skeleton className="h-10 w-3/4 rounded mb-2" />
            <Skeleton className="h-4 w-1/3 rounded italic" />
          </div>

          <Skeleton className="h-8 w-36 rounded" />
          <div className="space-y-2 pt-4 border-t border-bloom-border/60">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-4/6 rounded" />
          </div>

          {/* Fact cards */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl col-span-2" />
          </div>

          {/* Add to cart widget */}
          <div className="pt-6 border-t border-bloom-border/60 flex gap-4 items-center">
            <Skeleton className="h-12 w-32 rounded-pill" />
            <Skeleton className="h-12 flex-1 rounded-pill" />
          </div>
        </div>
      </div>
    </div>
  );
}
