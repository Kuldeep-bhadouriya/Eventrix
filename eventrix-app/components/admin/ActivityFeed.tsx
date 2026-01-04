import { DashboardCard } from "@/components/dashboard/DashboardCard";

export type ActivityItem = {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  kind: "user" | "event" | "alert";
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <DashboardCard title="Recent Activity" description="New users, events, and system alerts" className="h-full">
      {items.length === 0 ? (
        <div className="text-sm text-gray-600 dark:text-gray-300">No recent activity.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-md border border-gray-200 p-3 dark:border-gray-800">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.title}
                  </div>
                  {item.description ? (
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{item.description}</div>
                  ) : null}
                </div>
                <div className="shrink-0 text-xs text-gray-500 dark:text-gray-400">{item.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
