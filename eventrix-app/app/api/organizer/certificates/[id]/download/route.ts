import { handleApiError } from "@/lib/api";
import { NotFoundError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { isDatabaseAvailable } from "@/lib/organizer/ownership";
import { NextResponse } from "next/server";

export const GET = handleApiError(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireOrganizerApiSession();
  const { id } = await ctx.params;

  if (!isDatabaseAvailable()) {
    throw new NotFoundError("Certificate", id);
  }

  const certificate = await prisma.certificate.findUnique({
    where: { id },
    select: {
      id: true,
      downloadUrl: true,
      templateUrl: true,
      event: {
        select: {
          organizer: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!certificate) throw new NotFoundError("Certificate", id);
  if (certificate.event.organizer.userId !== session.user.id) throw new NotFoundError("Certificate", id);

  const target = certificate.downloadUrl ?? certificate.templateUrl;
  if (!target) throw new NotFoundError("Certificate file", id);

  return NextResponse.redirect(new URL(target, req.url), 302);
});
