import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { createDynamicPaymongoLink } from "@/lib/paymongo";
import { createServerClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";
import crypto from "crypto";

const BASE_SUBJECT_CENTAVOS = 79900; // ₱799
const BASE_ALL_CENTAVOS = 99900; // ₱999
const PER_SEAT_CENTAVOS = 5900; // ₱59
const INCLUDED_SEATS = 11;
const MIN_SEATS = 11;

function computeAmount(scope: "subject" | "all", seats: number): number {
  const base = scope === "all" ? BASE_ALL_CENTAVOS : BASE_SUBJECT_CENTAVOS;
  const extra = Math.max(0, seats - INCLUDED_SEATS);
  return base + extra * PER_SEAT_CENTAVOS;
}

export async function POST(req: NextRequest) {
  const jar = await cookies();
  const repDeviceId = verifyDeviceCookie(jar.get(DEVICE_COOKIE)?.value);
  if (!repDeviceId) {
    return NextResponse.json({ error: "no_device" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    scope?: string;
    subjectId?: string;
    yearId?: string;
    seats?: number;
  } | null;
  const scope = body?.scope === "all" ? "all" : body?.scope === "subject" ? "subject" : null;
  const { subjectId, yearId, seats } = body ?? {};

  if (!scope || !isUuid(yearId) || typeof seats !== "number" || seats < MIN_SEATS) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  if (scope === "subject" && !isUuid(subjectId)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  // Verify the year/subject pair actually exists (and, for scope='subject',
  // that the subject belongs to that year) before creating a real payment
  // link. Without this, a tampered request with fabricated-but-valid UUIDs,
  // or a mismatched subject/year pair, still produces a working checkout —
  // and after payment the webhook creates a classes row with a dangling or
  // inconsistent subject/year pair that isSubscribed's class check (which
  // filters on BOTH subject_id and year_id matching the page's real pair)
  // will never unlock. That's real money paid for a dead class. The webhook
  // doesn't need its own check: only this route can create links under our
  // PayMongo secret, and webhook signature verification ensures events are
  // about our links, so validating here closes the pipeline.
  const supabase = createServerClient();
  if (scope === "subject") {
    const { data: subject } = await supabase
      .from("subjects")
      .select("id")
      .eq("id", subjectId)
      .eq("year_id", yearId)
      .maybeSingle();
    if (!subject) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }
  } else {
    const { data: year } = await supabase
      .from("years")
      .select("id")
      .eq("id", yearId)
      .maybeSingle();
    if (!year) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }
  }

  const amount = computeAmount(scope, seats);
  const description =
    scope === "all"
      ? "BSIT Survival Kit — Class block (all subjects, semester)"
      : "BSIT Survival Kit — Class block (1 subject, semester)";

  // remarks format: "block:1 year:<id> [subject:<id>] seats:<n> rep:<deviceId>"
  // Parsed by app/api/webhooks/paymongo/route.ts's class-purchase branch.
  let remarks = `block:1 year:${yearId}`;
  if (scope === "subject") remarks += ` subject:${subjectId}`;
  remarks += ` seats:${seats} rep:${repDeviceId}`;

  const idempotencyKey = crypto
    .createHash("sha256")
    .update(`class-checkout:${repDeviceId}:${yearId}:${subjectId ?? "all"}:${seats}`)
    .digest("hex");

  const origin = req.nextUrl.origin;
  const successUrl = `${origin}/for-blocks?payment=success`;

  try {
    const { checkoutUrl } = await createDynamicPaymongoLink(
      amount,
      description,
      remarks,
      successUrl,
      idempotencyKey
    );
    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
