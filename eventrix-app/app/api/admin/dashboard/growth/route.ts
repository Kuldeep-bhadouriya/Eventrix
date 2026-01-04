import { prisma } from "@/lib/db";
import { successResponse, withAuthApi } from "@/lib/api-middleware";
import { UserRole } from "@prisma/client";

function yyyyMmDd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function groupByDay(dates: Date[], start: Date, days: number) {
  const map = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    map.set(yyyyMmDd(day), 0);
  }
  for (const dt of dates) {
    const key = yyyyMmDd(dt);
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

export const GET = withAuthApi(async () => {
  const now = new Date();
  const days = 14;
  const start = new Date(now);
  start.setDate(now.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const [users, events, regs] = await Promise.all([
    prisma.user.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
    prisma.event.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
    prisma.registration.findMany({ where: { registeredAt: { gte: start } }, select: { registeredAt: true } }),
  ]);

  const userMap = groupByDay(users.map((u) => u.createdAt), start, days);
  const eventMap = groupByDay(events.map((e) => e.createdAt), start, days);
  const regMap = groupByDay(regs.map((r) => r.registeredAt), start, days);

  const data = Array.from(userMap.keys()).map((date) => ({
    date,
    users: userMap.get(date) ?? 0,
    events: eventMap.get(date) ?? 0,
    registrations: regMap.get(date) ?? 0,
  }));

  return successResponse({ days, start: yyyyMmDd(start), data });
}, UserRole.ADMIN);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
