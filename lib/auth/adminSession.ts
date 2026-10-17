import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { signingSecretCandidates } from "@/lib/auth/signingSecrets";

const COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function signingCandidates(): string[] {
  return signingSecretCandidates(
    "ADMIN_SESSION_SECRET",
    "ADMIN_SESSION_SECRET_PREVIOUS",
  );
}

function hmac(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function sign(payload: string): string {
  // Signing always uses the primary (first candidate); see signingSecrets.
  return hmac(signingCandidates()[0], payload);
}

export function createSessionToken(): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string): boolean {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return false;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);

    // Primary first; during a rotation window the previous secret is the
    // fallback that keeps existing sessions valid.
    let signatureValid = false;
    for (const secret of signingCandidates()) {
      const expected = hmac(secret, payload);
      if (timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
        signatureValid = true;
        break;
      }
    }
    if (!signatureValid) return false;

    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}

export function checkAdminPassword(pw: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!pw || !expected) return false;
  try {
    const a = Buffer.from(pw);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function getAdminSession(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value ?? "";
  return verifySessionToken(token);
}

// The cookie is scoped to "/" rather than "/admin": the dashboard calls
// /api/admin/* (reconcile, feedback) from the browser, and a browser never
// sends a Path=/admin cookie to /api/admin/*, so every one of those calls
// 401'd. Widening is safe — the cookie stays httpOnly, SameSite=strict and
// HMAC-signed, and every reader verifies the signature and expiry.
export const SESSION_COOKIE: {
  name: string;
  options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "strict";
    path: string;
    maxAge: number;
  };
} = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  },
};

// Sessions issued before the path change live in a Path=/admin cookie. A
// response can only overwrite or expire a cookie whose path matches exactly,
// so clearing the "/" cookie alone would leave that one behind — still valid
// for /admin pages after logout. This Set-Cookie value expires it.
export const LEGACY_COOKIE_PATH = "/admin";

export function legacySessionCookieClearHeader(): string {
  const parts = [
    `${COOKIE_NAME}=`,
    `Path=${LEGACY_COOKIE_PATH}`,
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "HttpOnly",
    "SameSite=strict",
  ];
  if (SESSION_COOKIE.options.secure) parts.push("Secure");
  return parts.join("; ");
}
