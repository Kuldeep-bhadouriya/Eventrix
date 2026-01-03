import React from 'react';
import { Card } from '@/components/ui/card';

export function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Banner Skeleton */}
      <div className="h-48 animate-pulse bg-gray-200 dark:bg-gray-700" />

      {/* Content Skeleton */}
      <div className="p-6">
        {/* Title */}
        <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />

        {/* Description */}
        <div className="mb-4 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Details */}
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-4 w-4/5 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="mb-1 h-3 w-1/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-2 w-full animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Button */}
        <div className="mt-6 h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
      </div>
    </Card>
  );
}
