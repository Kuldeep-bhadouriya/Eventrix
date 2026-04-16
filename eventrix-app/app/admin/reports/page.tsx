import { Prisma, ReportEntityType, ReportStatus } from "@prisma/client";

import { ReportsTableClient } from "@/components/admin/ReportsTableClient";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { prisma } from "@/lib/db";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string; entityType?: string };
}) {
  const dbAvailable = isDatabaseAvailable();

  const q = (searchParams?.q ?? "").trim();
  const status = (searchParams?.status ?? "").trim();
  const entityType = (searchParams?.entityType ?? "").trim();

  const statusFilter = Object.values(ReportStatus).includes(status as ReportStatus)
    ? (status as ReportStatus)
    : undefined;
  const entityTypeFilter = Object.values(ReportEntityType).includes(entityType as ReportEntityType)
    ? (entityType as ReportEntityType)
    : undefined;

  const where: Prisma.ReportWhereInput = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(entityTypeFilter ? { entityType: entityTypeFilter } : {}),
    ...(q
      ? {
          OR: [
            { reason: { contains: q, mode: "insensitive" } },
            { message: { contains: q, mode: "insensitive" } },
            { entityId: { contains: q, mode: "insensitive" } },
            { reporter: { email: { contains: q, mode: "insensitive" } } },
            { reporter: { name: { contains: q, mode: "insensitive" } } },
            { event: { title: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  let reports: {
    id: string;
    entityType: "EVENT" | "USER";
    entityId: string;
    reason: string;
    message?: string | null;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "DISMISSED";
    adminNotes?: string | null;
    createdAt: string;
    reporterName?: string | null;
    reporterEmail?: string | null;
    eventTitle?: string | null;
  }[] = [];

  let summary: Record<string, number> = {};

  if (dbAvailable) {
    const [rows, grouped] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          entityType: true,
          entityId: true,
          reason: true,
          message: true,
          priority: true,
          status: true,
          adminNotes: true,
          createdAt: true,
          reporter: { select: { name: true, email: true } },
          event: { select: { title: true } },
        },
      }),
      prisma.report.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);

    reports = rows.map((row) => ({
      id: row.id,
      entityType: row.entityType,
      entityId: row.entityId,
      reason: row.reason,
      message: row.message,
      priority: row.priority,
      status: row.status,
      adminNotes: row.adminNotes,
      createdAt: row.createdAt.toLocaleString(),
      reporterName: row.reporter?.name,
      reporterEmail: row.reporter?.email,
      eventTitle: row.event?.title,
    }));

    summary = grouped.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = item._count._all;
      return acc;
    }, {});
  }

  return (
    <div className="space-y-6">
      <DashboardSection title="Reports" description="Handle moderation reports and resolution workflows">
        <></>
      </DashboardSection>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Open">
          <div className="text-2xl font-semibold text-rose-700 dark:text-rose-300">{summary.OPEN ?? 0}</div>
        </DashboardCard>
        <DashboardCard title="Investigating">
          <div className="text-2xl font-semibold text-amber-700 dark:text-amber-300">{summary.INVESTIGATING ?? 0}</div>
        </DashboardCard>
        <DashboardCard title="Resolved">
          <div className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300">{summary.RESOLVED ?? 0}</div>
        </DashboardCard>
        <DashboardCard title="Dismissed">
          <div className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{summary.DISMISSED ?? 0}</div>
        </DashboardCard>
      </div>

      <DashboardCard>
        <form className="grid gap-3 sm:grid-cols-3" method="get">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Search
            <input
              name="q"
              defaultValue={q}
              placeholder="Reason, entity, reporter"
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
            />
          </label>

          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Status
            <select
              name="status"
              defaultValue={status}
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
            >
              <option value="">All</option>
              <option value="OPEN">OPEN</option>
              <option value="INVESTIGATING">INVESTIGATING</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="DISMISSED">DISMISSED</option>
            </select>
          </label>

          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Entity Type
            <select
              name="entityType"
              defaultValue={entityType}
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100 dark:focus:ring-gray-800"
            >
              <option value="">All</option>
              <option value="EVENT">EVENT</option>
              <option value="USER">USER</option>
            </select>
          </label>
        </form>
      </DashboardCard>

      <DashboardCard title="Reports Queue" description="Update status and close reports quickly">
        <ReportsTableClient initialReports={reports} />
      </DashboardCard>

      {!dbAvailable ? (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-200">
          DATABASE_URL is not configured; reports data is unavailable.
        </div>
      ) : null}
    </div>
  );
}
