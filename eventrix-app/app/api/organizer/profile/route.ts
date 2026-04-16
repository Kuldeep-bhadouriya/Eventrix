import { handleApiError, successResponse, validateBody } from "@/lib/api";
import { prisma } from "@/lib/db";
import { z } from "zod";

import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { isDatabaseAvailable } from "@/lib/organizer/ownership";

const updateSchema = z.object({
  organizationName: z.string().min(1).max(200),
  bio: z.string().max(2000).optional().nullable(),
  website: z.string().max(300).optional().nullable(),
  industry: z.string().max(120).optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  socialLinks: z
    .object({
      twitter: z.string().optional().nullable(),
      linkedin: z.string().optional().nullable(),
      instagram: z.string().optional().nullable(),
      facebook: z.string().optional().nullable(),
    })
    .optional(),
});

function toSocialLinks(payload: z.infer<typeof updateSchema>) {
  const current = payload.socialLinks ?? {};
  return {
    ...current,
    website: payload.website ?? undefined,
    industry: payload.industry ?? undefined,
    contactEmail: payload.contactEmail ?? undefined,
  };
}

export const GET = handleApiError(async () => {
  const session = await requireOrganizerApiSession();

  if (!isDatabaseAvailable()) {
    return successResponse({
      organizationName: session.user.name ?? "Organizer",
      logo: null,
      bio: null,
      verified: false,
      socialLinks: {},
      user: {
        name: session.user.name,
        email: session.user.email,
      },
    });
  }

  const organizer = await prisma.organizer.upsert({
    where: { userId: session.user.id },
    update: {},
    create: {
      userId: session.user.id,
      organizationName: session.user.name || "Organizer",
    },
    select: {
      id: true,
      organizationName: true,
      logo: true,
      bio: true,
      verified: true,
      socialLinks: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return successResponse(organizer);
});

export const PUT = handleApiError(async (req: Request) => {
  const session = await requireOrganizerApiSession();
  const body = await validateBody(req, updateSchema);

  if (!isDatabaseAvailable()) {
    return successResponse({ ok: true });
  }

  const organizer = await prisma.organizer.upsert({
    where: { userId: session.user.id },
    update: {
      organizationName: body.organizationName,
      bio: body.bio ?? null,
      socialLinks: toSocialLinks(body),
    },
    create: {
      userId: session.user.id,
      organizationName: body.organizationName,
      bio: body.bio ?? null,
      socialLinks: toSocialLinks(body),
    },
    select: { id: true },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: body.organizationName,
    },
    select: { id: true },
  });

  return successResponse({ ok: true, organizerId: organizer.id });
});
