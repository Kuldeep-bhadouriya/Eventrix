import "dotenv/config";

import { defineConfig } from "prisma/config";

const datasourceUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!datasourceUrl) {
  throw new Error(
    "Prisma config: missing DIRECT_URL/DATABASE_URL. Ensure .env is present or env vars are set.",
  );
}

// Prisma 7 configuration for Prisma CLI (migrate/generate).
//
// IMPORTANT:
// - This reads DATABASE_URL from the environment.
// - Be careful when DATABASE_URL points to production.
//   Prefer running migrations against staging first.

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Prefer DIRECT_URL for migrations (Neon), fall back to DATABASE_URL.
    url: datasourceUrl,
  },
  migrations: {
    path: "prisma/migrations",
  },
});
