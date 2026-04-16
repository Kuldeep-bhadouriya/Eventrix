import { NextRequest, NextResponse } from "next/server";
import { EventStatus, ReportEntityType, ReportStatus, UserRole } from "@prisma/client";

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

type ModerationAction = "approve" | "reject" | "close" | "complete" | "draft";

function isModerationAction(value: unknown): value is ModerationAction {
  return value === "approve" || value === "reject" || value === "close" || value === "complete" || value === "draft";
}

function getEventStatus(action: ModerationAction): EventStatus {
  if (action === "approve") return EventStatus.PUBLISHED;
  if (action === "complete") return EventStatus.COMPLETED;
  if (action === "draft") return EventStatus.DRAFT;
  return EventStatus.CLOSED;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const guardResponse = await enforceMutationGuards(request, { rateLimit: "strict" });
  if (guardResponse) return guardResponse;

  const session = await requireRole(UserRole.ADMIN);
  if (session instanceof NextResponse) return session;

  const { id: eventId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationErrorResponse({ body: ["Invalid JSON body"] });
  }

  const action = (body as { action?: unknown } | null)?.action;
  const adminNotes = ((body as { adminNotes?: unknown } | null)?.adminNotes ?? "")
    .toString()
    .trim();

  if (!isModerationAction(action)) {
    return validationErrorResponse({ action: ["Must be one of: approve, reject, close, complete, draft"] });
  }

  const existing = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true },
  });

  if (!existing) {
    return notFoundResponse("Event not found");
  }

  const nextStatus = getEventStatus(action);
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.event.update({
      where: { id: eventId },
      data: { status: nextStatus },
    });

    if (action === "approve") {
      await tx.report.updateMany({
        where: {
          entityType: ReportEntityType.EVENT,
          entityId: eventId,
          status: { in: [ReportStatus.OPEN, ReportStatus.INVESTIGATING] },
        },
        data: {
          status: ReportStatus.DISMISSED,
          resolvedAt: now,
          adminNotes: adminNotes || "Dismissed during event approval.",
        },
      });
    }

    if (action === "reject" || action === "close" || action === "complete") {
      await tx.report.updateMany({
        where: {
          entityType: ReportEntityType.EVENT,
          entityId: eventId,
          status: { in: [ReportStatus.OPEN, ReportStatus.INVESTIGATING] },
        },
        data: {
          status: ReportStatus.RESOLVED,
          resolvedAt: now,
          adminNotes: adminNotes || "Resolved during moderation action.",
        },
      });
    }
  });

  if (session.user?.id) {
    await logAdminAction({
      request,
      adminId: session.user.id,
      action: "EVENT_MODERATED",
      targetType: "event",
      targetId: eventId,
      details: {
        action,
        status: nextStatus,
        notes: adminNotes || null,
      },
    });
  }

  return successResponse({
    updated: true,
    eventId,
    status: nextStatus,
    action,
  });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
