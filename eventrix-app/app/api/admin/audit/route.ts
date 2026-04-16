import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";

import { successResponse, withAuthApi } from "@/lib/api-middleware";
import { prisma } from "@/lib/db";

function parseIntParam(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const GET = withAuthApi(async (request: NextRequest) => {
  const url = new URL(request.url);
  const action = (url.searchParams.get("action") ?? "").trim();
  const targetType = (url.searchParams.get("targetType") ?? "").trim();
  const page = parseIntParam(url.searchParams.get("page"), 1);
  const limit = Math.min(parseIntParam(url.searchParams.get("limit"), 25), 100);

  const where = {
    ...(action ? { action } : {}),
    ...(targetType ? { targetType } : {}),
  };

  const [total, logs] = await Promise.all([
    prisma.adminAuditLog.count({ where }),
    prisma.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        details: true,
        ipAddress: true,
        createdAt: true,
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  return successResponse(
    {
      logs,
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
