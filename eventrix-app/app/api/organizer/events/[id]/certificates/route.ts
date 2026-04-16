import { handleApiError, successResponse } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { isDatabaseAvailable, requireOwnedEventBasic } from "@/lib/organizer/ownership";

export const GET = handleApiError(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireOrganizerApiSession();
  const { id } = await ctx.params;

  if (!isDatabaseAvailable()) {
    return successResponse([]);
  }

  await requireOwnedEventBasic(session.user.id, id);

  const certificates = await prisma.certificate.findMany({
    where: { eventId: id },
    orderBy: { issuedAt: "desc" },
    select: {
      id: true,
      issuedAt: true,
      downloadUrl: true,
      templateUrl: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return successResponse(
    certificates.map((c) => ({
      id: c.id,
      issuedAt: c.issuedAt.toISOString(),
      downloadUrl: c.downloadUrl,
      templateUrl: c.templateUrl,
      user: c.user,
    })),
  );
});
