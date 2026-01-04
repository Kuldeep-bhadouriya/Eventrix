import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { handleApiError, rateLimitPresets, successResponse, withLogging } from "@/lib/api";
import { AuthenticationError, AuthorizationError } from "@/lib/api/api-error";
import { getUserNotifications } from "@/lib/dashboard/notifications-queries";
import { UserRole } from "@prisma/client";

export const GET = handleApiError(
  withLogging(async (req, log) => {
    await rateLimitPresets.generous(req);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new AuthenticationError();
    if (session.user.role !== UserRole.STUDENT) throw new AuthorizationError();

    const items = await getUserNotifications(session.user.id);
    log.info("Fetched notifications", { userId: session.user.id, count: items.length });
    return successResponse(items);
  })
);
