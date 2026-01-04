import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { Card } from "@/components/ui/card";

export function RecentRegistrationsTable({
  registrations,
}: {
  registrations: Array<{
    id: string;
    user: { id: string; name: string; email: string };
    event: { id: string; title: string };
    registeredAt: string;
    status: string;
  }>;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent registrations</div>
      </div>

      {registrations.length === 0 ? (
        <div className="p-6 text-sm text-gray-600 dark:text-gray-300">No registrations yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-600 dark:bg-gray-950/30 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-4 py-3">Participant</th>
                <th scope="col" className="px-4 py-3">Event</th>
                <th scope="col" className="px-4 py-3">When</th>
                <th scope="col" className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r.id} className="border-t border-gray-200 dark:border-gray-800">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{r.user.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">{r.user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Link className="font-medium text-gray-900 hover:underline dark:text-gray-100" href={`/organizer/events/${r.event.id}/participants`}>
                      {r.event.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {formatDistanceToNow(new Date(r.registeredAt), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
