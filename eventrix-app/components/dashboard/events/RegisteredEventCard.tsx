import Link from "next/link";
import { CalendarDays, Clock3, MapPin, Ticket } from "lucide-react";

import type { RegisteredEventItem } from "@/components/dashboard/events/types";
import { EventStatusBadge } from "@/components/dashboard/events/EventStatusBadge";
import { Button } from "@/components/ui/button";

function formatEventStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function RegisteredEventCard({
  item,
  onCancel,
}: {
  item: RegisteredEventItem;
  onCancel: (item: RegisteredEventItem) => void;
}) {
  const eventDate = new Date(item.event.date);
  const formattedDate = eventDate.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const isCancelled = item.registrationStatus === "CANCELLED";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="relative h-40 w-full overflow-hidden border-b border-slate-200 dark:border-slate-800">
        {item.event.bannerUrl ? (
          <div
            role="img"
            aria-label={item.event.title}
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${item.event.bannerUrl})` }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-slate-100 via-gray-50 to-zinc-100 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900" />
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <EventStatusBadge status={item.registrationStatus} />
          <span className="inline-flex items-center rounded-full border border-gray-300 bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-200">
            {formatEventStatus(item.event.status)}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h2 className="line-clamp-2 text-base font-semibold text-slate-900 dark:text-slate-100">{item.event.title}</h2>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{item.event.description}</p>
        </div>

        <div className="grid gap-2 text-sm text-slate-700 dark:text-slate-200">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-slate-500" />
            <span>{item.event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-500" />
            <span>{item.event.venue}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/events/${item.event.id}`}>View Details</Link>
          </Button>

          {isCancelled ? (
            <Button size="sm" variant="secondary" disabled>
              <Ticket className="h-4 w-4" />
              View Pass
            </Button>
          ) : (
            <Button asChild size="sm" variant="secondary">
              <Link href={`/dashboard/events/${item.event.id}/pass`}>
                <Ticket className="h-4 w-4" />
                View Pass
              </Link>
            </Button>
          )}

          <Button type="button" size="sm" variant="outline" onClick={() => onCancel(item)} disabled={isCancelled}>
            {isCancelled ? "Cancelled" : "Cancel Registration"}
          </Button>
        </div>
      </div>
    </article>
  );
}
