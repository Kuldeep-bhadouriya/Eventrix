import Link from "next/link";
import { format } from "date-fns";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/EmptyState";
import type { UpcomingEventItem } from "@/lib/dashboard/dashboard-queries";

export function UpcomingEventsWidget({
  events,
}: {
  events: UpcomingEventItem[];
}) {
  return (
    <DashboardCard
      title="Upcoming Events"
      description="Your next registered events"
      className="border-slate-200/90 bg-white/90 dark:border-slate-800 dark:bg-slate-900/70"
    >
      {events.length === 0 ? (
        <EmptyState
          title="No upcoming events"
          description="Browse events and register to see them here."
          action={
            <Button asChild variant="secondary">
              <Link href="/events">Browse Events</Link>
            </Button>
          }
        />
      ) : (
        <div className="divide-y divide-slate-200/90 dark:divide-slate-800">
          {events.map((event) => (
            <div key={event.id} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {event.title}
                </div>
                <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {format(new Date(event.date), "MMM d, yyyy")} • {event.time} • {event.venue}
                </div>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={`/events/${event.id}`}>View</Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
