import { handleApiError, successResponse, validateBody } from "@/lib/api";
import { prisma } from "@/lib/db";
import { z } from "zod";

import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { isDatabaseAvailable, requireOwnedEventBasic } from "@/lib/organizer/ownership";

const schema = z.object({
  userId: z.string().min(1).optional(),
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

  const eligible = await prisma.registration.findMany({
    where: {
      eventId: id,
      status: "ATTENDED",
      ...(body.userId ? { userId: body.userId } : {}),
    },
    select: {
      userId: true,
    },
  });

  if (eligible.length === 0) return successResponse({ generated: 0 });

  const existing = new Set(
    (
      await prisma.certificate.findMany({
        where: {
          eventId: id,
          userId: { in: eligible.map((x) => x.userId) },
        },
        select: { userId: true },
      })
    ).map((x) => x.userId),
  );

  const toCreate = eligible
    .filter((row) => !existing.has(row.userId))
    .map((row) => ({
      eventId: id,
      userId: row.userId,
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
