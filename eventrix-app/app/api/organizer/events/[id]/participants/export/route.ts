import { handleApiError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { isDatabaseAvailable, requireOwnedEventBasic } from "@/lib/organizer/ownership";
import { NextResponse } from "next/server";

function toCsvCell(value: unknown) {
  const str = value == null ? "" : String(value);
  return JSON.stringify(str);
}

export const GET = handleApiError(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireOrganizerApiSession();
  const { id } = await ctx.params;

  if (!isDatabaseAvailable()) {
    return new NextResponse("name,email,status,registeredAt,checkInTime\n", {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=event-${id}-participants.csv`,
      },
    });
  }

  const { event } = await requireOwnedEventBasic(session.user.id, id);

  const rows = await prisma.registration.findMany({
    where: { eventId: id },
    orderBy: { registeredAt: "desc" },
    select: {
      status: true,
      registeredAt: true,
      checkInTime: true,
      user: {
        select: {
          name: true,
          email: true,
          department: true,
        },
      },
    },
  });

  const header = ["name", "email", "department", "status", "registeredAt", "checkInTime"];
  const csvRows = rows.map((row) => [
    toCsvCell(row.user.name),
    toCsvCell(row.user.email),
    toCsvCell(row.user.department),
    toCsvCell(row.status),
    toCsvCell(row.registeredAt.toISOString()),
    toCsvCell(row.checkInTime?.toISOString() ?? ""),
  ].join(","));

  const csv = [header.join(","), ...csvRows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=${event.id}-participants.csv`,
    },
  });
});
