import { prisma } from "@/lib/db";
import { encodeEventPassQrPayload } from "@/lib/qr-code";
import { findEventById } from "@/lib/events/mock-events";
import type { EventPassData } from "@/types/event-pass";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

function makeReferenceNumber(registrationId: string) {
  return registrationId.replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase();
}

export async function getEventPassForUser(input: {
  userId: string;
  eventId: string;
}): Promise<EventPassData | null> {
  if (!isDatabaseAvailable()) {
    const event = findEventById(input.eventId);
    if (!event) return null;

    const registrationId = `mock-${input.userId}-${input.eventId}`;
    return {
      event: {
        id: event.id,
        title: event.title,
        date: new Date(event.date).toISOString(),
        time: event.time,
        venue: event.venue,
      },
      user: {
        id: input.userId,
        name: null,
        email: null,
        avatar: null,
      },
      registration: {
        id: registrationId,
        referenceNumber: makeReferenceNumber(registrationId),
        seatNumber: null,
      },
      qrValue: encodeEventPassQrPayload({
        userId: input.userId,
        eventId: input.eventId,
        registrationId,
      }),
    };
  }

  const registration = await prisma.registration.findUnique({
    where: {
      userId_eventId: {
        userId: input.userId,
        eventId: input.eventId,
      },
    },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          date: true,
          time: true,
          venue: true,
        },
      },
    },
  });

  if (!registration) return null;

  return {
    event: {
      id: registration.event.id,
      title: registration.event.title,
      date: registration.event.date.toISOString(),
      time: registration.event.time,
      venue: registration.event.venue,
    },
    user: {
      id: registration.user.id,
      name: registration.user.name ?? null,
      email: registration.user.email ?? null,
      avatar: registration.user.avatar ?? null,
    },
    registration: {
      id: registration.id,
      referenceNumber: makeReferenceNumber(registration.id),
      seatNumber: null,
    },
    qrValue: encodeEventPassQrPayload({
      userId: registration.user.id,
      eventId: registration.event.id,
      registrationId: registration.id,
    }),
  };
}
