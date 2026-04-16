import { handleApiError, successResponse, validateBody } from "@/lib/api";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { isDatabaseAvailable, requireOwnedEventBasic } from "@/lib/organizer/ownership";

const schema = z.object({
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(10000),
  userIds: z.array(z.string().min(1)).optional(),
});

export const POST = handleApiError(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireOrganizerApiSession();
  const { id } = await ctx.params;
  const body = await validateBody(req, schema);

  if (!isDatabaseAvailable()) {
    return successResponse({ queued: 0, note: "Email transport is not configured in offline mode." });
  }

  await requireOwnedEventBasic(session.user.id, id);

  const recipients = await prisma.registration.findMany({
    where: {
      eventId: id,
      ...(body.userIds?.length ? { userId: { in: body.userIds } } : {}),
    },
    select: { user: { select: { email: true } } },
  });

  // This endpoint returns recipient counts for now. Integrate with an email provider later.
  return successResponse({
    queued: recipients.length,
    preview: {
      subject: body.subject,
      messageLength: body.message.length,
    },
  });
});
