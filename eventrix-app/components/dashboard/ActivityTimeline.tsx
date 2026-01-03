import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { CalendarDays, Award, Bell } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { cn } from "@/lib/utils";
import type { DashboardActivityItem } from "@/lib/dashboard/dashboard-queries";

function ActivityIcon({ type }: { type: DashboardActivityItem["type"] }) {
  const common = "h-4 w-4";
  switch (type) {
    case "registration":
      return <CalendarDays className={common} />;
    case "certificate":
      return <Award className={common} />;
    case "notification":
      return <Bell className={common} />;
  }
}

export function ActivityTimeline({
  items,
}: {
  items: DashboardActivityItem[];
}) {
  return (
    <DashboardCard
      title="Recent Activity"
      description="Registrations, certificates, and notifications"
      className="border-gray-200 bg-white/70 dark:border-gray-800 dark:bg-gray-950/40"
    >
      {items.length === 0 ? (
        <EmptyState
          title="No recent activity"
          description="Your recent registrations and updates will appear here."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={`${item.type}:${item.id}`} className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex h-8 w-8 items-center justify-center rounded-md border",
                  "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950",
                )}
                aria-hidden="true"
              >
                <span className="text-gray-700 dark:text-gray-200">
                  <ActivityIcon type={item.type} />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.href ? (
                        <Link href={item.href} className="hover:underline">
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                    </div>
                    {item.description && (
                      <div className="mt-0.5 line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                        {item.description}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
