import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createPaymongoLink, createDynamicPaymongoLink, PLANS, type PlanKey } from "@/lib/paymongo";
import { createServerClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";
import { getClientIp } from "@/lib/rateLimit";
import { isServerRateLimited } from "@/lib/serverRateLimit";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { buildSuccessUrl } from "@/lib/subscribeRedirect";
import {
  DEVICE_COOKIE,
  DEVICE_COOKIE_OPTIONS,
  signDeviceCookie,
  verifyDeviceCookie,
} from "@/lib/auth/deviceCookie";

// Shared across all serverless instances via the check_rate_limit RPC — the
// old per-instance limiter gave each cold start a fresh 5/min allowance on
// this payment-link endpoint.
const RATE_LIMIT_IP = { max: 5, windowSeconds: 60 };

// Minimum charge: ₱100 = 10000 centavos
// Security: prevents negative or zero amounts from being sent to PayMongo
const MIN_CHARGE = 10000;

// Helper function to validate coupon codes and atomically mark as redeemed
async function validateCouponCode(couponCode: string): Promise<{ valid: boolean; discount: number }> {
  if (!couponCode) {
    return { valid: false, discount: 0 };
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Step 1: Look up coupon to verify it exists, is not expired, and not yet redeemed
  const { data: couponData, error: lookupError } = await supabaseAdmin
    .from('user_feedback')
    .select('coupon_code, coupon_expires_at, redeemed_at')
    .eq('coupon_code', couponCode)
    .is('redeemed_at', null) // Only non-redeemed coupons
    .single();

  if (lookupError || !couponData) {
    return { valid: false, discount: 0 };
  }

  // Check expiry
  if (new Date(couponData.coupon_expires_at) < new Date()) {
    return { valid: false, discount: 0 };
  }

  // Step 2: Atomically mark coupon as redeemed BEFORE creating PayMongo link
  // This ensures concurrent requests cannot both redeem the same coupon.
  // We only update if redeemed_at is still null (race condition defense).
  const { data: updatedCoupon, error: updateError } = await supabaseAdmin
    .from('user_feedback')
    .update({ redeemed_at: new Date().toISOString() })
    .eq('coupon_code', couponCode)
    .is('redeemed_at', null) // Atomic condition: only if not already redeemed
    .select('redeemed_at')
    .single();

  if (updateError || !updatedCoupon) {
    // Update returned 0 rows: coupon was already redeemed by concurrent request
    return { valid: false, discount: 0 };
  }

  // Coupon is valid and successfully marked as redeemed
  return { valid: true, discount: 10000 }; // 10000 centavos = ₱100
}

export async function POST(req: NextRequest) {
  if (await isServerRateLimited(`subscribe:ip:${getClientIp(req)}`, RATE_LIMIT_IP)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const userId = await getCurrentUserId();

  const body = (await req.json().catch(() => null)) as
    | { yearId?: string; subjectId?: string; deviceId?: string; returnPath?: string; plan?: string; couponCode?: string }
    | null;

  const yearId = body?.yearId;
  const subjectId = body?.subjectId ?? null; // null = year plan
  const couponCode = body?.couponCode;

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
    // Validate coupon if provided
    const couponResult = await validateCouponCode(couponCode ?? '');
    const resolvedPlan: PlanKey = plan ?? (subjectId ? "subject_month" : "year_sem");
    const baseAmount = PLANS[resolvedPlan].amount;

    // Security: clamp final amount to minimum charge, preventing negative or zero amounts
    const finalAmount = Math.max(MIN_CHARGE, baseAmount - (couponResult.valid ? couponResult.discount : 0));

    // Validate finalAmount is a positive integer
    if (!Number.isInteger(finalAmount) || finalAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    let checkoutUrl: string;

    if (couponResult.valid) {
      // Use dynamic link for coupon-discounted purchases
      const description = PLANS[resolvedPlan].description;
      let remarks = subjectId
        ? `year:${yearId} subject:${subjectId} device:${deviceId}`
        : `year:${yearId} device:${deviceId}`;
      if (userId) remarks += ` user:${userId}`;
      remarks += ` plan:${resolvedPlan} coupon:${couponCode}`;

      // Idempotency key for coupon purchases (includes coupon code)
      const crypto = await import("crypto");
      const idempotencyKey = crypto.default
        .createHash("sha256")
        .update(`subscribe:${deviceId}:${yearId}:${subjectId ?? "year"}:${resolvedPlan}:${couponCode}`)
        .digest("hex");

      const { checkoutUrl: url } = await createDynamicPaymongoLink(
        finalAmount,
        `${description} (coupon applied)`,
        remarks,
        successUrl,
        idempotencyKey
      );
      checkoutUrl = url;
    } else {
      // Use standard link for full-price purchases
      const { checkoutUrl: url } = await createPaymongoLink(
        yearId,
        deviceId,
        successUrl,
        subjectId,
        userId ?? undefined,
        plan
      );
      checkoutUrl = url;
    }

    const res = NextResponse.json({ checkoutUrl, discountApplied: couponResult.valid });
    if (needsCookie) {
      res.cookies.set(DEVICE_COOKIE, signDeviceCookie(deviceId), DEVICE_COOKIE_OPTIONS);
    }
    return res;
  } catch (err) {
    console.error("Payment setup failed:", err);
    return NextResponse.json(
      { error: "Payment setup failed" },
      { status: 500 }
    );
  }
}
