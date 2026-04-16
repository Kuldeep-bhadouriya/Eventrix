import { Prisma } from "@prisma/client";
import { EventStatus, ReportEntityType, ReportStatus, UserRole } from "@prisma/client";

import { successResponse, withAuthApi } from "@/lib/api-middleware";
import { prisma } from "@/lib/db";

const OPEN_REPORT_STATUSES = [ReportStatus.OPEN, ReportStatus.INVESTIGATING];

function parseIntParam(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const GET = withAuthApi(async (request) => {
  const url = new URL(request.url);

  const q = (url.searchParams.get("q") ?? "").trim();
  const statusParam = (url.searchParams.get("status") ?? "").trim();
  const moderation = (url.searchParams.get("moderation") ?? "all").trim().toLowerCase();
  const page = parseIntParam(url.searchParams.get("page"), 1);
  const limit = Math.min(parseIntParam(url.searchParams.get("limit"), 20), 100);

  const statusFilter = Object.values(EventStatus).includes(statusParam as EventStatus)
    ? (statusParam as EventStatus)
    : undefined;

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
      ? { reports: { some: { status: { in: OPEN_REPORT_STATUSES } } } }
      : {}),
    ...(moderation === "clean"
      ? { reports: { none: { status: { in: OPEN_REPORT_STATUSES } } } }
      : {}),
  };

  const [total, events] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        venue: true,
        category: true,
        status: true,
        date: true,
        capacity: true,
        registeredCount: true,
        createdAt: true,
        organizer: {
          select: {
            id: true,
            organizationName: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    }),
  ]);

  const eventIds = events.map((event) => event.id);
  const openReportCounts = eventIds.length
    ? await prisma.report.groupBy({
        by: ["entityId"],
        where: {
            entityType: ReportEntityType.EVENT,
          entityId: { in: eventIds },
          status: { in: OPEN_REPORT_STATUSES },
        },
        _count: { _all: true },
      })
    : [];

  const reportCountMap = new Map(openReportCounts.map((item) => [item.entityId, item._count._all]));

  return successResponse(
    {
      events: events.map((event) => ({
        ...event,
        openReports: reportCountMap.get(event.id) ?? 0,
      })),
    },
    {
      page,
      limit,
      total,
    },
  );
}, UserRole.ADMIN);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
