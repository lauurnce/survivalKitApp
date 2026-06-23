import { NextRequest, NextResponse } from "next/server";
import { createPaymongoLink } from "@/lib/paymongo";
import { createServerClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";
import { createRateLimiter, getClientIp } from "@/lib/rateLimit";

// Creating payment links calls PayMongo and can incur cost/quota; legitimate
// users hit this rarely, so keep the per-IP allowance tight.
const limiter = createRateLimiter(5);

export async function POST(req: NextRequest) {
  if (limiter.check(getClientIp(req))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as
    | { yearId?: string; deviceId?: string }
    | null;
  const yearId = body?.yearId;
  const deviceId = body?.deviceId;

  // Both IDs are interpolated into the PayMongo `remarks` string and later
  // parsed back out by the webhook. Enforcing the UUID shape here prevents
  // injecting extra `device:`/`year:` tokens that would redirect the grant.
  if (!isUuid(yearId) || !isUuid(deviceId)) {
    return NextResponse.json(
      { error: "yearId and deviceId must be valid UUIDs" },
      { status: 400 }
    );
  }

  // Don't spend a PayMongo API call (or risk a charge) on a year that doesn't
  // exist. The webhook also enforces the FK, but reject early here.
  const supabase = createServerClient();
  const { data: year } = await supabase
    .from("years")
    .select("id")
    .eq("id", yearId)
    .maybeSingle();

  if (!year) {
    return NextResponse.json({ error: "Unknown year" }, { status: 404 });
  }

  const ALLOWED_ORIGINS = [
    "https://bsitsurvivalkit.vercel.app",
    "http://localhost:3000",
  ];
  const requestOrigin = req.headers.get("origin") ?? "";
  const origin = ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : "https://bsitsurvivalkit.vercel.app";
  const successUrl = `${origin}/year/${yearId}/subjects`;

  try {
    const { checkoutUrl } = await createPaymongoLink(
      yearId,
      deviceId,
      successUrl
    );
    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    // Log the real cause (may include PayMongo/API details) server-side only;
    // return a generic message to avoid leaking internals to the caller.
    console.error("createPaymongoLink failed:", err);
    return NextResponse.json(
      { error: "Payment setup failed" },
      { status: 500 }
    );
  }
}
