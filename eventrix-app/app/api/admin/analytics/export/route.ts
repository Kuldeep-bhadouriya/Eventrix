import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

import { requireRole } from "@/lib/api-middleware";
import { prisma } from "@/lib/db";

function yyyyMmDd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function groupByDay(dates: Date[], start: Date, days: number) {
  const map = new Map<string, number>();
  for (let i = 0; i < days; i += 1) {
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

function parsePeriod(value: string | null) {
  const period = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(period) || period <= 0) return 30;
  if (period > 365) return 365;
  return period;
}

export async function GET(request: NextRequest) {
  const session = await requireRole(UserRole.ADMIN);
  if (session instanceof NextResponse) return session;

  const url = new URL(request.url);
  const period = parsePeriod(url.searchParams.get("period"));

  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - (period - 1));
  start.setHours(0, 0, 0, 0);

  const [users, events, registrations] = await Promise.all([
    prisma.user.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
    prisma.event.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
    prisma.registration.findMany({ where: { registeredAt: { gte: start } }, select: { registeredAt: true } }),
  ]);

  const userMap = groupByDay(users.map((row) => row.createdAt), start, period);
  const eventMap = groupByDay(events.map((row) => row.createdAt), start, period);
  const regMap = groupByDay(registrations.map((row) => row.registeredAt), start, period);

  const header = "date,new_users,new_events,new_registrations";
  const lines = Array.from(userMap.keys()).map((date) => {
    const newUsers = userMap.get(date) ?? 0;
    const newEvents = eventMap.get(date) ?? 0;
    const newRegistrations = regMap.get(date) ?? 0;
    return `${date},${newUsers},${newEvents},${newRegistrations}`;
  });

  const csv = `${header}\n${lines.join("\n")}`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=admin-analytics-${period}d.csv`,
    },
  });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
