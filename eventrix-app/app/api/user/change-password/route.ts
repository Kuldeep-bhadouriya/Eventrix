import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth-utils";
import { handleApiError, rateLimitPresets, successResponse, validateBody, withLogging } from "@/lib/api";
import { AuthenticationError, AuthorizationError, ConflictError } from "@/lib/api/api-error";
import { UserRole } from "@prisma/client";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

const bodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const POST = handleApiError(
  withLogging(async (req, log) => {
    await rateLimitPresets.generous(req);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new AuthenticationError();
    if (session.user.role !== UserRole.STUDENT) throw new AuthorizationError();
    if (!isDatabaseAvailable()) throw new ConflictError("Database not configured");

    const body = await validateBody(req, bodySchema);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    });

    if (!user?.password) throw new ConflictError("Password cannot be changed for this account");

    const ok = await verifyPassword(body.currentPassword, user.password);
    if (!ok) throw new ConflictError("Current password is incorrect");

    const newHash = await hashPassword(body.newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { password: newHash } });

    log.info("Changed password", { userId: user.id });
    return successResponse({ ok: true });
  })
);
