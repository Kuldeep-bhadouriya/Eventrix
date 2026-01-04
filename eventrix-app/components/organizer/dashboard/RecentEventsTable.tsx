import Link from "next/link";
import { format } from "date-fns";

import { Card } from "@/components/ui/card";

export function RecentEventsTable({
  events,
}: {
  events: Array<{
    id: string;
    title: string;
    date: string;
    status: string;
    registeredCount: number;
    capacity: number;
  }>;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent events</div>
      </div>

      {events.length === 0 ? (
        <div className="p-6 text-sm text-gray-600 dark:text-gray-300">No events yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-600 dark:bg-gray-950/30 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-4 py-3">Event</th>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Registrations</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-t border-gray-200 dark:border-gray-800">
                  <td className="px-4 py-3">
                    <Link className="font-medium text-gray-900 hover:underline dark:text-gray-100" href={`/organizer/events/${e.id}/edit`}>
                      {e.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {format(new Date(e.date), "PPP")}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{e.status}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {e.registeredCount} / {e.capacity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
