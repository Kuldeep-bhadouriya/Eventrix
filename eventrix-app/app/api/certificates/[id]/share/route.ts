import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { handleApiError, rateLimitPresets, successResponse, validateBody, withLogging } from "@/lib/api";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/lib/api/api-error";
import { getCertificateDetailsForUser } from "@/lib/dashboard/certificates-queries";
import { UserRole } from "@prisma/client";

const bodySchema = z.object({
  channel: z.enum(["email", "whatsapp"]),
  recipient: z.string().email().optional(),
});

export const POST = handleApiError(
  withLogging(async (req, log) => {
    await rateLimitPresets.generous(req);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new AuthenticationError();
    if (session.user.role !== UserRole.STUDENT) throw new AuthorizationError();

    const body = await validateBody(req, bodySchema);

    const url = new URL(req.url);
    const certificateId = url.pathname.split("/").filter(Boolean).at(-2);
    if (!certificateId) throw new NotFoundError("Certificate");

    const details = await getCertificateDetailsForUser({ userId: session.user.id, certificateId });
    if (!details) throw new NotFoundError("Certificate", certificateId);

    log.info("Requested certificate share", {
      userId: session.user.id,
      certificateId,
      channel: body.channel,
      hasRecipient: Boolean(body.recipient),
    });
    return successResponse({ ok: true, channel: body.channel });
  })
);
