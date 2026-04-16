import { handleApiError, successResponse, validateBody } from "@/lib/api";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { isDatabaseAvailable, requireOwnedEventBasic } from "@/lib/organizer/ownership";

const schema = z.object({
  userIds: z.array(z.string().min(1)).optional(),
  templateUrl: z.string().optional(),
});

export const POST = handleApiError(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireOrganizerApiSession();
  const { id } = await ctx.params;
  const body = await validateBody(req, schema);

  if (!isDatabaseAvailable()) {
    return successResponse({ generated: 0 });
  }

  await requireOwnedEventBasic(session.user.id, id);

  const regs = await prisma.registration.findMany({
    where: {
      eventId: id,
      status: "ATTENDED",
      ...(body.userIds?.length ? { userId: { in: body.userIds } } : {}),
    },
    select: { userId: true },
  });

  if (regs.length === 0) return successResponse({ generated: 0 });

  const existing = new Set(
    (
      await prisma.certificate.findMany({
        where: {
          eventId: id,
          userId: { in: regs.map((r) => r.userId) },
        },
        select: { userId: true },
      })
    ).map((r) => r.userId),
  );

  const toCreate = regs
    .filter((r) => !existing.has(r.userId))
    .map((r) => ({
      eventId: id,
      userId: r.userId,
      templateUrl: body.templateUrl ?? null,
      downloadUrl: null,
    }));

  if (toCreate.length === 0) return successResponse({ generated: 0 });

  const res = await prisma.certificate.createMany({
    data: toCreate,
    skipDuplicates: true,
  });

  return successResponse({ generated: res.count });
});
