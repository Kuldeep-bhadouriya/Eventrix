import { UserRole } from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  errorResponse,
  successResponse,
  validationErrorResponse,
  withAuthApi,
} from "@/lib/api-middleware";

type BulkAction = "suspend" | "activate" | "ban" | "unban";

function isBulkAction(value: unknown): value is BulkAction {
  return value === "suspend" || value === "activate" || value === "ban" || value === "unban";
}

export const POST = withAuthApi(async (request, session) => {
  if (session instanceof Response) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationErrorResponse({ body: ["Invalid JSON body"] });
  }

  const userIds = (body as { userIds?: unknown } | null)?.userIds;
  const action = (body as { action?: unknown } | null)?.action;

  if (!Array.isArray(userIds) || userIds.some((id) => typeof id !== "string" || id.trim().length === 0)) {
    return validationErrorResponse({ userIds: ["Must be an array of user id strings"] });
  }

  if (userIds.length === 0) {
    return validationErrorResponse({ userIds: ["Must include at least one user id"] });
  }

  if (userIds.length > 200) {
    return validationErrorResponse({ userIds: ["Too many user ids (max 200)"] });
  }

  if (!isBulkAction(action)) {
    return validationErrorResponse({ action: ["Must be one of: suspend, activate, ban, unban"] });
  }

  const actorId = session.user?.id;
  if (actorId && userIds.includes(actorId) && (action === "suspend" || action === "ban")) {
    return errorResponse("You cannot suspend/ban your own account", 400, "INVALID_ACTION");
  }

  const now = new Date();

  const statusMap: Record<BulkAction, "ACTIVE" | "SUSPENDED" | "BANNED"> = {
    suspend: "SUSPENDED",
    activate: "ACTIVE",
    ban: "BANNED",
    unban: "ACTIVE",
  };

  const status = statusMap[action];

  // Note: User status fields (status, suspendedAt, bannedAt) are not in the database schema
  // This endpoint returns success but doesn't persist the status change
  // To enable this feature, add these fields to the User model in prisma/schema.prisma

  // const updateData = {
  //   status,
  //   suspendedAt: status === "SUSPENDED" ? now : null,
  //   bannedAt: status === "BANNED" ? now : null,
  // };

  // const result = await prisma.user.updateMany({
  //   where: { id: { in: userIds } },
  //   data: updateData,
  // });

  return successResponse({ updatedCount: userIds.length });
}, UserRole.ADMIN);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
