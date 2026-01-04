import { handleApiError, successResponse, validateBody } from "@/lib/api";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { organizerCreateEventSchema } from "@/lib/organizer/event-schemas";
import { z } from "zod";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

const draftSchema = z.object({
  draftId: z.string().optional(),
  data: organizerCreateEventSchema.partial().extend({
    title: z.string().min(1).optional(),
  }),
});

export const POST = handleApiError(async (req: Request) => {
  const session = await requireOrganizerApiSession();
  const body = await validateBody(req, draftSchema);

  if (!isDatabaseAvailable()) {
    return successResponse({ draftId: body.draftId ?? "offline-draft" });
  }

  const organizer = await prisma.organizer.upsert({
    where: { userId: session.user.id },
    update: {},
    create: {
      userId: session.user.id,
      organizationName: session.user.name || "Organizer",
    },
    select: { id: true },
  });

  const data = body.data;

  const draft = body.draftId
    ? await prisma.event.update({
        where: { id: body.draftId },
        data: {
          organizerId: organizer.id,
          title: data.title ?? "Untitled draft",
          description: data.description ?? "",
          ...(data.details !== undefined
            ? {
                details:
                  data.details === null
                    ? Prisma.DbNull
                    : (data.details as Prisma.InputJsonValue),
              }
            : {}),
          category: data.category ?? "OTHER",
          date: data.date ? new Date(data.date) : new Date(),
          time: data.time ?? "00:00",
          endTime: data.endTime ?? undefined,
          venue: data.venue ?? "TBD",
          capacity: data.capacity ?? 1,
          tags: data.tags ?? undefined,
          bannerUrl: data.bannerUrl ? String(data.bannerUrl) : undefined,
          status: "DRAFT",
        },
        select: { id: true },
      })
    : await prisma.event.create({
        data: {
          organizerId: organizer.id,
          title: data.title ?? "Untitled draft",
          description: data.description ?? "",
          ...(data.details !== undefined
            ? {
                details:
                  data.details === null
                    ? Prisma.DbNull
                    : (data.details as Prisma.InputJsonValue),
              }
            : {}),
          category: data.category ?? "OTHER",
          date: data.date ? new Date(data.date) : new Date(),
          time: data.time ?? "00:00",
          endTime: data.endTime ?? null,
          venue: data.venue ?? "TBD",
          capacity: data.capacity ?? 1,
          tags: data.tags ?? [],
          bannerUrl: data.bannerUrl ? String(data.bannerUrl) : null,
          status: "DRAFT",
        },
        select: { id: true },
      });

  return successResponse({ draftId: draft.id });
});
