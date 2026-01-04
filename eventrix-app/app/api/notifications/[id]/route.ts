import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleApiError, rateLimitPresets, successResponse, withLogging } from "@/lib/api";
import { AuthenticationError, AuthorizationError, ConflictError, NotFoundError } from "@/lib/api/api-error";
import { UserRole } from "@prisma/client";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export const DELETE = handleApiError(
  withLogging(async (req, log) => {
    await rateLimitPresets.generous(req);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new AuthenticationError();
    if (session.user.role !== UserRole.STUDENT) throw new AuthorizationError();
    if (!isDatabaseAvailable()) throw new ConflictError("Database not configured");

    const url = new URL(req.url);
    const notificationId = url.pathname.split("/").filter(Boolean).at(-1);
    if (!notificationId) throw new NotFoundError("Notification");

    const result = await prisma.notification.deleteMany({ where: { id: notificationId, userId: session.user.id } });
    if (result.count === 0) throw new NotFoundError("Notification", notificationId);

    log.info("Deleted notification", { userId: session.user.id, notificationId });
    return successResponse({ ok: true });
  })
);
