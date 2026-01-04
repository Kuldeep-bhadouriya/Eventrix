import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import {
  handleApiError,
  paginatedResponse,
  rateLimitPresets,
  validateQuery,
  withLogging,
} from "@/lib/api";
import { AuthenticationError, AuthorizationError } from "@/lib/api/api-error";
import { UserRole } from "@prisma/client";
import {
  getUserRegistrations,
  type RegistrationTab,
  type RegistrationSort,
  type SortOrder,
} from "@/lib/dashboard/registrations-queries";

const querySchema = z.object({
  tab: z.enum(["all", "upcoming", "completed", "cancelled"]).optional(),
  search: z.string().optional(),
  sort: z.enum(["date", "name", "status"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const GET = handleApiError(
  withLogging(async (req, log) => {
    await rateLimitPresets.generous(req);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new AuthenticationError();
    if (session.user.role !== UserRole.STUDENT) throw new AuthorizationError();

    const query = validateQuery(req, querySchema);

    const tab = (query.tab ?? "all") as RegistrationTab;
    const sort = (query.sort ?? "date") as RegistrationSort;
    const order = (query.order ?? "asc") as SortOrder;
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    log.info("Fetching user registrations", {
      userId: session.user.id,
      tab,
      sort,
      order,
      page,
      limit,
      hasSearch: Boolean(query.search?.trim()),
    });

    const result = await getUserRegistrations({
      userId: session.user.id,
      tab,
      search: query.search,
      sort,
      order,
      page,
      limit,
    });

    // Return list with pagination meta (standardized)
    return paginatedResponse(result.items, result.pagination.page, result.pagination.limit, result.pagination.total);
  }),
);
