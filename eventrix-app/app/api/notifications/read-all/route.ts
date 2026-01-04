import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleApiError, rateLimitPresets, successResponse, withLogging } from "@/lib/api";
import { AuthenticationError, AuthorizationError, ConflictError } from "@/lib/api/api-error";
import { UserRole } from "@prisma/client";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export const POST = handleApiError(
  withLogging(async (req, log) => {
    await rateLimitPresets.generous(req);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new AuthenticationError();
    if (session.user.role !== UserRole.STUDENT) throw new AuthorizationError();
    if (!isDatabaseAvailable()) throw new ConflictError("Database not configured");

    await prisma.notification.updateMany({ where: { userId: session.user.id, read: false }, data: { read: true } });

    log.info("Marked all notifications as read", { userId: session.user.id });
    return successResponse({ ok: true });
  })
);
