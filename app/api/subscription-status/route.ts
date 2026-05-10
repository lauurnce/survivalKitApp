import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isSubscribed } from "@/lib/subscriptions";
import { isUuid } from "@/lib/validation";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { getModuleActivitySections, getModuleWithSubject } from "@/lib/cache/queries";

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "private, no-store" };

// Whether this reader is subscribed to (yearId[, subjectId]).
//
// With `moduleId` (requires `subjectId`) a subscriber also receives the full
// bodies of that module's gated activity sections. The module reader is
// prerendered and CDN-cached, so its HTML is the locked view for everyone;
// components/ModuleSections.tsx fetches the paid bodies from here after
// hydration. Same entitlement check the reader used to run during render: the
// signed device cookie or the session user, never a client-supplied id.
export async function GET(req: NextRequest) {
  // Trust only the signed device cookie, never a raw x-device-id header.
  const cookieStore = await cookies();
  const deviceId = verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value) ?? "";
  const yearId = req.nextUrl.searchParams.get("yearId") ?? "";
  const subjectId = req.nextUrl.searchParams.get("subjectId");
  const moduleId = req.nextUrl.searchParams.get("moduleId");
  const userId = await getCurrentUserId();

  const locked = () => NextResponse.json({ subscribed: false }, { headers: NO_STORE });

  if (!isUuid(yearId) || (!deviceId && !userId)) {
    return locked();
  }
  if (subjectId !== null && !isUuid(subjectId)) return locked();
  if (moduleId !== null && (!isUuid(moduleId) || subjectId === null)) return locked();

  if (moduleId !== null && subjectId !== null) {
    // The entitlement is checked against (yearId, subjectId), so those must be
    // the module's real parents — otherwise a subscriber to one subject could
    // name it here and read another subject's module.
    const { mod, subject } = await getModuleWithSubject(moduleId, subjectId);
    if (!mod || !subject || subject.year_id !== yearId) return locked();
  }

  const subscribed = await isSubscribed(deviceId, yearId, subjectId ?? undefined, userId ?? undefined);
  if (!subscribed || moduleId === null) {
    return NextResponse.json({ subscribed }, { headers: NO_STORE });
  }

  const sections = await getModuleActivitySections(moduleId, true);
  return NextResponse.json({ subscribed: true, sections }, { headers: NO_STORE });
}
