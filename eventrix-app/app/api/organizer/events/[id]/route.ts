import { handleApiError, noContentResponse, successResponse, validateBody } from "@/lib/api";
import { NotFoundError } from "@/lib/api";
import { prisma } from "@/lib/db";

import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { organizerCreateEventSchema } from "@/lib/organizer/event-schemas";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export const GET = handleApiError(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireOrganizerApiSession();
  const { id } = await ctx.params;

  if (!isDatabaseAvailable()) {
    throw new NotFoundError("Event", id);
  }

  const organizer = await prisma.organizer.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!organizer) throw new NotFoundError("Organizer");

  const event = await prisma.event.findFirst({
    where: { id, organizerId: organizer.id },
    select: {
      id: true,
      title: true,
      description: true,
      details: true,
      date: true,
      time: true,
      endTime: true,
      venue: true,
      capacity: true,
      registeredCount: true,
      category: true,
      tags: true,
      bannerUrl: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!event) throw new NotFoundError("Event", id);

  return successResponse({
    ...event,
    date: event.date.toISOString(),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  });
});

export const PUT = handleApiError(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireOrganizerApiSession();
  const { id } = await ctx.params;
  const body = await validateBody(req, organizerCreateEventSchema);

  if (!isDatabaseAvailable()) {
    return successResponse({ id });
  }

  const organizer = await prisma.organizer.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!organizer) throw new NotFoundError("Organizer");

  const existing = await prisma.event.findFirst({
    where: { id, organizerId: organizer.id },
    select: { id: true },
  });
  if (!existing) throw new NotFoundError("Event", id);

  await prisma.event.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      details: body.details ?? null,
      category: body.category,
      date: new Date(body.date),
      time: body.time,
      endTime: body.endTime || null,
      venue: body.venue,
      capacity: body.capacity,
      tags: body.tags ?? [],
      bannerUrl: body.bannerUrl ? String(body.bannerUrl) : null,
      status: body.status ?? "DRAFT",
    },
  });

  return successResponse({ id });
});

export const DELETE = handleApiError(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireOrganizerApiSession();
  const { id } = await ctx.params;

  if (!isDatabaseAvailable()) {
    return noContentResponse();
  }

  const organizer = await prisma.organizer.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!organizer) throw new NotFoundError("Organizer");

  const existing = await prisma.event.findFirst({
    where: { id, organizerId: organizer.id },
    select: { id: true },
  });
  if (!existing) throw new NotFoundError("Event", id);

  await prisma.event.delete({ where: { id } });
  return noContentResponse();
});
