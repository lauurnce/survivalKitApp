import { NextRequest, NextResponse } from "next/server";
import { isUuid } from "@/lib/validation";
import { createRateLimiter, getClientIp } from "@/lib/rateLimit";
import {
  DEVICE_COOKIE,
  DEVICE_COOKIE_OPTIONS,
  signDeviceCookie,
} from "@/lib/auth/deviceCookie";

export const runtime = "nodejs";

const limiter = createRateLimiter(20);

// Issues an HttpOnly, signed device cookie. The client posts its existing
// localStorage UUID (or a freshly generated one); we sign it so the value
// can't be forged or copied between browsers without the server secret.
export async function POST(req: NextRequest) {
  if (limiter.check(getClientIp(req))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

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

  const res = NextResponse.json({ ok: true });
  res.cookies.set(DEVICE_COOKIE, signDeviceCookie(deviceId), DEVICE_COOKIE_OPTIONS);
  return res;
}
