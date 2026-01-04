import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleApiError, rateLimitPresets, successResponse, validateBody, withLogging } from "@/lib/api";
import { AuthenticationError, AuthorizationError, ConflictError, NotFoundError } from "@/lib/api/api-error";
import { UserRole } from "@prisma/client";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

const bodySchema = z.object({
  read: z.boolean(),
});

export const PUT = handleApiError(
  withLogging(async (req, log) => {
    await rateLimitPresets.generous(req);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new AuthenticationError();
    if (session.user.role !== UserRole.STUDENT) throw new AuthorizationError();
    if (!isDatabaseAvailable()) throw new ConflictError("Database not configured");

    const body = await validateBody(req, bodySchema);

    const url = new URL(req.url);
    const notificationId = url.pathname.split("/").filter(Boolean).at(-2);
    if (!notificationId) throw new NotFoundError("Notification");

    const result = await prisma.notification.updateMany({
      where: { id: notificationId, userId: session.user.id },
      data: { read: body.read },
    });

    if (result.count === 0) throw new NotFoundError("Notification", notificationId);

    log.info("Updated notification read state", { userId: session.user.id, notificationId, read: body.read });
    return successResponse({ ok: true });
  })
);
