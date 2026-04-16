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
    <div className="inline-flex rounded-lg border border-gray-200 p-1 dark:border-gray-800" role="tablist" aria-label="Event filters">
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
              ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
