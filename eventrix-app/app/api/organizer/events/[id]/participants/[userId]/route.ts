import { handleApiError, successResponse } from "@/lib/api";
import { NotFoundError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { isDatabaseAvailable, requireOwnedEventBasic } from "@/lib/organizer/ownership";

export const GET = handleApiError(
  async (_req: Request, ctx: { params: Promise<{ id: string; userId: string }> }) => {
    const session = await requireOrganizerApiSession();
    const { id, userId } = await ctx.params;

    if (!isDatabaseAvailable()) {
      throw new NotFoundError("Participant", userId);
    }

    await requireOwnedEventBasic(session.user.id, id);

    const registration = await prisma.registration.findUnique({
      where: { userId_eventId: { userId, eventId: id } },
      select: {
        id: true,
        status: true,
        registeredAt: true,
        checkInTime: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            semester: true,
            phone: true,
          },
        },
      },
    });

    if (!registration) throw new NotFoundError("Participant", userId);

    const certificate = await prisma.certificate.findUnique({
      where: { userId_eventId: { userId, eventId: id } },
      select: { id: true, issuedAt: true, downloadUrl: true },
    });

    return successResponse({
      registration: {
        id: registration.id,
        status: registration.status,
        registeredAt: registration.registeredAt.toISOString(),
        checkInTime: registration.checkInTime?.toISOString() ?? null,
      },
      user: registration.user,
      certificate: certificate
        ? {
            id: certificate.id,
            issuedAt: certificate.issuedAt.toISOString(),
            downloadUrl: certificate.downloadUrl,
          }
        : null,
    });
  },
);
