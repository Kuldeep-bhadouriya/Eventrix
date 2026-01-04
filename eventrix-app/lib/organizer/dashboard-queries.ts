import { prisma } from "@/lib/db";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export type OrganizerDashboardStats = {
  totalEventsCreated: number;
  totalRegistrations: number;
  activeEvents: number;
  certificatesIssued: number;
  revenue: number | null;
};

export type RegistrationsOverTimePoint = {
  date: string;
  registrations: number;
};

export type EventsByCategoryPoint = {
  category: string;
  events: number;
};

export type RegistrationStatusPoint = {
  status: string;
  count: number;
};

export type OrganizerDashboardCharts = {
  registrationsOverTime: RegistrationsOverTimePoint[];
  eventsByCategory: EventsByCategoryPoint[];
  registrationStatus: RegistrationStatusPoint[];
};

export type RecentEventRow = {
  id: string;
  title: string;
  date: string;
  status: string;
  registeredCount: number;
  capacity: number;
};

export type RecentRegistrationRow = {
  id: string;
  user: { id: string; name: string; email: string };
  event: { id: string; title: string };
  registeredAt: string;
  status: string;
};

async function getOrganizerIdForUser(userId: string): Promise<string | null> {
  if (!isDatabaseAvailable()) return null;
  const organizer = await prisma.organizer.findUnique({
    where: { userId },
    select: { id: true },
  });
  return organizer?.id ?? null;
}

export async function getOrganizerDashboardStats(userId: string): Promise<OrganizerDashboardStats> {
  if (!isDatabaseAvailable()) {
    return {
      totalEventsCreated: 0,
      totalRegistrations: 0,
      activeEvents: 0,
      certificatesIssued: 0,
      revenue: null,
    };
  }

  const organizerId = await getOrganizerIdForUser(userId);
  if (!organizerId) {
    return {
      totalEventsCreated: 0,
      totalRegistrations: 0,
      activeEvents: 0,
      certificatesIssued: 0,
      revenue: null,
    };
  }

  const now = new Date();

  const [totalEventsCreated, activeEvents, registrationsAgg, certificatesIssued] =
    await Promise.all([
      prisma.event.count({ where: { organizerId } }),
      prisma.event.count({
        where: { organizerId, status: "PUBLISHED", date: { gte: now } },
      }),
      prisma.registration.count({
        where: { event: { organizerId } },
      }),
      prisma.certificate.count({
        where: { event: { organizerId } },
      }),
    ]);

  return {
    totalEventsCreated,
    totalRegistrations: registrationsAgg,
    activeEvents,
    certificatesIssued,
    revenue: null,
  };
}

export async function getOrganizerDashboardCharts(userId: string): Promise<OrganizerDashboardCharts> {
  if (!isDatabaseAvailable()) {
    return { registrationsOverTime: [], eventsByCategory: [], registrationStatus: [] };
  }

  const organizerId = await getOrganizerIdForUser(userId);
  if (!organizerId) {
    return { registrationsOverTime: [], eventsByCategory: [], registrationStatus: [] };
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [registrations, events, statusCounts] = await Promise.all([
    prisma.registration.findMany({
      where: { event: { organizerId }, registeredAt: { gte: since } },
      select: { registeredAt: true },
      orderBy: { registeredAt: "asc" },
    }),
    prisma.event.findMany({
      where: { organizerId },
      select: { category: true },
    }),
    prisma.registration.groupBy({
      by: ["status"],
      where: { event: { organizerId } },
      _count: { status: true },
    }),
  ]);

  const byDay = new Map<string, number>();
  for (const r of registrations) {
    const day = r.registeredAt.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }

  const registrationsOverTime = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, registrations]) => ({ date, registrations }));

  const byCategory = new Map<string, number>();
  for (const e of events) {
    byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + 1);
  }
  const eventsByCategory = Array.from(byCategory.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, events]) => ({ category, events }));

  const registrationStatus = statusCounts
    .map((s) => ({ status: s.status, count: s._count.status }))
    .sort((a, b) => b.count - a.count);

  return { registrationsOverTime, eventsByCategory, registrationStatus };
}

export async function getOrganizerRecentEvents(userId: string, limit: number = 5): Promise<RecentEventRow[]> {
  if (!isDatabaseAvailable()) return [];
  const organizerId = await getOrganizerIdForUser(userId);
  if (!organizerId) return [];

  const events = await prisma.event.findMany({
    where: { organizerId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      date: true,
      status: true,
      registeredCount: true,
      capacity: true,
    },
  });

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date.toISOString(),
    status: e.status,
    registeredCount: e.registeredCount,
    capacity: e.capacity,
  }));
}

export async function getOrganizerRecentRegistrations(
  userId: string,
  limit: number = 10,
): Promise<RecentRegistrationRow[]> {
  if (!isDatabaseAvailable()) return [];
  const organizerId = await getOrganizerIdForUser(userId);
  if (!organizerId) return [];

  const regs = await prisma.registration.findMany({
    where: { event: { organizerId } },
    orderBy: { registeredAt: "desc" },
    take: limit,
    select: {
      id: true,
      registeredAt: true,
      status: true,
      user: { select: { id: true, name: true, email: true } },
      event: { select: { id: true, title: true } },
    },
  });

  return regs.map((r) => ({
    id: r.id,
    registeredAt: r.registeredAt.toISOString(),
    status: r.status,
    user: r.user,
    event: r.event,
  }));
}
