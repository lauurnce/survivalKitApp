import { NextRequest, NextResponse } from "next/server";
import { createPaymongoLink } from "@/lib/paymongo";
import { isUuid } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { yearId?: string; deviceId?: string };
  const { yearId, deviceId } = body;

  // Both IDs are interpolated into the PayMongo `remarks` string and later
  // parsed back out by the webhook. Enforcing the UUID shape here prevents
  // injecting extra `device:`/`year:` tokens that would redirect the grant.
  if (!isUuid(yearId) || !isUuid(deviceId)) {
    return NextResponse.json(
      { error: "yearId and deviceId must be valid UUIDs" },
      { status: 400 }
    );
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
    const message =
      err instanceof Error ? err.message : "Payment setup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
