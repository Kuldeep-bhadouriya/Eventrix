import { NextResponse } from "next/server";

import { RateLimitError, rateLimitPresets } from "@/lib/api";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

type RateLimitPreset = keyof typeof rateLimitPresets;

function toOrigin(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getAllowedOrigins(request: Request): Set<string> {
  const allowedOrigins = new Set<string>();

  const requestOrigin = toOrigin(request.url);
  if (requestOrigin) {
    allowedOrigins.add(requestOrigin);
  }

  const host = request.headers.get("host");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const proto = request.headers.get("x-forwarded-proto") || "https";

  for (const candidateHost of [host, forwardedHost]) {
    if (!candidateHost) continue;
    const headerOrigin = toOrigin(`${proto}://${candidateHost}`);
    if (headerOrigin) {
      allowedOrigins.add(headerOrigin);
    }
  }

  for (const configured of [process.env.NEXTAUTH_URL, process.env.NEXT_PUBLIC_APP_URL]) {
    const configuredOrigin = toOrigin(configured);
    if (configuredOrigin) {
      allowedOrigins.add(configuredOrigin);
    }
  }

  return allowedOrigins;
}

export function verifySameOrigin(request: Request): { ok: true } | { ok: false; message: string } {
  if (SAFE_METHODS.has(request.method)) {
    return { ok: true };
  }

  const allowedOrigins = getAllowedOrigins(request);
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const fetchSite = request.headers.get("sec-fetch-site");

  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site" && fetchSite !== "none") {
    return { ok: false, message: "Cross-site request blocked" };
  }

  const requestOrigin = toOrigin(origin);

  if (origin && (!requestOrigin || !allowedOrigins.has(requestOrigin))) {
    return { ok: false, message: "Cross-site request blocked" };
  }

  if (!origin && referer) {
    const refererOrigin = toOrigin(referer);
    if (!refererOrigin || !allowedOrigins.has(refererOrigin)) {
      return { ok: false, message: "Invalid request source" };
    }
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
