import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isSubscribed } from "@/lib/subscriptions";
import { isUuid } from "@/lib/validation";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { getCurrentUserId } from "@/lib/auth/currentUser";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Trust only the signed device cookie, never a raw x-device-id header.
  const cookieStore = await cookies();
  const deviceId = verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value) ?? "";
  const yearId = req.nextUrl.searchParams.get("yearId") ?? "";
  const subjectId = req.nextUrl.searchParams.get("subjectId");
  const userId = await getCurrentUserId();

  if (!isUuid(yearId) || (!deviceId && !userId)) {
    return NextResponse.json({ subscribed: false });
  }
  if (subjectId !== null && !isUuid(subjectId)) {
    return NextResponse.json({ subscribed: false });
  }

  const subscribed = await isSubscribed(deviceId, yearId, subjectId ?? undefined, userId ?? undefined);
  return NextResponse.json({ subscribed });
}
