import { handleApiError, successResponse, validateBody } from "@/lib/api";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { isDatabaseAvailable, requireOwnedEventBasic } from "@/lib/organizer/ownership";

const schema = z.object({
  registrationIds: z.array(z.string().min(1)).min(1),
});

export const POST = handleApiError(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireOrganizerApiSession();
  const { id } = await ctx.params;
  const body = await validateBody(req, schema);

  if (!isDatabaseAvailable()) {
    return successResponse({ updated: 0 });
  }

  await requireOwnedEventBasic(session.user.id, id);

  const res = await prisma.registration.updateMany({
    where: {
      id: { in: body.registrationIds },
      eventId: id,
    },
    data: {
      status: "ATTENDED",
      checkInTime: new Date(),
    },
  });

  return successResponse({ updated: res.count });
});
