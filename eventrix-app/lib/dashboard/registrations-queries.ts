import { prisma } from "@/lib/db";
import { RegistrationStatus } from "@prisma/client";

export type RegistrationTab = "all" | "upcoming" | "completed" | "cancelled";
export type RegistrationSort = "date" | "name" | "status";
export type SortOrder = "asc" | "desc";

export type RegisteredEventListItem = {
  registrationId: string;
  registrationStatus: RegistrationStatus;
  registeredAt: Date;
  event: {
    id: string;
    title: string;
    description: string;
    date: Date;
    time: string;
    venue: string;
    bannerUrl: string | null;
    status: string;
  };
};

export type RegistrationsListResult = {
  items: RegisteredEventListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

function buildWhere({
  userId,
  tab,
  search,
}: {
  userId: string;
  tab: RegistrationTab;
  search?: string;
}) {
  const now = new Date();

  const where: any = {
    userId,
  };

  // Tab filters
  if (tab === "cancelled") {
    where.status = RegistrationStatus.CANCELLED;
  } else if (tab === "upcoming") {
    where.status = { in: [RegistrationStatus.REGISTERED, RegistrationStatus.ATTENDED] };
    where.event = { date: { gte: now } };
  } else if (tab === "completed") {
    where.status = { in: [RegistrationStatus.REGISTERED, RegistrationStatus.ATTENDED] };
    where.event = { date: { lt: now } };
  } else {
    // all
    where.status = {
      in: [RegistrationStatus.REGISTERED, RegistrationStatus.ATTENDED, RegistrationStatus.CANCELLED],
    };
  }

  // Search filter
  if (search) {
    const q = search.trim();
    if (q) {
      where.event = {
        ...(where.event ?? {}),
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { venue: { contains: q, mode: "insensitive" } },
        ],
      };
    }
  }

  return where;
}

function buildOrderBy(sort: RegistrationSort, order: SortOrder) {
  if (sort === "name") {
    return [{ event: { title: order } }];
  }

  if (sort === "status") {
    return [{ status: order }, { event: { date: "asc" as const } }];
  }

  // date
  return [{ event: { date: order } }, { event: { title: "asc" as const } }];
}

export async function getUserRegistrations({
  userId,
  tab,
  search,
  sort,
  order,
  page,
  limit,
}: {
  userId: string;
  tab: RegistrationTab;
  search?: string;
  sort: RegistrationSort;
  order: SortOrder;
  page: number;
  limit: number;
}): Promise<RegistrationsListResult> {
  if (!isDatabaseAvailable()) {
    return {
      items: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  const where = buildWhere({ userId, tab, search });
  const orderBy = buildOrderBy(sort, order);

  const [items, total] = await Promise.all([
    prisma.registration.findMany({
      where,
      orderBy,
      skip,
      take: safeLimit,
      select: {
        id: true,
        status: true,
        registeredAt: true,
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            date: true,
            time: true,
            venue: true,
            bannerUrl: true,
            status: true,
          },
        },
      },
    }),
    prisma.registration.count({ where }),
  ]);

  const totalPages = Math.ceil(total / safeLimit);

  return {
    items: items.map((r) => ({
      registrationId: r.id,
      registrationStatus: r.status,
      registeredAt: r.registeredAt,
      event: {
        ...r.event,
        status: String(r.event.status),
      },
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1,
    },
  };
}
