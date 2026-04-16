import { Prisma, EventStatus, ReportStatus } from "@prisma/client";

import { EventModerationTableClient } from "@/components/admin/EventModerationTableClient";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { prisma } from "@/lib/db";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string; moderation?: string };
}) {
  const dbAvailable = isDatabaseAvailable();

  const q = (searchParams?.q ?? "").trim();
  const status = (searchParams?.status ?? "").trim();
  const moderation = (searchParams?.moderation ?? "all").trim().toLowerCase();

  const statusFilter = Object.values(EventStatus).includes(status as EventStatus)
    ? (status as EventStatus)
    : undefined;

  const openReportStatuses = [ReportStatus.OPEN, ReportStatus.INVESTIGATING];

  const where: Prisma.EventWhereInput = {
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { venue: { contains: q, mode: "insensitive" } },
            { organizer: { organizationName: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(moderation === "flagged"
      ? { reports: { some: { status: { in: openReportStatuses } } } }
      : {}),
    ...(moderation === "clean"
      ? { reports: { none: { status: { in: openReportStatuses } } } }
      : {}),
  };

  let events: {
    id: string;
    title: string;
    venue: string;
    category: string;
    status: EventStatus;
    date: string;
    capacity: number;
    registeredCount: number;
    openReports: number;
    organizerName: string;
    organizerEmail?: string;
  }[] = [];

  let totalEvents = 0;
  let flaggedEvents = 0;

  if (dbAvailable) {
    const [rows, totalCount, flaggedCount] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          title: true,
          venue: true,
          category: true,
          status: true,
          date: true,
          capacity: true,
          registeredCount: true,
          organizer: {
            select: {
              organizationName: true,
              user: { select: { email: true } },
            },
          },
        },
      }),
      prisma.event.count(),
      prisma.event.count({
        where: { reports: { some: { status: { in: openReportStatuses } } } },
      }),
    ]);

    const reportCounts = await prisma.report.groupBy({
      by: ["entityId"],
      where: {
        entityId: { in: rows.map((row) => row.id) },
        status: { in: openReportStatuses },
      },
      _count: { _all: true },
    });

    const countMap = new Map(reportCounts.map((item) => [item.entityId, item._count._all]));

    events = rows.map((row) => ({
      id: row.id,
      title: row.title,
      venue: row.venue,
      category: row.category,
      status: row.status,
      date: row.date.toLocaleString(),
      capacity: row.capacity,
      registeredCount: row.registeredCount,
      openReports: countMap.get(row.id) ?? 0,
      organizerName: row.organizer.organizationName,
      organizerEmail: row.organizer.user.email,
    }));

    totalEvents = totalCount;
    flaggedEvents = flaggedCount;
  }

  return (
    <div className="space-y-6">
      <DashboardSection title="Events" description="Moderate, review, and take action on event listings">
        <></>
      </DashboardSection>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="Total Events">
          <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{totalEvents}</div>
        </DashboardCard>
        <DashboardCard title="Flagged Events">
          <div className="text-2xl font-semibold text-rose-700 dark:text-rose-300">{flaggedEvents}</div>
        </DashboardCard>
        <DashboardCard title="Showing">
          <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{events.length}</div>
        </DashboardCard>
      </div>

      <DashboardCard>
        <form className="grid gap-3 sm:grid-cols-3" method="get">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Search
            <input
              name="q"
              defaultValue={q}
              placeholder="Event title, venue, organizer"
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
            />
          </label>

          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Event status
            <select
              name="status"
              defaultValue={status}
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
            >
              <option value="">All</option>
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </label>

          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Moderation
            <select
              name="moderation"
              defaultValue={moderation}
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
            >
              <option value="all">All</option>
              <option value="flagged">Flagged only</option>
              <option value="clean">No open reports</option>
            </select>
          </label>
        </form>
      </DashboardCard>

      <DashboardCard title="Moderation Queue" description="Review reports and update event status">
        <EventModerationTableClient initialEvents={events} />
      </DashboardCard>

      {!dbAvailable ? (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-200">
          DATABASE_URL is not configured; moderation data is unavailable.
        </div>
      ) : null}
    </div>
  );
}
