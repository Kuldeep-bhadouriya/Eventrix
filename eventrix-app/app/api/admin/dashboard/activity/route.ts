import { prisma } from "@/lib/db";
import { successResponse, withAuthApi } from "@/lib/api-middleware";
import { UserRole } from "@prisma/client";

export const GET = withAuthApi(async () => {
  const [latestUsers, latestEvents] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, title: true, createdAt: true },
    }),
  ]);

  const items = [
    ...latestUsers.map((u) => ({
      id: `user-${u.id}`,
      kind: "user" as const,
      title: `New user: ${u.name}`,
      description: u.email,
      timestamp: u.createdAt.toISOString(),
    })),
    ...latestEvents.map((e) => ({
      id: `event-${e.id}`,
      kind: "event" as const,
      title: `New event: ${e.title}`,
      timestamp: e.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .slice(0, 20);

  return successResponse({ items });
}, UserRole.ADMIN);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
