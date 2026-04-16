import { handleApiError, paginatedResponse, successResponse, validateBody, validateQuery } from "@/lib/api";
import { prisma } from "@/lib/db";
import { EventStatus, Prisma } from "@prisma/client";

import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import {
  organizerCreateEventSchema,
  organizerListEventsQuerySchema,
} from "@/lib/organizer/event-schemas";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export const GET = handleApiError(async (req: Request) => {
  const session = await requireOrganizerApiSession();
  const query = validateQuery(req, organizerListEventsQuerySchema);

  if (!isDatabaseAvailable()) {
    return paginatedResponse([], query.page, query.limit, 0);
  }

  const organizer = await prisma.organizer.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!organizer) {
    return paginatedResponse([], query.page, query.limit, 0);
  }

  const where: Prisma.EventWhereInput = {
    organizerId: organizer.id,
  };

  if (query.status) {
    const allowedStatuses = new Set(Object.values(EventStatus));
    if (allowedStatuses.has(query.status as EventStatus)) {
      where.status = query.status as EventStatus;
    }
  }
  if (query.category) where.category = query.category;
  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } },
    ];
  }

  const skip = (query.page - 1) * query.limit;
  const orderBy = { [query.sortBy]: query.sortOrder } as Prisma.EventOrderByWithRelationInput;

  const [total, events] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy,
      skip,
      take: query.limit,
      select: {
        id: true,
        title: true,
        description: true,
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
    }),
  ]);

  const rows = events.map((e) => ({
    ...e,
    date: e.date.toISOString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));

  return paginatedResponse(rows, query.page, query.limit, total);
});

export const POST = handleApiError(async (req: Request) => {
  const session = await requireOrganizerApiSession();
  const body = await validateBody(req, organizerCreateEventSchema);

  if (!isDatabaseAvailable()) {
    return successResponse({ id: "offline", ...body }, 200);
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

  const event = await prisma.event.create({
    data: {
      organizerId: organizer.id,
      title: body.title,
      description: body.description,
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
    select: { id: true },
  });

  return successResponse({ id: event.id }, 201);
});
