import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

type AuditAction =
  | "USER_STATUS_CHANGED"
  | "USER_BULK_ACTION"
  | "EVENT_MODERATED"
  | "REPORT_UPDATED"
  | "SETTING_UPDATED"
  | "TEMPLATE_UPDATED"
  | "TEMPLATE_TEST_SENT"
  | "NOTIFICATION_SENT"
  | "NOTIFICATION_SCHEDULED";

function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip");
}

export async function logAdminAction(input: {
  request: Request;
  adminId: string;
  action: AuditAction;
  targetType: string;
  targetId?: string | null;
  details?: unknown;
}): Promise<void> {
  if (!process.env.DATABASE_URL) {
    return;
  }

  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId: input.adminId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId ?? null,
        details:
          input.details === undefined
            ? undefined
            : input.details === null
              ? Prisma.JsonNull
              : (input.details as Prisma.InputJsonValue),
        ipAddress: getClientIp(input.request),
        userAgent: input.request.headers.get("user-agent"),
      },
    });
  } catch (error) {
    console.error("Failed to persist admin audit log", error);
  }
}
