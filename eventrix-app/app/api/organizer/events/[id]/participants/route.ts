import { handleApiError, paginatedResponse, validateQuery } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { isDatabaseAvailable, requireOwnedEventBasic } from "@/lib/organizer/ownership";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().max(200).optional(),
  status: z.enum(["REGISTERED", "ATTENDED", "CANCELLED"]).optional(),
  certificate: z.enum(["issued", "not_issued"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const GET = handleApiError(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireOrganizerApiSession();
  const { id } = await ctx.params;
  const query = validateQuery(req, querySchema);

  if (!isDatabaseAvailable()) {
    return paginatedResponse([], query.page, query.limit, 0);
  }

  await requireOwnedEventBasic(session.user.id, id);

  const where = {
    eventId: id,
    ...(query.status ? { status: query.status } : {}),
    ...(query.q
      ? {
          OR: [
            { user: { name: { contains: query.q, mode: "insensitive" as const } } },
            { user: { email: { contains: query.q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const skip = (query.page - 1) * query.limit;

  const [total, rows] = await Promise.all([
    prisma.registration.count({ where }),
    prisma.registration.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { registeredAt: "desc" },
      select: {
        id: true,
        userId: true,
        status: true,
        registeredAt: true,
        checkInTime: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
      },
    }),
  ]);

  const certificateUserIds = new Set(
    (
      await prisma.certificate.findMany({
        where: { eventId: id, userId: { in: rows.map((r) => r.userId) } },
        select: { userId: true },
      })
    ).map((c) => c.userId),
  );

  let data = rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    name: row.user.name,
    email: row.user.email,
    department: row.user.department,
    status: row.status,
    registeredAt: row.registeredAt.toISOString(),
    checkInTime: row.checkInTime ? row.checkInTime.toISOString() : null,
    certificateIssued: certificateUserIds.has(row.userId),
  }));

  if (query.certificate) {
    const shouldBeIssued = query.certificate === "issued";
    data = data.filter((row) => row.certificateIssued === shouldBeIssued);
  }

  return paginatedResponse(data, query.page, query.limit, total);
});
