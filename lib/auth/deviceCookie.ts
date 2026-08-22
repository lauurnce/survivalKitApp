import { createHmac, timingSafeEqual } from "crypto";
import { isUuid } from "@/lib/validation";
import { signingSecretCandidates } from "@/lib/auth/signingSecrets";

export const DEVICE_COOKIE = "bsit_device_id";
const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function signingCandidates(): string[] {
  return signingSecretCandidates(
    "DEVICE_COOKIE_SECRET",
    "DEVICE_COOKIE_SECRET_PREVIOUS",
  );
}

function hmac(secret: string, deviceId: string): string {
  return createHmac("sha256", secret).update(deviceId).digest("base64url");
}

function sign(deviceId: string): string {
  // Signing always uses the primary (first candidate); see signingSecrets.
  return hmac(signingCandidates()[0], deviceId);
}

/** Cookie value: "<uuid>.<hmac>" so the server can trust it without a DB lookup. */
export function signDeviceCookie(deviceId: string): string {
  return `${deviceId}.${sign(deviceId)}`;
}

/** Returns the device UUID only if the signature is valid, else null. */
export function verifyDeviceCookie(value: string | undefined): string | null {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot === -1) return null;

  const deviceId = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (!isUuid(deviceId)) return null;

  try {
    // Primary first; during a rotation window the previous secret is the
    // fallback that keeps existing cookies valid.
    for (const secret of signingCandidates()) {
      const expected = hmac(secret, deviceId);
      if (timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
        return deviceId;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export const DEVICE_COOKIE_OPTIONS: {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: DEVICE_COOKIE_MAX_AGE,
};
