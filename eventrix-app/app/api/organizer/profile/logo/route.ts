import { handleApiError, successResponse } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { isDatabaseAvailable } from "@/lib/organizer/ownership";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const POST = handleApiError(async (req: Request) => {
  const session = await requireOrganizerApiSession();

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return successResponse({ url: null }, 400);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = `${Date.now()}-${file.name}`.replace(/[^a-zA-Z0-9._-]/g, "-");

  const uploadDir = path.join(process.cwd(), "public", "uploads", "organizer", "logos");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, safeName);
  await writeFile(filePath, buffer);

  const url = `/uploads/organizer/logos/${safeName}`;

  if (isDatabaseAvailable()) {
    await prisma.organizer.upsert({
      where: { userId: session.user.id },
      update: { logo: url },
      create: {
        userId: session.user.id,
        organizationName: session.user.name || "Organizer",
        logo: url,
      },
      select: { id: true },
    });
  }

  return successResponse({ url });
});
