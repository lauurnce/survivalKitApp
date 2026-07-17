import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { createDynamicPaymongoLink } from "@/lib/paymongo";
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
