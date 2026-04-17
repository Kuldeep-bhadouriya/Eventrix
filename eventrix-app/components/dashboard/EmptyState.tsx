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
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/75 px-6 py-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/55",
        className,
      )}
    >
      <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</div>
      {description && (
        <div className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">{description}</div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
