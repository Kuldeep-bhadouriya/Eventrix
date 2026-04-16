import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import nodemailer from "nodemailer";

import {
  errorResponse,
  successResponse,
  validationErrorResponse,
  withAuthApi,
} from "@/lib/api-middleware";
import { prisma } from "@/lib/db";
import { isValidEmail } from "@/lib/auth-utils";
import { logAdminAction } from "@/lib/security/admin-audit";
import { enforceMutationGuards } from "@/lib/security/request-guards";

function applyVariables(template: string, values: Record<string, string>) {
  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, variableName: string) => {
    return values[variableName] ?? "";
  });
}

export const POST = withAuthApi(async (request: NextRequest, session) => {
  if (session instanceof Response) return session;

  const adminId = session.user?.id;
  if (!adminId) {
    return validationErrorResponse({ auth: ["Admin session is missing user id"] });
  }

  const guardResponse = await enforceMutationGuards(request, { rateLimit: "moderate" });
  if (guardResponse) return guardResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationErrorResponse({ body: ["Invalid JSON body"] });
  }

  const templateName = ((body as { templateName?: unknown } | null)?.templateName ?? "").toString().trim();
  const recipientEmail = ((body as { recipientEmail?: unknown } | null)?.recipientEmail ?? "").toString().trim();
  const variablesRaw = (body as { variables?: unknown } | null)?.variables;

  if (!templateName) {
    return validationErrorResponse({ templateName: ["Template name is required"] });
  }

  if (!recipientEmail || !isValidEmail(recipientEmail)) {
    return validationErrorResponse({ recipientEmail: ["A valid recipient email is required"] });
  }

  if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
    return errorResponse("SMTP credentials are not configured", 503, "EMAIL_NOT_CONFIGURED");
  }

  const template = await prisma.emailTemplate.findUnique({
    where: { name: templateName },
  });

  if (!template) {
    return validationErrorResponse({ templateName: ["Template not found"] });
  }

  if (!template.enabled) {
    return validationErrorResponse({ templateName: ["Template is disabled"] });
  }

  const variables =
    variablesRaw && typeof variablesRaw === "object"
      ? Object.fromEntries(
          Object.entries(variablesRaw as Record<string, unknown>).map(([key, value]) => [key, String(value ?? "")]),
        )
      : {};

  const mergedVariables: Record<string, string> = {
    name: session.user.name ?? "Eventrix User",
    eventTitle: "Sample Event",
    eventDate: new Date().toLocaleDateString(),
    eventTime: "10:00 AM",
    resetLink: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password?token=sample`,
    ...variables,
  };

  const subject = applyVariables(template.subject, mergedVariables);
  const textBody = applyVariables(template.body, mergedVariables);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || "587", 10),
    secure: process.env.EMAIL_SERVER_SECURE === "true",
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@eventrix.com",
    to: recipientEmail,
    subject,
    text: textBody,
  });

  await logAdminAction({
    request,
    adminId,
    action: "TEMPLATE_TEST_SENT",
    targetType: "email_template_test",
    targetId: template.id,
    details: {
      templateName,
      recipientEmail,
    },
  });

  return successResponse({ sent: true });
}, UserRole.ADMIN);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
