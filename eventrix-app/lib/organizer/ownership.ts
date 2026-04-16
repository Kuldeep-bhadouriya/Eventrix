import { NotFoundError } from "@/lib/api";
import { prisma } from "@/lib/db";

export function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getOrganizerIdForUser(userId: string): Promise<string | null> {
  if (!isDatabaseAvailable()) return null;

  const organizer = await prisma.organizer.findUnique({
    where: { userId },
    select: { id: true },
  });

  return organizer?.id ?? null;
}

export async function requireOrganizerId(userId: string): Promise<string> {
  const organizerId = await getOrganizerIdForUser(userId);
  if (!organizerId) throw new NotFoundError("Organizer");
  return organizerId;
}

export async function requireOwnedEventBasic(userId: string, eventId: string) {
  const organizerId = await requireOrganizerId(userId);

  const event = await prisma.event.findFirst({
    where: { id: eventId, organizerId },
    select: {
      id: true,
      title: true,
      date: true,
      time: true,
      venue: true,
      status: true,
      category: true,
      capacity: true,
      registeredCount: true,
    },
  });

  if (!event) throw new NotFoundError("Event", eventId);
  return { organizerId, event };
}
