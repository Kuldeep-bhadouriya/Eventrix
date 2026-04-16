import { NextResponse } from "next/server";

import { RateLimitError, rateLimitPresets } from "@/lib/api";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

type RateLimitPreset = keyof typeof rateLimitPresets;

function getExpectedOrigin(request: Request): string {
  const fallbackOrigin = new URL(request.url).origin;
  const configured = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (!configured) return fallbackOrigin;

  try {
    return new URL(configured).origin;
  } catch {
    return fallbackOrigin;
  }
}

export function verifySameOrigin(request: Request): { ok: true } | { ok: false; message: string } {
  if (SAFE_METHODS.has(request.method)) {
    return { ok: true };
  }

  const expectedOrigin = getExpectedOrigin(request);
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const fetchSite = request.headers.get("sec-fetch-site");

  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site" && fetchSite !== "none") {
    return { ok: false, message: "Cross-site request blocked" };
  }

  if (origin && origin !== expectedOrigin) {
    return { ok: false, message: "Cross-site request blocked" };
  }

  if (!origin && referer && !referer.startsWith(expectedOrigin)) {
    return { ok: false, message: "Invalid request source" };
  }

  return { ok: true };
}

export async function enforceMutationGuards(
  request: Request,
  options: {
    rateLimit?: RateLimitPreset;
    requireSameOrigin?: boolean;
  } = {},
): Promise<NextResponse | null> {
  const requireSameOrigin = options.requireSameOrigin ?? true;

  if (SAFE_METHODS.has(request.method)) {
    return null;
  }

  if (requireSameOrigin) {
    const csrfResult = verifySameOrigin(request);
    if (!csrfResult.ok) {
      return NextResponse.json({ error: csrfResult.message }, { status: 403 });
    }
  }

  if (!options.rateLimit) {
    return null;
  }

  try {
    await rateLimitPresets[options.rateLimit](request);
    return null;
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        {
          error: error.message,
          retryAfter: error.retryAfter,
        },
        {
          status: 429,
          headers: error.retryAfter
            ? {
                "Retry-After": String(error.retryAfter),
              }
            : undefined,
        },
      );
    }

    throw error;
  }
}
