import { handleApiError, successResponse, validateBody } from "@/lib/api";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

const schema = z.object({
  action: z.enum(["publish", "cancel", "delete"]),
  ids: z.array(z.string().min(1)).min(1),
});

export const POST = handleApiError(async (req: Request) => {
  const session = await requireOrganizerApiSession();
  const body = await validateBody(req, schema);

  if (!isDatabaseAvailable()) return successResponse({ affected: 0 });

  const organizer = await prisma.organizer.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!organizer) return successResponse({ affected: 0 });

  if (body.action === "delete") {
    const res = await prisma.event.deleteMany({
      where: { id: { in: body.ids }, organizerId: organizer.id },
    });
    return successResponse({ affected: res.count });
  }

  const status = body.action === "publish" ? "PUBLISHED" : "CLOSED";
  const res = await prisma.event.updateMany({
    where: { id: { in: body.ids }, organizerId: organizer.id },
    data: { status },
  });

  return successResponse({ affected: res.count });
});
