export type UserStatusValue = "ACTIVE" | "SUSPENDED" | "BANNED";

export function UserStatusBadge({ status }: { status: UserStatusValue }) {
  const styles =
    status === "ACTIVE"
      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
      : status === "SUSPENDED"
        ? "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-300"
        : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300";

  const label = status === "ACTIVE" ? "Active" : status === "SUSPENDED" ? "Suspended" : "Banned";

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles}`}
      aria-label={`User status ${label}`}
    >
      {label}
    </span>
  );
}
