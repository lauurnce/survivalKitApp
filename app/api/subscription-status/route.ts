import { NextRequest, NextResponse } from "next/server";
import { isSubscribed } from "@/lib/subscriptions";
import { isUuid } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const deviceId = req.headers.get("x-device-id") ?? "";
  const yearId = req.nextUrl.searchParams.get("yearId") ?? "";
  const subjectId = req.nextUrl.searchParams.get("subjectId");

  if (!isUuid(yearId) || !deviceId) {
    return NextResponse.json({ subscribed: false });
  }
  if (subjectId !== null && !isUuid(subjectId)) {
    return NextResponse.json({ subscribed: false });
  }

  const subscribed = await isSubscribed(deviceId, yearId, subjectId ?? undefined);
  return NextResponse.json({ subscribed });
}
