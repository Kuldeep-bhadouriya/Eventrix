import { defineConfig } from "prisma/config";

// Prisma 7 config for Prisma CLI (migrate/generate).
//
// NOTE:
// - We intentionally do NOT point this at production here.
// - For local/dev workflows, Prisma will load env vars from prisma/.env.local.
// - For CI/staging/prod, provide DATABASE_URL via the deployment environment.

export default defineConfig({
  schema: "./schema.prisma",
});
