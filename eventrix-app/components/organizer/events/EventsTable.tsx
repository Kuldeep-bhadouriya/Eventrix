"use client";

import Link from "next/link";
import { Eye, Pencil, BarChart3, Trash2, Ban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EventStatusBadge } from "@/components/organizer/events/EventStatusBadge";

export type OrganizerEventRow = {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  registeredCount: number;
  capacity: number;
  category: string;
};

export function EventsTable({
  events,
  selected,
  onToggle,
  onQuickView,
  onDelete,
  onCancel,
}: {
  events: OrganizerEventRow[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onQuickView: (e: OrganizerEventRow) => void;
  onDelete: (e: OrganizerEventRow) => void;
  onCancel: (e: OrganizerEventRow) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs text-gray-600 dark:bg-gray-950/30 dark:text-gray-300">
          <tr>
            <th className="px-3 py-3" scope="col">
              <span className="sr-only">Select</span>
            </th>
            <th className="px-3 py-3" scope="col">Event</th>
            <th className="px-3 py-3" scope="col">Date</th>
            <th className="px-3 py-3" scope="col">Status</th>
            <th className="px-3 py-3" scope="col">Registrations</th>
            <th className="px-3 py-3" scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id} className="border-t border-gray-200 dark:border-gray-800">
              <td className="px-3 py-3">
                <input
                  type="checkbox"
                  aria-label={`Select ${e.title}`}
                  checked={selected.has(e.id)}
                  onChange={() => onToggle(e.id)}
                />
              </td>
              <td className="px-3 py-3">
                <div className="font-medium text-gray-900 dark:text-gray-100">{e.title}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">{e.category}</div>
              </td>
              <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{e.date} {e.time}</td>
              <td className="px-3 py-3"><EventStatusBadge status={e.status} /></td>
              <td className="px-3 py-3 text-gray-600 dark:text-gray-300">
                {e.registeredCount} / {e.capacity}
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon" aria-label="Quick view" onClick={() => onQuickView(e)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button asChild type="button" variant="ghost" size="icon" aria-label="Edit">
                    <Link href={`/organizer/events/${e.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                  </Button>
                  <Button asChild type="button" variant="ghost" size="icon" aria-label="Analytics">
                    <Link href={`/organizer/events/${e.id}/analytics`}><BarChart3 className="h-4 w-4" /></Link>
                  </Button>
                  <Button type="button" variant="ghost" size="icon" aria-label="Cancel" onClick={() => onCancel(e)}>
                    <Ban className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" aria-label="Delete" onClick={() => onDelete(e)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
