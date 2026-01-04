import { handleApiError, successResponse } from "@/lib/api";
import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const POST = handleApiError(async (req: Request) => {
  await requireOrganizerApiSession();

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return successResponse({ url: null }, 400);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = `${Date.now()}-${file.name}`.replace(/[^a-zA-Z0-9._-]/g, "-");

  const uploadDir = path.join(process.cwd(), "public", "uploads", "organizer");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, safeName);
  await writeFile(filePath, buffer);

  return successResponse({ url: `/uploads/organizer/${safeName}` });
});
