import { handleApiError, successResponse } from "@/lib/api";
import { requireOrganizerApiSession } from "@/lib/organizer/api-auth";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

export const GET = handleApiError(async () => {
  await requireOrganizerApiSession();

  const dir = path.join(process.cwd(), "public", "uploads", "organizer", "cert-templates");

  let files: string[] = [];
  try {
    files = await readdir(dir);
  } catch {
    files = [];
  }

  const templates = await Promise.all(
    files.map(async (name) => {
      const s = await stat(path.join(dir, name));
      return {
        id: name,
        name,
        size: s.size,
        createdAt: s.mtime.toISOString(),
        url: `/uploads/organizer/cert-templates/${name}`,
      };
    }),
  );

  templates.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return successResponse(templates);
});
