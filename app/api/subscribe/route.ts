import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createPaymongoLink, PLANS, type PlanKey } from "@/lib/paymongo";
import { createServerClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";
import { createRateLimiter, getClientIp } from "@/lib/rateLimit";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { buildSuccessUrl } from "@/lib/subscribeRedirect";
import {
  DEVICE_COOKIE,
  DEVICE_COOKIE_OPTIONS,
  signDeviceCookie,
  verifyDeviceCookie,
} from "@/lib/auth/deviceCookie";

const limiter = createRateLimiter(5);

export async function POST(req: NextRequest) {
  if (limiter.check(getClientIp(req))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const userId = await getCurrentUserId();

  const body = (await req.json().catch(() => null)) as
    | { yearId?: string; subjectId?: string; deviceId?: string; returnPath?: string; plan?: string }
    | null;

  const yearId = body?.yearId;
  const subjectId = body?.subjectId ?? null; // null = year plan

  // Trust only the signed device cookie for granting access — a client-supplied
  // deviceId in the body can never override it, or an attacker could plant a
  // victim's device UUID and have the payment grant land on that device
  // instead of their own. If no cookie exists yet (first visit, or the
  // fire-and-forget /api/device sync hasn't landed), mint one from the body's
  // UUID now, mirroring /api/device's own trust model — this only ever signs
  // a cookie for the UUID the CALLER supplied, never lets them adopt someone
  // else's already-established device identity.
  const cookieStore = await cookies();
  const cookieDeviceId = verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value);
  const bodyDeviceId = body?.deviceId;
  const deviceId = cookieDeviceId ?? (isUuid(bodyDeviceId) ? bodyDeviceId : undefined);
  const needsCookie = !cookieDeviceId && isUuid(bodyDeviceId);

  if (!isUuid(yearId) || !isUuid(deviceId)) {
    return NextResponse.json(
      { error: "yearId and deviceId must be valid UUIDs" },
      { status: 400 }
    );
  }

  if (subjectId !== null && !isUuid(subjectId)) {
    return NextResponse.json(
      { error: "subjectId must be a valid UUID" },
      { status: 400 }
    );
  }

  // Plan: optional for legacy clients (defaults to the old tier for the
  // scope), but when present it must be a known key that matches the scope.
  let plan: PlanKey;
  if (body?.plan === undefined) {
    plan = subjectId ? "subject_month" : "year_sem";
  } else if (
    body.plan in PLANS &&
    (body.plan !== "year_sem") === (subjectId !== null)
  ) {
    plan = body.plan as PlanKey;
  } else {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: year } = await supabase
    .from("years")
    .select("id")
    .eq("id", yearId)
    .maybeSingle();

  if (!year) {
    return NextResponse.json({ error: "Unknown year" }, { status: 404 });
  }

  if (subjectId) {
    const { data: subject } = await supabase
      .from("subjects")
      .select("id")
      .eq("id", subjectId)
      .eq("year_id", yearId)
      .maybeSingle();

    if (!subject) {
      return NextResponse.json({ error: "Unknown subject" }, { status: 404 });
    }
  }

  const ALLOWED_ORIGINS = [
    "https://survival-kit-app.vercel.app",
    "http://localhost:3000",
  ];
  const requestOrigin = req.headers.get("origin") ?? "";
  const origin = ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : "https://survival-kit-app.vercel.app";
  // Return the payer to the exact module page they came from (validated), with
  // ?payment=success so the SubscribeGate there auto-polls and unlocks in place.
  const successUrl = buildSuccessUrl({
    origin,
    yearId,
    subjectId,
    returnPath: body?.returnPath ?? null,
  });

  try {
    const { checkoutUrl } = await createPaymongoLink(
      yearId,
      deviceId,
      successUrl,
      subjectId,
      userId ?? undefined,
      plan
    );
    const res = NextResponse.json({ checkoutUrl });
    if (needsCookie) {
      res.cookies.set(DEVICE_COOKIE, signDeviceCookie(deviceId), DEVICE_COOKIE_OPTIONS);
    }
    return res;
  } catch (err) {
    console.error("createPaymongoLink failed:", err);
    return NextResponse.json(
      { error: "Payment setup failed" },
      { status: 500 }
    );
  }
}
