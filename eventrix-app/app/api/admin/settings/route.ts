import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

import {
  successResponse,
  validationErrorResponse,
  withAuthApi,
} from "@/lib/api-middleware";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { logAdminAction } from "@/lib/security/admin-audit";
import { enforceMutationGuards } from "@/lib/security/request-guards";

export const GET = withAuthApi(async (request: NextRequest) => {
  const url = new URL(request.url);
  const category = (url.searchParams.get("category") ?? "").trim();

  const settings = await prisma.adminSetting.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ category: "asc" }, { key: "asc" }],
  });

  return successResponse({ settings });
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

  const key = ((body as { key?: unknown } | null)?.key ?? "").toString().trim();
  const category = ((body as { category?: unknown } | null)?.category ?? "general").toString().trim() || "general";
  const value = (body as { value?: unknown } | null)?.value;
  const description = ((body as { description?: unknown } | null)?.description ?? "").toString().trim();

  if (!key) {
    return validationErrorResponse({ key: ["Setting key is required"] });
  }

  if (value === undefined) {
    return validationErrorResponse({ value: ["Setting value is required"] });
  }

  const setting = await prisma.adminSetting.upsert({
    where: { key },
    update: {
      category,
      value: value as Prisma.InputJsonValue,
      description: description || null,
    },
    create: {
      key,
      category,
      value: value as Prisma.InputJsonValue,
      description: description || null,
    },
  });

  if (session.user?.id) {
    await logAdminAction({
      request,
      adminId: session.user.id,
      action: "SETTING_UPDATED",
      targetType: "admin_setting",
      targetId: setting.id,
      details: {
        key,
        category,
      },
    });
  }

  return successResponse({ setting });
}, UserRole.ADMIN);

export const POST = withAuthApi(async (request: NextRequest, session) => {
  if (session instanceof Response) return session;

  const guardResponse = await enforceMutationGuards(request, { rateLimit: "moderate" });
  if (guardResponse) return guardResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationErrorResponse({ body: ["Invalid JSON body"] });
  }

  const items = (body as { items?: unknown } | null)?.items;

  if (!Array.isArray(items) || items.length === 0) {
    return validationErrorResponse({ items: ["items must be a non-empty array"] });
  }

  if (items.length > 100) {
    return validationErrorResponse({ items: ["Too many settings in one request (max 100)"] });
  }

  const result = await prisma.$transaction(
    items.map((item) => {
      const key = (item as { key?: unknown }).key?.toString().trim() ?? "";
      const category = (item as { category?: unknown }).category?.toString().trim() || "general";
      const value = (item as { value?: unknown }).value;
      const description = (item as { description?: unknown }).description?.toString().trim() ?? "";

      if (!key || value === undefined) {
        throw new Error("Each setting must include key and value");
      }

      return prisma.adminSetting.upsert({
        where: { key },
        update: {
          category,
          value: value as Prisma.InputJsonValue,
          description: description || null,
        },
        create: {
          key,
          category,
          value: value as Prisma.InputJsonValue,
          description: description || null,
        },
      });
    }),
  );

  if (session.user?.id) {
    await logAdminAction({
      request,
      adminId: session.user.id,
      action: "SETTING_UPDATED",
      targetType: "admin_setting",
      details: {
        updatedCount: result.length,
      },
    });
  }

  return successResponse({ updatedCount: result.length });
}, UserRole.ADMIN);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
