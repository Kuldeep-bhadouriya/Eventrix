"use client";

import { cn } from "@/lib/utils";

export function StepIndicator({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number;
  className?: string;
}) {
  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-5">
        {steps.map((label, idx) => {
          const isActive = idx === current;
          const isDone = idx < current;
          return (
            <li
              key={label}
              className={cn(
                "rounded-md border px-3 py-2 text-xs",
                isActive
                  ? "border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100"
                  : isDone
                    ? "border-gray-200 text-gray-700 dark:border-gray-800 dark:text-gray-200"
                    : "border-gray-200 text-gray-600 dark:border-gray-800 dark:text-gray-300",
              )}
            >
              <div className="font-semibold">Step {idx + 1}</div>
              <div className="mt-1 line-clamp-1">{label}</div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
