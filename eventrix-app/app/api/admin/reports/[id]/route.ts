import { NextRequest, NextResponse } from "next/server";
import { ReportPriority, ReportStatus, UserRole } from "@prisma/client";

import {
  notFoundResponse,
  requireRole,
  successResponse,
  validationErrorResponse,
} from "@/lib/api-middleware";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/security/admin-audit";
import { enforceMutationGuards } from "@/lib/security/request-guards";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await requireRole(UserRole.ADMIN);
  if (session instanceof NextResponse) return session;

  const { id } = await context.params;

  const report = await prisma.report.findUnique({
    where: { id },
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
      resolvedAt: true,
      reporter: {
        select: { id: true, name: true, email: true, role: true },
      },
      event: {
        select: { id: true, title: true, status: true },
      },
    },
  });

  if (!report) {
    return notFoundResponse("Report not found");
  }

  return successResponse({ report });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const guardResponse = await enforceMutationGuards(request, { rateLimit: "moderate" });
  if (guardResponse) return guardResponse;

  const session = await requireRole(UserRole.ADMIN);
  if (session instanceof NextResponse) return session;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationErrorResponse({ body: ["Invalid JSON body"] });
  }

  const statusRaw = (body as { status?: unknown } | null)?.status;
  const priorityRaw = (body as { priority?: unknown } | null)?.priority;
  const adminNotesRaw = (body as { adminNotes?: unknown } | null)?.adminNotes;

  const status = Object.values(ReportStatus).includes(statusRaw as ReportStatus)
    ? (statusRaw as ReportStatus)
    : undefined;
  const priority = Object.values(ReportPriority).includes(priorityRaw as ReportPriority)
    ? (priorityRaw as ReportPriority)
    : undefined;
  const adminNotes = adminNotesRaw === undefined ? undefined : String(adminNotesRaw).trim();

  if (!status && !priority && adminNotes === undefined) {
    return validationErrorResponse({ body: ["Provide at least one field: status, priority, or adminNotes"] });
  }

  const existing = await prisma.report.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return notFoundResponse("Report not found");
  }

  const resolved = status === ReportStatus.RESOLVED || status === ReportStatus.DISMISSED;

  const report = await prisma.report.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(adminNotes !== undefined ? { adminNotes: adminNotes || null } : {}),
      ...(status ? { resolvedAt: resolved ? new Date() : null } : {}),
    },
  });

  if (session.user?.id) {
    await logAdminAction({
      request,
      adminId: session.user.id,
      action: "REPORT_UPDATED",
      targetType: "report",
      targetId: report.id,
      details: {
        status: report.status,
        priority: report.priority,
      },
    });
  }

  return successResponse({ report });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
