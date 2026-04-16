import { NextRequest } from "next/server";
import { Prisma, ReportEntityType, ReportPriority, ReportStatus, UserRole } from "@prisma/client";

import {
  notFoundResponse,
  successResponse,
  validationErrorResponse,
  withAuthApi,
} from "@/lib/api-middleware";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/security/admin-audit";
import { enforceMutationGuards } from "@/lib/security/request-guards";

function parseIntParam(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const GET = withAuthApi(async (request: NextRequest) => {
  const url = new URL(request.url);

  const q = (url.searchParams.get("q") ?? "").trim();
  const statusParam = (url.searchParams.get("status") ?? "").trim();
  const entityTypeParam = (url.searchParams.get("entityType") ?? "").trim();
  const page = parseIntParam(url.searchParams.get("page"), 1);
  const limit = Math.min(parseIntParam(url.searchParams.get("limit"), 20), 100);

  const statusFilter = Object.values(ReportStatus).includes(statusParam as ReportStatus)
    ? (statusParam as ReportStatus)
    : undefined;
  const entityTypeFilter = Object.values(ReportEntityType).includes(entityTypeParam as ReportEntityType)
    ? (entityTypeParam as ReportEntityType)
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
            { reporter: { name: { contains: q, mode: "insensitive" } } },
            { reporter: { email: { contains: q, mode: "insensitive" } } },
            { event: { title: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [total, reports, summary] = await Promise.all([
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
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
        updatedAt: true,
        resolvedAt: true,
        reporter: {
          select: { id: true, name: true, email: true, role: true },
        },
        event: {
          select: { id: true, title: true, status: true, date: true },
        },
      },
    }),
    prisma.report.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  return successResponse(
    {
      reports,
      summary: summary.reduce<Record<string, number>>((acc, row) => {
        acc[row.status] = row._count._all;
        return acc;
      }, {}),
    },
    { page, limit, total },
  );
}, UserRole.ADMIN);

export const POST = withAuthApi(async (request: NextRequest, session) => {
  if (session instanceof Response) return session;

  const guardResponse = await enforceMutationGuards(request, { rateLimit: "moderate" });
  if (guardResponse) return guardResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationErrorResponse({ body: ["Invalid JSON body"] });
  }

  const entityType = (body as { entityType?: unknown } | null)?.entityType;
  const entityId = ((body as { entityId?: unknown } | null)?.entityId ?? "").toString().trim();
  const reason = ((body as { reason?: unknown } | null)?.reason ?? "").toString().trim();
  const message = ((body as { message?: unknown } | null)?.message ?? "").toString().trim();
  const priorityRaw = (body as { priority?: unknown } | null)?.priority;

  if (!Object.values(ReportEntityType).includes(entityType as ReportEntityType)) {
    return validationErrorResponse({ entityType: ["Must be EVENT or USER"] });
  }

  if (!entityId) {
    return validationErrorResponse({ entityId: ["Entity id is required"] });
  }

  if (!reason) {
    return validationErrorResponse({ reason: ["Reason is required"] });
  }

  const priority = Object.values(ReportPriority).includes(priorityRaw as ReportPriority)
    ? (priorityRaw as ReportPriority)
    : ReportPriority.MEDIUM;

  let eventId: string | null = null;
  if (entityType === ReportEntityType.EVENT) {
    const event = await prisma.event.findUnique({ where: { id: entityId }, select: { id: true } });
    if (!event) {
      return notFoundResponse("Event not found for report");
    }
    eventId = event.id;
  }

  const created = await prisma.report.create({
    data: {
      reporterId: session.user.id,
      entityType: entityType as ReportEntityType,
      entityId,
      eventId,
      reason,
      message: message || null,
      priority,
    },
  });

  if (session.user?.id) {
    await logAdminAction({
      request,
      adminId: session.user.id,
      action: "REPORT_UPDATED",
      targetType: "report",
      targetId: created.id,
      details: {
        status: created.status,
        priority: created.priority,
      },
    });
  }

  return successResponse({ report: created });
}, UserRole.ADMIN);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
