import { z } from "zod";

const envSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Public variables (accessible in browser)
  NEXT_PUBLIC_APP_NAME: z.string().default("Eventrix"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Private variables (server-side only)
  // DATABASE_URL: z.string().url().optional(),
  // NEXTAUTH_SECRET: z.string().min(32).optional(),
  // NEXTAUTH_URL: z.string().url().optional(),
});

// Parse and validate environment variables
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsed.error.format(), null, 2)
  );
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;
