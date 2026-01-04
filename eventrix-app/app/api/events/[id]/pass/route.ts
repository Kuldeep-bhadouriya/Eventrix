import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { handleApiError, rateLimitPresets, successResponse, withLogging } from "@/lib/api";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/lib/api/api-error";
import { getEventPassForUser } from "@/lib/dashboard/event-pass-queries";
import { UserRole } from "@prisma/client";

export const GET = handleApiError(
  withLogging(async (req, log) => {
    await rateLimitPresets.generous(req);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new AuthenticationError();
    if (session.user.role !== UserRole.STUDENT) throw new AuthorizationError();

    const url = new URL(req.url);
    const eventId = url.pathname.split("/").filter(Boolean).at(-2);
    if (!eventId) throw new NotFoundError("Event");

    const pass = await getEventPassForUser({ userId: session.user.id, eventId });
    if (!pass) throw new NotFoundError("Event pass");

    log.info("Fetched event pass", { userId: session.user.id, eventId });
    return successResponse(pass);
  })
);
