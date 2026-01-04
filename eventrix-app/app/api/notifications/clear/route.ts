import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleApiError, rateLimitPresets, successResponse, withLogging } from "@/lib/api";
import { AuthenticationError, AuthorizationError, ConflictError } from "@/lib/api/api-error";
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

    await prisma.notification.deleteMany({ where: { userId: session.user.id } });

    log.info("Cleared notifications", { userId: session.user.id });
    return successResponse({ ok: true });
  })
);
