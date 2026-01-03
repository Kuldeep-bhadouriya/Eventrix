import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import {
  handleApiError,
  successResponse,
  withLogging,
  rateLimitPresets,
  validateQuery,
} from "@/lib/api";
import { AuthenticationError, AuthorizationError } from "@/lib/api/api-error";
import { UserRole } from "@prisma/client";
import { getDashboardUpcoming } from "@/lib/dashboard/dashboard-queries";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(10).optional(),
});

export const GET = handleApiError(
  withLogging(async (req, log) => {
    await rateLimitPresets.generous(req);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new AuthenticationError();
    if (session.user.role !== UserRole.STUDENT) throw new AuthorizationError();

    const { limit } = validateQuery(req, querySchema);
    log.info("Fetching dashboard upcoming events", { userId: session.user.id, limit });

    const upcoming = await getDashboardUpcoming(session.user.id, limit ?? 5);
    return successResponse(upcoming);
  }),
);
