import { cn } from "@/lib/utils";

import type { RegistrationStatus } from "@/components/dashboard/events/types";

function getLabel(status: RegistrationStatus) {
  if (status === "ATTENDED") return "Attended";
  if (status === "CANCELLED") return "Cancelled";
  return "Registered";
}

export function EventStatusBadge({ status, className }: { status: RegistrationStatus; className?: string }) {
  const styles =
    status === "ATTENDED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
      : status === "CANCELLED"
        ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
        : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300";

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", styles, className)}>
      {getLabel(status)}
    </span>
  );
}
