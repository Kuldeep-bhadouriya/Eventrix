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
  NotFoundError,
} from "@/lib/api/api-error";
import { prisma } from "@/lib/db";
import { RegistrationStatus, UserRole } from "@prisma/client";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export const GET = handleApiError(
  withLogging(async (req, log) => {
    await rateLimitPresets.generous(req);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new AuthenticationError();
    if (session.user.role !== UserRole.STUDENT) throw new AuthorizationError();

    if (!isDatabaseAvailable()) {
      return successResponse({
        canCancel: false,
        reason: "Database not configured",
        policy: {
          requiresConfirmation: true,
          message: "Cancellation requires confirming the policy.",
        },
      });
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
        status: true,
        event: {
          select: {
            date: true,
            status: true,
          },
        },
      },
    });

    if (!registration) throw new NotFoundError("Registration");

    const now = new Date();

    let canCancel = true;
    let reason: string | undefined;

    if (registration.status === RegistrationStatus.CANCELLED) {
      canCancel = false;
      reason = "Registration is already cancelled.";
    } else if (registration.event.date < now) {
      canCancel = false;
      reason = "You can't cancel after the event date.";
    } else if (String(registration.event.status) === "COMPLETED") {
      canCancel = false;
      reason = "You can't cancel a completed event.";
    }

    log.info("Checked cancellation eligibility", {
      userId: session.user.id,
      eventId,
      canCancel,
    });

    return successResponse({
      canCancel,
      ...(reason ? { reason } : {}),
      policy: {
        requiresConfirmation: true,
        message:
          "By cancelling, you may forfeit your spot and any associated benefits. Some events may not allow re-registration.",
      },
    });
  }),
);
