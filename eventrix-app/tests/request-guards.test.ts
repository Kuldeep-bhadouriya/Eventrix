import { afterEach, describe, expect, it } from "vitest";

import { verifySameOrigin } from "@/lib/security/request-guards";

const ORIGINAL_NEXTAUTH_URL = process.env.NEXTAUTH_URL;
const ORIGINAL_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;

afterEach(() => {
  process.env.NEXTAUTH_URL = ORIGINAL_NEXTAUTH_URL;
  process.env.NEXT_PUBLIC_APP_URL = ORIGINAL_PUBLIC_APP_URL;
});

describe("verifySameOrigin", () => {
  it("allows same-site requests behind forwarded www host", () => {
    process.env.NEXTAUTH_URL = "https://eventrix.me";
    process.env.NEXT_PUBLIC_APP_URL = "https://eventrix.me";

    const request = new Request("https://eventrix-internal.vercel.app/api/auth/complete-profile", {
      method: "POST",
      headers: {
        origin: "https://www.eventrix.me",
        referer: "https://www.eventrix.me/auth/complete-profile",
        "x-forwarded-host": "www.eventrix.me",
        "x-forwarded-proto": "https",
        "sec-fetch-site": "same-site",
      },
    });

    expect(verifySameOrigin(request)).toEqual({ ok: true });
  });

  it("allows configured app origin", () => {
    process.env.NEXTAUTH_URL = "https://eventrix.me";
    process.env.NEXT_PUBLIC_APP_URL = "https://eventrix.me";

    const request = new Request("https://eventrix-internal.vercel.app/api/auth/complete-profile", {
      method: "POST",
      headers: {
        origin: "https://eventrix.me",
        "sec-fetch-site": "same-site",
      },
    });

    expect(verifySameOrigin(request)).toEqual({ ok: true });
  });

  it("blocks cross-site origin", () => {
    process.env.NEXTAUTH_URL = "https://eventrix.me";
    process.env.NEXT_PUBLIC_APP_URL = "https://eventrix.me";

    const request = new Request("https://www.eventrix.me/api/auth/complete-profile", {
      method: "POST",
      headers: {
        origin: "https://evil.example",
        "sec-fetch-site": "cross-site",
      },
    });

    expect(verifySameOrigin(request)).toEqual({
      ok: false,
      message: "Cross-site request blocked",
    });
  });

  it("allows safe methods without source headers", () => {
    const request = new Request("https://www.eventrix.me/api/auth/complete-profile", {
      method: "GET",
    });

    expect(verifySameOrigin(request)).toEqual({ ok: true });
  });
});
