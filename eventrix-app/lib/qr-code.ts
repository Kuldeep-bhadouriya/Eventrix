import crypto from "crypto";

export type EventPassQrPayloadV1 = {
  v: 1;
  userId: string;
  eventId: string;
  registrationId: string;
  hash: string;
};

function base64UrlEncode(input: string) {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function getQrSecret() {
  return (
    process.env.QR_CODE_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "dev-insecure-secret"
  );
}

export function computeEventPassVerificationHash(input: {
  v: 1;
  userId: string;
  eventId: string;
  registrationId: string;
}) {
  const secret = getQrSecret();
  const message = `v${input.v}|${input.userId}|${input.eventId}|${input.registrationId}`;
  return crypto.createHmac("sha256", secret).update(message).digest("base64url");
}

export function encodeEventPassQrPayload(input: {
  userId: string;
  eventId: string;
  registrationId: string;
}): string {
  const payload: EventPassQrPayloadV1 = {
    v: 1,
    userId: input.userId,
    eventId: input.eventId,
    registrationId: input.registrationId,
    hash: computeEventPassVerificationHash({
      v: 1,
      userId: input.userId,
      eventId: input.eventId,
      registrationId: input.registrationId,
    }),
  };

  return base64UrlEncode(JSON.stringify(payload));
}

export function decodeEventPassQrPayload(encoded: string): EventPassQrPayloadV1 {
  const raw = base64UrlDecode(encoded);
  const parsed = JSON.parse(raw) as EventPassQrPayloadV1;
  return parsed;
}

export function verifyEventPassQrPayload(encoded: string): {
  valid: boolean;
  payload?: EventPassQrPayloadV1;
} {
  try {
    const payload = decodeEventPassQrPayload(encoded);
    if (payload.v !== 1) return { valid: false };

    const expected = computeEventPassVerificationHash({
      v: 1,
      userId: payload.userId,
      eventId: payload.eventId,
      registrationId: payload.registrationId,
    });

    return { valid: crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(payload.hash)), payload };
  } catch {
    return { valid: false };
  }
}
