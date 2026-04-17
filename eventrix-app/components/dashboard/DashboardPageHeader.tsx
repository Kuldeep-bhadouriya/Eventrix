import { cn } from "@/lib/utils";

type DashboardMetric = {
  label: string;
  value: string;
};

export function DashboardPageHeader({
  title,
  description,
  eyebrow,
  metrics,
  actions,
  className,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  metrics?: DashboardMetric[];
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 px-5 py-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/65 sm:px-6 sm:py-6",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-900 via-slate-500 to-slate-900 dark:from-slate-100 dark:via-slate-500 dark:to-slate-100"
        aria-hidden="true"
      />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              {eyebrow}
            </p>
          ) : null}

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            {title}
          </h1>

          {description ? (
            <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300 sm:text-[0.95rem]">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      {metrics?.length ? (
        <dl className="relative mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-slate-200/90 bg-white/80 px-3 py-3 dark:border-slate-700 dark:bg-slate-900/80"
            >
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{metric.label}</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{metric.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}