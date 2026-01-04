import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { handleApiError, rateLimitPresets, successResponse, withLogging } from "@/lib/api";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/lib/api/api-error";
import { getCertificateDetailsForUser } from "@/lib/dashboard/certificates-queries";
import { UserRole } from "@prisma/client";

export const GET = handleApiError(
  withLogging(async (req, log) => {
    await rateLimitPresets.generous(req);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new AuthenticationError();
    if (session.user.role !== UserRole.STUDENT) throw new AuthorizationError();

    const url = new URL(req.url);
    const certificateId = url.pathname.split("/").filter(Boolean).at(-1);
    if (!certificateId) throw new NotFoundError("Certificate");

    const details = await getCertificateDetailsForUser({ userId: session.user.id, certificateId });
    if (!details) throw new NotFoundError("Certificate", certificateId);

    log.info("Fetched certificate details", { userId: session.user.id, certificateId });
    return successResponse(details);
  })
);
