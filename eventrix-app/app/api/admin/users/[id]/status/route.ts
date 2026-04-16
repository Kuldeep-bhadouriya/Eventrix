import { NextRequest, NextResponse } from "next/server";
import { UserRole, UserStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  errorResponse,
  notFoundResponse,
  requireRole,
  successResponse,
  validationErrorResponse,
} from "@/lib/api-middleware";
import { logAdminAction } from "@/lib/security/admin-audit";
import { enforceMutationGuards } from "@/lib/security/request-guards";

type RouteContext = { params: Promise<{ id: string }> };

function isUserStatus(value: unknown): value is UserStatus {
  return value === UserStatus.ACTIVE || value === UserStatus.SUSPENDED || value === UserStatus.BANNED;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const guardResponse = await enforceMutationGuards(request, { rateLimit: "strict" });
  if (guardResponse) return guardResponse;

  const session = await requireRole(UserRole.ADMIN);
  if (session instanceof NextResponse) return session;

  const { id: userId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationErrorResponse({ body: ["Invalid JSON body"] });
  }

  const status = (body as { status?: unknown } | null)?.status;
  if (!isUserStatus(status)) {
    return validationErrorResponse({ status: ["Must be one of: ACTIVE, SUSPENDED, BANNED"] });
  }

  const actorId = session.user?.id;
  if (actorId && actorId === userId && (status === "SUSPENDED" || status === "BANNED")) {
    return errorResponse("You cannot suspend/ban your own account", 400, "INVALID_ACTION");
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!existing) {
    return notFoundResponse("User not found");
  }

  const now = new Date();

  await prisma.user.update({
    where: { id: userId },
    data: {
      status,
      suspendedAt: status === UserStatus.SUSPENDED ? now : null,
      bannedAt: status === UserStatus.BANNED ? now : null,
    },
  });

  if (actorId) {
    await logAdminAction({
      request,
      adminId: actorId,
      action: "USER_STATUS_CHANGED",
      targetType: "user",
      targetId: userId,
      details: {
        status,
      },
    });
  }

  return successResponse({ updated: true });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
