"use client";

import { useMemo, useState } from "react";
import { EventStatus } from "@prisma/client";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";

type EventRow = {
  id: string;
  title: string;
  venue: string;
  category: string;
  status: EventStatus;
  date: string;
  capacity: number;
  registeredCount: number;
  openReports: number;
  organizerName: string;
  organizerEmail?: string;
};

async function updateEventStatus(eventId: string, action: "approve" | "reject" | "close" | "complete" | "draft") {
  const res = await fetch(`/api/admin/events/${eventId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });

  const json = await res.json();
  if (!res.ok || !json?.success) {
    throw new Error(json?.error?.message ?? "Failed to update event");
  }

  return json.data as { status: EventStatus };
}

function badgeStyle(status: EventStatus) {
  if (status === EventStatus.PUBLISHED) {
    return "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300";
  }
  if (status === EventStatus.DRAFT) {
    return "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200";
  }
  if (status === EventStatus.COMPLETED) {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300";
  }
  return "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-300";
}

export function EventModerationTableClient({ initialEvents }: { initialEvents: EventRow[] }) {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventRow[]>(initialEvents);
  const [busyId, setBusyId] = useState<string | null>(null);

  const flaggedCount = useMemo(() => events.filter((event) => event.openReports > 0).length, [events]);

  const onAction = async (
    eventId: string,
    action: "approve" | "reject" | "close" | "complete" | "draft",
  ) => {
    try {
      setBusyId(eventId);
      const result = await updateEventStatus(eventId, action);
      setEvents((prev) => prev.map((event) => (event.id === eventId ? { ...event, status: result.status } : event)));
      toast({ title: "Moderation action saved", variant: "success" });
    } catch (error) {
      toast({
        title: "Could not update event",
        description: error instanceof Error ? error.message : "Unexpected error",
        variant: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 dark:text-gray-300">
        {events.length} events in view, {flaggedCount} currently flagged.
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900/40">
            <tr>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Event</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Organizer</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Status</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Reports</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Capacity</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Date</th>
              <th scope="col" className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950/30">
            {events.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-600 dark:text-gray-300">
                  No events matched the selected filters.
                </td>
              </tr>
            ) : (
              events.map((event) => {
                const busy = busyId === event.id;
                return (
                  <tr key={event.id}>
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{event.title}</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{event.category} • {event.venue}</div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="text-gray-900 dark:text-gray-100">{event.organizerName}</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{event.organizerEmail ?? "-"}</div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${badgeStyle(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700 dark:text-gray-200">
                      {event.openReports > 0 ? (
                        <span className="font-medium text-rose-700 dark:text-rose-300">{event.openReports}</span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700 dark:text-gray-200">
                      {event.registeredCount}/{event.capacity}
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700 dark:text-gray-200">{event.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/events/${event.id}`}>Review</Link>
                        </Button>
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => onAction(event.id, "approve")}>Approve</Button>
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => onAction(event.id, "close")}>Close</Button>
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => onAction(event.id, "complete")}>Complete</Button>
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => onAction(event.id, "draft")}>Draft</Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
