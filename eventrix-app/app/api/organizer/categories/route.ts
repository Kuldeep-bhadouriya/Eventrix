import { handleApiError, successResponse } from "@/lib/api";
import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { EVENT_CATEGORIES } from "@/lib/constants/event-categories";

export const GET = handleApiError(async () => {
  await requireOrganizerApiSession();
  return successResponse(EVENT_CATEGORIES);
});
