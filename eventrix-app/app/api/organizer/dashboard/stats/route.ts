import { handleApiError, successResponse } from "@/lib/api";
import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { getOrganizerDashboardStats } from "@/lib/organizer/dashboard-queries";

export const GET = handleApiError(async () => {
  const session = await requireOrganizerApiSession();
  const stats = await getOrganizerDashboardStats(session.user.id);
  return successResponse(stats);
});
