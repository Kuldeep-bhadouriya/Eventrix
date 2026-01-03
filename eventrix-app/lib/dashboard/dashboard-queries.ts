import { prisma } from "@/lib/db";
import { RegistrationStatus } from "@prisma/client";

export type DashboardStats = {
  totalRegisteredEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  certificatesEarned: number;
};

export type UpcomingEventItem = {
  id: string;
  title: string;
  date: Date;
  time: string;
  venue: string;
  category: string;
  status: string;
  bannerUrl: string | null;
};

export type DashboardActivityItem = {
  id: string;
  type: "registration" | "certificate" | "notification";
  title: string;
  description?: string;
  timestamp: Date;
  href?: string;
};

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export function getEmptyDashboardStats(): DashboardStats {
  return {
    totalRegisteredEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    certificatesEarned: 0,
  };
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  if (!isDatabaseAvailable()) return getEmptyDashboardStats();

  const now = new Date();

  const [totalRegisteredEvents, upcomingEvents, completedEvents, certificatesEarned] =
    await Promise.all([
      prisma.registration.count({
        where: {
          userId,
          status: { in: [RegistrationStatus.REGISTERED, RegistrationStatus.ATTENDED] },
        },
      }),
      prisma.registration.count({
        where: {
          userId,
          status: RegistrationStatus.REGISTERED,
          event: {
            date: { gte: now },
          },
        },
      }),
      prisma.registration.count({
        where: {
          userId,
          OR: [
            { status: RegistrationStatus.ATTENDED },
            {
              status: RegistrationStatus.REGISTERED,
              event: { date: { lt: now } },
            },
          ],
        },
      }),
      prisma.certificate.count({
        where: {
          userId,
        },
      }),
    ]);

  return {
    totalRegisteredEvents,
    upcomingEvents,
    completedEvents,
    certificatesEarned,
  };
}

export async function getDashboardUpcoming(
  userId: string,
  limit: number = 5,
): Promise<UpcomingEventItem[]> {
  if (!isDatabaseAvailable()) return [];

  const now = new Date();
  const safeLimit = Math.min(10, Math.max(1, limit));

  const registrations = await prisma.registration.findMany({
    where: {
      userId,
      status: RegistrationStatus.REGISTERED,
      event: {
        date: { gte: now },
      },
    },
    orderBy: {
      event: {
        date: "asc",
      },
    },
    take: safeLimit,
    select: {
      event: {
        select: {
          id: true,
          title: true,
          date: true,
          time: true,
          venue: true,
          category: true,
          status: true,
          bannerUrl: true,
        },
      },
    },
  });

  return registrations.map((r) => ({
    ...r.event,
    status: r.event.status,
  }));
}

export async function getDashboardActivity(
  userId: string,
  limit: number = 10,
): Promise<DashboardActivityItem[]> {
  if (!isDatabaseAvailable()) return [];

  const safeLimit = Math.min(50, Math.max(1, limit));

  const [registrations, certificates, notifications] = await Promise.all([
    prisma.registration.findMany({
      where: { userId },
      orderBy: { registeredAt: "desc" },
      take: safeLimit,
      select: {
        id: true,
        registeredAt: true,
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
    prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
      take: safeLimit,
      select: {
        id: true,
        issuedAt: true,
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: safeLimit,
      select: {
        id: true,
        title: true,
        message: true,
        createdAt: true,
        read: true,
      },
    }),
  ]);

  const activity: DashboardActivityItem[] = [
    ...registrations.map((r) => ({
      id: r.id,
      type: "registration" as const,
      title: "Registered for event",
      description: r.event.title,
      timestamp: r.registeredAt,
      href: `/events/${r.event.id}`,
    })),
    ...certificates.map((c) => ({
      id: c.id,
      type: "certificate" as const,
      title: "Certificate earned",
      description: c.event.title,
      timestamp: c.issuedAt,
      href: "/dashboard/certificates",
    })),
    ...notifications.map((n) => ({
      id: n.id,
      type: "notification" as const,
      title: n.title,
      description: n.message,
      timestamp: n.createdAt,
      href: "/dashboard/notifications",
    })),
  ];

  activity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return activity.slice(0, safeLimit);
}
