import { cn } from "@/lib/utils";

import type { RegistrationTab } from "@/components/dashboard/events/types";

const tabs: Array<{ value: RegistrationTab; label: string }> = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function EventTabs({
  value,
  onChange,
}: {
  value: RegistrationTab;
  onChange: (value: RegistrationTab) => void;
}) {
  return (
    <div
      className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-900"
      role="tablist"
      aria-label="Event filters"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition",
            value === tab.value
              ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
