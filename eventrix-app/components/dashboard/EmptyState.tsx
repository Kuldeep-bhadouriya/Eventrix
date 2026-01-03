import { cn } from "@/lib/utils";

export function EmptyState({
  title = "Nothing here yet",
  description,
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white/40 px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-950/30",
        className,
      )}
    >
      <div className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</div>
      {description && (
        <div className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-300">{description}</div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
