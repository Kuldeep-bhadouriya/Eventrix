import { cn } from "@/lib/utils";

export function EventStatusBadge({ status, className }: { status: string; className?: string }) {
  const styles =
    status === "PUBLISHED"
      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300"
      : status === "DRAFT"
        ? "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-300"
        : status === "CLOSED"
          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          : "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-300";

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", styles, className)}>
      {status}
    </span>
  );
}
