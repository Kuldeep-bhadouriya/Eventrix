import { prisma } from "@/lib/db";
import { successResponse, withAuthApi } from "@/lib/api-middleware";
import { UserRole } from "@prisma/client";

export const GET = withAuthApi(async () => {
  const now = new Date();

  const [totalUsers, totalEvents, totalRegistrations] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.registration.count(),
  ]);

  const active = await prisma.session.findMany({
    where: { expires: { gt: now } },
    select: { userId: true },
    distinct: ["userId"],
  });

  return successResponse({
    totalUsers,
    totalEvents,
    totalRegistrations,
    revenue: 0,
    activeUsers: active.length,
  });
}, UserRole.ADMIN);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
