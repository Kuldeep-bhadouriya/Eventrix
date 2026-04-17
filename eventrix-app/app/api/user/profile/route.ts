import { getServerSession } from "next-auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleApiError, rateLimitPresets, successResponse, validateBody, withLogging } from "@/lib/api";
import { AuthenticationError, AuthorizationError, ConflictError, NotFoundError } from "@/lib/api/api-error";
import { getUserProfile } from "@/lib/dashboard/profile-queries";
import { UserRole } from "@prisma/client";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

const updateSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().max(50).nullable().optional(),
  collegeRollNumber: z.string().max(50).nullable().optional(),
  semester: z.string().max(50).nullable().optional(),
  department: z.string().max(100).nullable().optional(),
});

export const GET = handleApiError(
  withLogging(async (req, log) => {
    await rateLimitPresets.generous(req);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new AuthenticationError();
    if (session.user.role !== UserRole.STUDENT) throw new AuthorizationError();

    const profile = await getUserProfile(session.user.id);
    if (!profile) throw new NotFoundError("Profile");

    log.info("Fetched profile", { userId: session.user.id });
    return successResponse(profile);
  })
);

export const PUT = handleApiError(
  withLogging(async (req, log) => {
    await rateLimitPresets.generous(req);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new AuthenticationError();
    if (session.user.role !== UserRole.STUDENT) throw new AuthorizationError();

    if (!isDatabaseAvailable()) throw new ConflictError("Database not configured");

    const body = await validateBody(req, updateSchema);

    if (body.collegeRollNumber) {
      const existingUserWithRollNumber = await prisma.user.findFirst({
        where: {
          collegeRollNumber: body.collegeRollNumber,
          NOT: { id: session.user.id },
        },
        select: { id: true },
      });

      if (existingUserWithRollNumber) {
        throw new ConflictError("This college roll number is already registered");
      }
    }

    let updated;
    try {
      updated = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: body.name,
          phone: body.phone ?? null,
          collegeRollNumber: body.collegeRollNumber ?? null,
          semester: body.semester ?? null,
          department: body.department ?? null,
        },
        select: { id: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        Array.isArray(error.meta?.target) &&
        error.meta.target.includes("collegeRollNumber")
      ) {
        throw new ConflictError("This college roll number is already registered");
      }

      throw error;
    }

    log.info("Updated profile", { userId: updated.id });
    return successResponse({ ok: true });
  })
);
