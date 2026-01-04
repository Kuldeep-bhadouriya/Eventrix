import { handleApiError, successResponse, validateBody } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { organizerBulkActionSchema } from "@/lib/organizer/event-schemas";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export const POST = handleApiError(async (req: Request) => {
  const session = await requireOrganizerApiSession();
  const body = await validateBody(req, organizerBulkActionSchema);

  if (!isDatabaseAvailable()) return successResponse({ updated: 0 });

  const organizer = await prisma.organizer.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!organizer) return successResponse({ updated: 0 });

  const res = await prisma.event.updateMany({
    where: { id: { in: body.ids }, organizerId: organizer.id },
    data: { status: "CLOSED" },
  });

  return successResponse({ updated: res.count });
});
