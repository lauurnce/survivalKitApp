import { NextRequest, NextResponse } from "next/server";
import { createPaymongoLink } from "@/lib/paymongo";
import { createServerClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";
import { createRateLimiter, getClientIp } from "@/lib/rateLimit";

const limiter = createRateLimiter(5);

export async function POST(req: NextRequest) {
  if (limiter.check(getClientIp(req))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as
    | { yearId?: string; subjectId?: string; deviceId?: string }
    | null;

  const yearId = body?.yearId;
  const subjectId = body?.subjectId ?? null; // null = year plan
  const deviceId = body?.deviceId;

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
      successUrl,
      subjectId
    );
    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("createPaymongoLink failed:", err);
    return NextResponse.json(
      { error: "Payment setup failed" },
      { status: 500 }
    );
  }
}
