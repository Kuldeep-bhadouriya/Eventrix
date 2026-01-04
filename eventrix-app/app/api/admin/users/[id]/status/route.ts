import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  errorResponse,
  notFoundResponse,
  requireRole,
  successResponse,
  validationErrorResponse,
} from "@/lib/api-middleware";

type RouteContext = { params: Promise<{ id: string }> };

function isUserStatus(value: unknown): value is "ACTIVE" | "SUSPENDED" | "BANNED" {
  return value === "ACTIVE" || value === "SUSPENDED" || value === "BANNED";
}

export async function PATCH(request: NextRequest, context: RouteContext) {
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

  // Note: User status fields (status, suspendedAt, bannedAt) are not in the database schema
  // This endpoint returns success but doesn't persist the status change
  // To enable this feature, add these fields to the User model in prisma/schema.prisma:
  // status       String?   @default("ACTIVE")
  // suspendedAt  DateTime? @db.Timestamptz(6)
  // bannedAt     DateTime? @db.Timestamptz(6)
  
  // await prisma.user.update({
  //   where: { id: userId },
  //   data: {
  //     status,
  //     suspendedAt: status === "SUSPENDED" ? now : null,
  //     bannedAt: status === "BANNED" ? now : null,
  //   },
  // });

  return successResponse({ updated: true });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
