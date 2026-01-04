import { handleApiError, successResponse } from "@/lib/api";
import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { getOrganizerDashboardCharts } from "@/lib/organizer/dashboard-queries";

export const GET = handleApiError(async () => {
  const session = await requireOrganizerApiSession();
  const charts = await getOrganizerDashboardCharts(session.user.id);
  return successResponse(charts);
});
