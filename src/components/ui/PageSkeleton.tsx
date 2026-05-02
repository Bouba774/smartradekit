import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface PageSkeletonProps {
  type?: 'dashboard' | 'list' | 'form' | 'default';
}

/**
 * Shimmer card block — matches the reference design:
 * header strip + icon + 3 lines + nested sub-block.
 */
const ShimmerCard: React.FC = () => (
  <div className="rounded-2xl border border-border/40 bg-card/40 p-4 space-y-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-16" />
    </div>
    {/* Body */}
    <div className="flex items-start gap-3">
      <Skeleton className="h-12 w-16 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <Skeleton className="h-3 w-3 rounded-full mt-2" />
    </div>
    {/* Nested sub-block */}
    <div className="rounded-xl bg-muted/30 p-3 space-y-2">
      <Skeleton className="h-3 w-2/3" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-2.5 w-2.5 rounded-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-3 w-full" />
    </div>
  </div>
);

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ type = 'default' }) => {
  // Same shimmer aesthetic for every type — only the count/shape varies.
  const cardCount = type === 'list' ? 3 : 2;

  return (
    <div className="space-y-4 py-3 px-1">
      {/* Top bars */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
      </div>

      {/* Cards */}
      {Array.from({ length: cardCount }).map((_, i) => (
        <ShimmerCard key={i} />
      ))}

      {/* Bottom bar */}
      <Skeleton className="h-5 w-full mt-4" />
    </div>
  );
};

export default PageSkeleton;
