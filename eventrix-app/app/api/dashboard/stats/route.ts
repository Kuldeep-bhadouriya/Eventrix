import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  handleApiError,
  successResponse,
  withLogging,
  rateLimitPresets,
} from "@/lib/api";
import { AuthenticationError, AuthorizationError } from "@/lib/api/api-error";
import { UserRole } from "@prisma/client";
import { getDashboardStats } from "@/lib/dashboard/dashboard-queries";

export const GET = handleApiError(
  withLogging(async (req, log) => {
    await rateLimitPresets.generous(req);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new AuthenticationError();
    if (session.user.role !== UserRole.STUDENT) throw new AuthorizationError();

    log.info("Fetching dashboard stats", { userId: session.user.id });

    const stats = await getDashboardStats(session.user.id);
    return successResponse(stats);
  }),
);
