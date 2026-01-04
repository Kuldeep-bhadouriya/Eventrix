"use client";

import Link from "next/link";
import { Eye, Pencil, BarChart3 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventStatusBadge } from "@/components/organizer/events/EventStatusBadge";
import type { OrganizerEventRow } from "@/components/organizer/events/EventsTable";

export function EventsGrid({
  events,
  onQuickView,
}: {
  events: OrganizerEventRow[];
  onQuickView: (e: OrganizerEventRow) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((e) => (
        <Card key={e.id} className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{e.title}</div>
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">{e.category}</div>
            </div>
            <EventStatusBadge status={e.status} />
          </div>

          <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            {e.date} • {e.time}
          </div>
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {e.registeredCount} / {e.capacity} registered
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" aria-label="Quick view" onClick={() => onQuickView(e)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button asChild type="button" variant="outline" size="icon" aria-label="Edit">
              <Link href={`/organizer/events/${e.id}/edit`}><Pencil className="h-4 w-4" /></Link>
            </Button>
            <Button asChild type="button" variant="outline" size="icon" aria-label="Analytics">
              <Link href={`/organizer/events/${e.id}/analytics`}><BarChart3 className="h-4 w-4" /></Link>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
