import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { handleApiError, rateLimitPresets, successResponse, withLogging } from "@/lib/api";
import { AuthenticationError, AuthorizationError } from "@/lib/api/api-error";
import { getUserCertificates } from "@/lib/dashboard/certificates-queries";
import { UserRole } from "@prisma/client";

export const GET = handleApiError(
  withLogging(async (req, log) => {
    await rateLimitPresets.generous(req);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new AuthenticationError();
    if (session.user.role !== UserRole.STUDENT) throw new AuthorizationError();

    const items = await getUserCertificates(session.user.id);
    log.info("Fetched certificates", { userId: session.user.id, count: items.length });
    return successResponse(items);
  })
);
