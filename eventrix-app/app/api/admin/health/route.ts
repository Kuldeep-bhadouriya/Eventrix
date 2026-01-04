import { prisma } from "@/lib/db";
import { successResponse, withAuthApi } from "@/lib/api-middleware";
import { UserRole } from "@prisma/client";

export const GET = withAuthApi(async () => {
  const start = Date.now();

  let dbOk = false;
  let dbResponseTimeMs: number | undefined;

  if (process.env.DATABASE_URL) {
    const dbStart = Date.now();
    try {
      await prisma.user.count();
      dbOk = true;
      dbResponseTimeMs = Date.now() - dbStart;
    } catch {
      dbOk = false;
      dbResponseTimeMs = Date.now() - dbStart;
    }
  }

  const responseTimeMs = Date.now() - start;

  const status: "healthy" | "degraded" | "down" = dbOk || !process.env.DATABASE_URL ? "healthy" : "degraded";

  return successResponse({
    status,
    responseTimeMs,
    db: {
      ok: dbOk,
      responseTimeMs: dbResponseTimeMs,
    },
    errorRatePct: 0,
  });
}, UserRole.ADMIN);

export const runtime = "nodejs";

// Ensure route handlers don't get cached
export const dynamic = "force-dynamic";
