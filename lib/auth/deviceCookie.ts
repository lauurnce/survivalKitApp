import { createHmac, timingSafeEqual } from "crypto";
import { isUuid } from "@/lib/validation";

export const DEVICE_COOKIE = "bsit_device_id";
const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function getSecret(): string {
  const s = process.env.DEVICE_COOKIE_SECRET;
  if (!s) throw new Error("DEVICE_COOKIE_SECRET env var is not set");
  return s;
}

function sign(deviceId: string): string {
  return createHmac("sha256", getSecret()).update(deviceId).digest("base64url");
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
    const expected = sign(deviceId);
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return deviceId;
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
