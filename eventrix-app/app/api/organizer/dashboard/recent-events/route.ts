import { handleApiError, successResponse, validateQuery } from "@/lib/api";
import { z } from "zod";

import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { getOrganizerRecentEvents } from "@/lib/organizer/dashboard-queries";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(5),
});

export const GET = handleApiError(async (req: Request) => {
  const session = await requireOrganizerApiSession();
  const { limit } = validateQuery(req, querySchema);
  const events = await getOrganizerRecentEvents(session.user.id, limit);
  return successResponse(events);
});
