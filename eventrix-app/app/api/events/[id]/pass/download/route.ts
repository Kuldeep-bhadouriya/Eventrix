import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { handleApiError, rateLimitPresets, successResponse, validateBody, withLogging } from "@/lib/api";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/lib/api/api-error";
import { getEventPassForUser } from "@/lib/dashboard/event-pass-queries";
import { UserRole } from "@prisma/client";

const bodySchema = z.object({
  format: z.enum(["pdf", "png"]),
});

export const POST = handleApiError(
  withLogging(async (req, log) => {
    await rateLimitPresets.generous(req);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new AuthenticationError();
    if (session.user.role !== UserRole.STUDENT) throw new AuthorizationError();

    const body = await validateBody(req, bodySchema);

    const url = new URL(req.url);
    const eventId = url.pathname.split("/").filter(Boolean).at(-3);
    if (!eventId) throw new NotFoundError("Event");

    const pass = await getEventPassForUser({ userId: session.user.id, eventId });
    if (!pass) throw new NotFoundError("Event pass");

    // Note: Download generation is handled client-side for now.
    log.info("Requested pass download", { userId: session.user.id, eventId, format: body.format });
    return successResponse({ ok: true, format: body.format });
  })
);
