import { handleApiError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { isDatabaseAvailable, requireOwnedEventBasic } from "@/lib/organizer/ownership";
import { NextResponse } from "next/server";

export const GET = handleApiError(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireOrganizerApiSession();
  const { id } = await ctx.params;

  if (!isDatabaseAvailable()) {
    return new NextResponse("metric,value\nregistrations,0\nattended,0\ncancelled,0\n", {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=event-${id}-analytics.csv`,
      },
    });
  }

  const { event } = await requireOwnedEventBasic(session.user.id, id);

  const [total, attended, cancelled, certificates] = await Promise.all([
    prisma.registration.count({ where: { eventId: id } }),
    prisma.registration.count({ where: { eventId: id, status: "ATTENDED" } }),
    prisma.registration.count({ where: { eventId: id, status: "CANCELLED" } }),
    prisma.certificate.count({ where: { eventId: id } }),
  ]);

  const rows = [
    ["eventId", event.id],
    ["eventTitle", event.title],
    ["registrations", String(total)],
    ["attended", String(attended)],
    ["cancelled", String(cancelled)],
    ["certificates", String(certificates)],
  ];

  const csv = ["metric,value", ...rows.map(([metric, value]) => `${metric},${JSON.stringify(value)}`)].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=event-${event.id}-analytics.csv`,
    },
  });
});
