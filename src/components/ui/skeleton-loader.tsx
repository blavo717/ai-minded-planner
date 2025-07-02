import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  children?: React.ReactNode;
}

const SkeletonLoader = ({ className, children }: SkeletonLoaderProps) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50",
        className
      )}
    >
      {children}
    </div>
  );
};

const TaskCardSkeleton = () => {
  return (
    <div className="space-y-3">
      <div className="bg-task-card border border-task-card-border rounded-lg p-5 animate-shimmer bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 bg-[length:200px_100%]">
        {/* Header skeleton */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <SkeletonLoader className="h-7 w-7 rounded-full" />
            <div className="space-y-2 flex-1">
              <SkeletonLoader className="h-5 w-3/4" />
              <SkeletonLoader className="h-3 w-1/2" />
            </div>
          </div>
          <SkeletonLoader className="h-8 w-8 rounded-full" />
        </div>

        {/* Status and priority skeleton */}
        <div className="flex items-center justify-between">
          <SkeletonLoader className="h-6 w-20 rounded-full" />
          <SkeletonLoader className="h-6 w-16 rounded-full" />
        </div>

        {/* Timestamp skeleton */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <SkeletonLoader className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
};

export { SkeletonLoader, TaskCardSkeleton };