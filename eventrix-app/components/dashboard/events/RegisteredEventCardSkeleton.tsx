export function RegisteredEventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/60 dark:border-gray-800 dark:bg-gray-950/40">
      <div className="h-40 w-full animate-pulse bg-gray-100 dark:bg-gray-900" />

      <div className="space-y-3 p-4">
        <div className="space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
          <div className="h-3 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
        </div>

        <div className="space-y-2">
          <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
          <div className="h-3 w-3/5 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
        </div>

        <div className="flex gap-2">
          <div className="h-8 w-24 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
          <div className="h-8 w-24 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
          <div className="h-8 w-32 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
        </div>
      </div>
    </div>
  );
}
