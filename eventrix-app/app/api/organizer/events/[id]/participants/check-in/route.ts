import { handleApiError, successResponse, validateBody } from "@/lib/api";
import { NotFoundError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { organizerCheckInSchema } from "@/lib/organizer/event-schemas";
import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { isDatabaseAvailable, requireOwnedEventBasic } from "@/lib/organizer/ownership";

export const POST = handleApiError(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireOrganizerApiSession();
  const { id } = await ctx.params;
  const body = await validateBody(req, organizerCheckInSchema);

  if (!isDatabaseAvailable()) {
    return successResponse({ updated: 0 });
  }

  await requireOwnedEventBasic(session.user.id, id);

  const registration = await prisma.registration.findFirst({
    where: { id: body.registrationId, eventId: id },
    select: { id: true },
  });

  if (!registration) throw new NotFoundError("Registration", body.registrationId);

  await prisma.registration.update({
    where: { id: body.registrationId },
    data: {
      status: "ATTENDED",
      checkInTime: new Date(),
    },
  });

  return successResponse({ updated: 1 });
});
