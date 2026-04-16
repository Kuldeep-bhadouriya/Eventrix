import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";

import {
  successResponse,
  validationErrorResponse,
  withAuthApi,
} from "@/lib/api-middleware";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/security/admin-audit";
import { enforceMutationGuards } from "@/lib/security/request-guards";

const DEFAULT_TEMPLATES = [
  {
    name: "welcome",
    subject: "Welcome to Eventrix",
    body: "Hi {{name}},\\n\\nWelcome to Eventrix. Start exploring events that match your interests.\\n\\n- Team Eventrix",
    variables: ["name"],
    enabled: true,
  },
  {
    name: "event_reminder",
    subject: "Reminder: {{eventTitle}} starts soon",
    body: "Hi {{name}},\\n\\nThis is a reminder that {{eventTitle}} starts on {{eventDate}} at {{eventTime}}.\\n\\nSee you there!",
    variables: ["name", "eventTitle", "eventDate", "eventTime"],
    enabled: true,
  },
  {
    name: "password_reset",
    subject: "Reset your password",
    body: "Hi {{name}},\\n\\nUse this link to reset your password: {{resetLink}}\\n\\nIf you did not request this, please ignore this email.",
    variables: ["name", "resetLink"],
    enabled: true,
  },
];

export async function ensureDefaultTemplates() {
  const count = await prisma.emailTemplate.count();
  if (count > 0) return;

  await prisma.emailTemplate.createMany({
    data: DEFAULT_TEMPLATES,
    skipDuplicates: true,
  });
}

export const GET = withAuthApi(async () => {
  await ensureDefaultTemplates();

  const templates = await prisma.emailTemplate.findMany({
    orderBy: { name: "asc" },
  });

  return successResponse({ templates });
}, UserRole.ADMIN);

export const PUT = withAuthApi(async (request: NextRequest, session) => {
  if (session instanceof Response) return session;

  const guardResponse = await enforceMutationGuards(request, { rateLimit: "moderate" });
  if (guardResponse) return guardResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationErrorResponse({ body: ["Invalid JSON body"] });
  }

  const name = ((body as { name?: unknown } | null)?.name ?? "").toString().trim();
  const subject = ((body as { subject?: unknown } | null)?.subject ?? "").toString().trim();
  const textBody = ((body as { body?: unknown } | null)?.body ?? "").toString().trim();
  const variablesRaw = (body as { variables?: unknown } | null)?.variables;
  const enabledRaw = (body as { enabled?: unknown } | null)?.enabled;

  if (!name) {
    return validationErrorResponse({ name: ["Template name is required"] });
  }

  if (!subject) {
    return validationErrorResponse({ subject: ["Template subject is required"] });
  }

  if (!textBody) {
    return validationErrorResponse({ body: ["Template body is required"] });
  }

  const variables = Array.isArray(variablesRaw)
    ? variablesRaw.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const enabled = typeof enabledRaw === "boolean" ? enabledRaw : true;

  const template = await prisma.emailTemplate.upsert({
    where: { name },
    update: {
      subject,
      body: textBody,
      variables,
      enabled,
    },
    create: {
      name,
      subject,
      body: textBody,
      variables,
      enabled,
    },
  });

  if (session.user?.id) {
    await logAdminAction({
      request,
      adminId: session.user.id,
      action: "TEMPLATE_UPDATED",
      targetType: "email_template",
      targetId: template.id,
      details: {
        name,
        enabled,
      },
    });
  }

  return successResponse({ template });
}, UserRole.ADMIN);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
