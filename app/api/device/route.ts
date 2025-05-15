import { NextRequest, NextResponse } from "next/server";
import { isUuid } from "@/lib/validation";
import { getClientIp } from "@/lib/rateLimit";
import { isServerRateLimited } from "@/lib/serverRateLimit";
import {
  DEVICE_COOKIE,
  DEVICE_COOKIE_OPTIONS,
  signDeviceCookie,
  verifyDeviceCookie,
} from "@/lib/auth/deviceCookie";
import { DEVICE_SYNCED_COOKIE } from "@/lib/deviceSync";

export const runtime = "nodejs";

// Shared across all serverless instances via the check_rate_limit RPC — the
// old per-instance limiter gave each cold start a fresh allowance.
//
// Kept, but raised from 20: since CR-05 a browser POSTs here once, not on
// every page load, so this now counts first visits per IP. A class opening
// the site together behind one campus NAT is dozens of first visits in a
// minute; 60 absorbs that, and the client retries a 429 once with jitter.
// The cap still bounds scripted spend on a public, unauthenticated endpoint.
const RATE_LIMIT_IP = { max: 60, windowSeconds: 60 };

// Readable twin of the signed cookie; see lib/deviceSync.ts.
const SYNCED_MARKER_OPTIONS = { ...DEVICE_COOKIE_OPTIONS, httpOnly: false };

function withDeviceCookies(res: NextResponse, deviceId: string): NextResponse {
  res.cookies.set(DEVICE_COOKIE, signDeviceCookie(deviceId), DEVICE_COOKIE_OPTIONS);
  res.cookies.set(DEVICE_SYNCED_COOKIE, deviceId, SYNCED_MARKER_OPTIONS);
  return res;
}

// Issues an HttpOnly, signed device cookie. The client posts its existing
// localStorage UUID (or a freshly generated one); we sign it so the value
// can't be forged or copied between browsers without the server secret.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { deviceId?: string }
    | null;
  const deviceId = body?.deviceId;

  if (!isUuid(deviceId)) {
    return NextResponse.json(
      { error: "deviceId must be a valid UUID" },
      { status: 400 }
    );
  }

  // Already registered: a browser that still carries a valid signed cookie
  // for this id (e.g. one set before the readable marker existed) just gets
  // the marker, without spending the per-IP allowance meant for first visits.
  if (verifyDeviceCookie(req.cookies?.get(DEVICE_COOKIE)?.value) === deviceId) {
    return withDeviceCookies(NextResponse.json({ ok: true }), deviceId);
  }

  // Fail OPEN: a limiter outage must never silently stop issuing device
  // cookies to first-time visitors — this is a public, non-revenue
  // endpoint, not an abuse-prone one, so losing rate-limit coverage for the
  // duration of a backend outage is an acceptable trade-off.
  if (
    await isServerRateLimited(`device:ip:${getClientIp(req)}`, {
      ...RATE_LIMIT_IP,
      onFailure: "allow",
    })
  ) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  return withDeviceCookies(NextResponse.json({ ok: true }), deviceId);
}
