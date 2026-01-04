import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  handleApiError,
  rateLimitPresets,
  successResponse,
  withLogging,
} from "@/lib/api";
import {
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  NotFoundError,
} from "@/lib/api/api-error";
import { prisma } from "@/lib/db";
import { RegistrationStatus, UserRole } from "@prisma/client";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export const DELETE = handleApiError(
  withLogging(async (req, log) => {
    await rateLimitPresets.generous(req);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new AuthenticationError();
    if (session.user.role !== UserRole.STUDENT) throw new AuthorizationError();

    if (!isDatabaseAvailable()) {
      throw new ConflictError("Database not configured");
    }

    const url = new URL(req.url);
    const eventId = url.pathname.split("/").filter(Boolean).at(-2);

    if (!eventId) throw new NotFoundError("Event");

    const registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId,
        },
      },
      select: {
        id: true,
        status: true,
        event: {
          select: {
            id: true,
            date: true,
            registeredCount: true,
            status: true,
          },
        },
      },
    });

    if (!registration) throw new NotFoundError("Registration");

    const now = new Date();

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new ConflictError("Registration already cancelled");
    }

    if (registration.event.date < now) {
      throw new ConflictError("You can't cancel after the event date");
    }

    if (String(registration.event.status) === "COMPLETED") {
      throw new ConflictError("You can't cancel a completed event");
    }

    await prisma.$transaction([
      prisma.registration.update({
        where: { id: registration.id },
        data: { status: RegistrationStatus.CANCELLED },
      }),
      prisma.event.update({
        where: { id: registration.event.id },
        data: {
          registeredCount: {
            decrement: registration.event.registeredCount > 0 ? 1 : 0,
          },
        },
      }),
    ]);

    log.info("Cancelled registration", {
      userId: session.user.id,
      eventId,
    });

    return successResponse({ cancelled: true });
  }),
);
