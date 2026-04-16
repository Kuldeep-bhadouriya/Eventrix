import { handleApiError, successResponse } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { isDatabaseAvailable } from "@/lib/organizer/ownership";

export const POST = handleApiError(async () => {
  const session = await requireOrganizerApiSession();

  if (!isDatabaseAvailable()) {
    return successResponse({ verified: false, note: "Database not configured" });
  }

  const organizer = await prisma.organizer.upsert({
    where: { userId: session.user.id },
    update: { verified: true },
    create: {
      userId: session.user.id,
      organizationName: session.user.name || "Organizer",
      verified: true,
    },
    select: { verified: true },
  });

  return successResponse({ verified: organizer.verified });
});
