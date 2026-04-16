import type { Metadata } from "next";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";
import { UserRole } from "@prisma/client";

export const metadata: Metadata = {
  title: "Organizer Participants",
  description: "Select an event to manage participants and check-ins.",
};

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export default async function OrganizerParticipantsIndexPage() {
  const session = await requireAuth(UserRole.ORGANIZER);

  if (!isDatabaseAvailable()) {
    return (
      <Card className="p-4 text-sm text-gray-600 dark:text-gray-300">
        Database is not configured. Participant lists will appear when data is available.
      </Card>
    );
  }

  const organizer = await prisma.organizer.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const events = organizer
    ? await prisma.event.findMany({
        where: { organizerId: organizer.id },
        orderBy: { date: "desc" },
        select: {
          id: true,
          title: true,
          date: true,
          status: true,
          registeredCount: true,
        },
      })
    : [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Participants</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">Open an event to manage participant check-ins, communication, and exports.</p>
      </div>

      {events.length === 0 ? (
        <Card className="p-4 text-sm text-gray-600 dark:text-gray-300">No events found yet.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{event.title}</h2>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                    {event.date.toLocaleDateString()} • {event.status}
                  </p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                    Registered: {event.registeredCount}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/organizer/events/${event.id}/participants`}>Manage</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
