export function OrganizerSidebarSkeleton() {
  return (
    <div className="h-full w-full border-r border-gray-200 bg-white/70 p-4 backdrop-blur dark:border-gray-800 dark:bg-gray-950/60">
      <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-6 space-y-2">
        {Array.from({ length: 7 }).map((_, idx) => (
          <div key={idx} className="h-9 rounded bg-gray-100 dark:bg-gray-900" />
        ))}
      </div>
    </div>
  );
}
