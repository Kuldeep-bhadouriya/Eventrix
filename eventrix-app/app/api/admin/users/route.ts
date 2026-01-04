import { prisma } from "@/lib/db";
import { successResponse, withAuthApi } from "@/lib/api-middleware";
import { Prisma, UserRole } from "@prisma/client";

export const GET = withAuthApi(async (request) => {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const role = (url.searchParams.get("role") ?? "").trim();
  const verified = (url.searchParams.get("verified") ?? "").trim();

  const roleFilter = Object.values(UserRole).includes(role as UserRole)
    ? (role as UserRole)
    : undefined;

  const where: Prisma.UserWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(roleFilter ? { role: roleFilter } : {}),
    ...(verified === "true" ? { emailVerified: { not: null } } : {}),
    ...(verified === "false" ? { emailVerified: null } : {}),
  };

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  return successResponse({ users });
}, UserRole.ADMIN);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
