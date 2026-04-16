import { NextRequest } from "next/server";
import { NotificationCampaignStatus, UserRole } from "@prisma/client";

import {
  successResponse,
  validationErrorResponse,
  withAuthApi,
} from "@/lib/api-middleware";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/security/admin-audit";
import { enforceMutationGuards } from "@/lib/security/request-guards";

export const GET = withAuthApi(async () => {
  const [notifications, campaigns] = await Promise.all([
    prisma.notification.findMany({
      where: { type: "SYSTEM_ANNOUNCEMENT" },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        userId: true,
        title: true,
        message: true,
        createdAt: true,
        campaignId: true,
      },
    }),
    prisma.notificationCampaign.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        role: true,
        status: true,
        scheduledFor: true,
        sentAt: true,
        recipientsCount: true,
        createdAt: true,
      },
    }),
  ]);

  return successResponse({ notifications, campaigns });
}, UserRole.ADMIN);

export const POST = withAuthApi(async (request: NextRequest, session) => {
  if (session instanceof Response) return session;

  const adminId = session.user?.id;
  if (!adminId) {
    return validationErrorResponse({ auth: ["Admin session is missing user id"] });
  }

  const guardResponse = await enforceMutationGuards(request, { rateLimit: "strict" });
  if (guardResponse) return guardResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationErrorResponse({ body: ["Invalid JSON body"] });
  }

  const title = ((body as { title?: unknown } | null)?.title ?? "").toString().trim();
  const message = ((body as { message?: unknown } | null)?.message ?? "").toString().trim();
  const role = ((body as { role?: unknown } | null)?.role ?? "ALL").toString().trim().toUpperCase();
  const scheduledForRaw = (body as { scheduledFor?: unknown } | null)?.scheduledFor;

  if (!title) {
    return validationErrorResponse({ title: ["Title is required"] });
  }

  if (!message) {
    return validationErrorResponse({ message: ["Message is required"] });
  }

  const allowedRoles = ["STUDENT", "ORGANIZER", "ADMIN", "ALL"];
  if (!allowedRoles.includes(role)) {
    return validationErrorResponse({ role: ["Role must be STUDENT, ORGANIZER, ADMIN, or ALL"] });
  }

  const scheduledFor =
    typeof scheduledForRaw === "string" && scheduledForRaw.trim().length > 0
      ? new Date(scheduledForRaw)
      : null;

  if (scheduledFor && Number.isNaN(scheduledFor.getTime())) {
    return validationErrorResponse({ scheduledFor: ["Invalid schedule date"] });
  }

  const users = await prisma.user.findMany({
    where: role === "ALL" ? undefined : { role: role as UserRole },
    select: { id: true },
    take: 5000,
  });

  if (users.length === 0) {
    return successResponse({ createdCount: 0, scheduled: Boolean(scheduledFor) });
  }

  const shouldSchedule = Boolean(scheduledFor && scheduledFor.getTime() > Date.now());

  if (shouldSchedule) {
    const campaign = await prisma.notificationCampaign.create({
      data: {
        title,
        message,
        role,
        status: NotificationCampaignStatus.SCHEDULED,
        scheduledFor,
        recipientsCount: users.length,
        createdById: adminId,
      },
    });

    await logAdminAction({
      request,
      adminId,
      action: "NOTIFICATION_SCHEDULED",
      targetType: "notification_campaign",
      targetId: campaign.id,
      details: {
        role,
        recipients: users.length,
        scheduledFor,
      },
    });

    return successResponse({
      createdCount: 0,
      scheduled: true,
      campaignId: campaign.id,
    });
  }

  const campaign = await prisma.notificationCampaign.create({
    data: {
      title,
      message,
      role,
      status: NotificationCampaignStatus.SENT,
      sentAt: new Date(),
      recipientsCount: users.length,
      createdById: adminId,
    },
  });

  await prisma.notification.createMany({
    data: users.map((user) => ({
      userId: user.id,
      campaignId: campaign.id,
      title,
      message,
      type: "SYSTEM_ANNOUNCEMENT",
      read: false,
    })),
  });

  await logAdminAction({
    request,
    adminId,
    action: "NOTIFICATION_SENT",
    targetType: "notification_campaign",
    targetId: campaign.id,
    details: {
      role,
      recipients: users.length,
    },
  });

  return successResponse({
    createdCount: users.length,
    scheduled: false,
    campaignId: campaign.id,
  });
}, UserRole.ADMIN);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
