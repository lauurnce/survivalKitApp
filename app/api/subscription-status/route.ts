import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getEntitlement, getYearEntitlements, type Entitlement } from "@/lib/subscriptions";
import { isUuid } from "@/lib/validation";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { getModuleActivitySections, getModuleWithSubject } from "@/lib/cache/queries";

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** The reader's own grant, as the client sees it: what kind, and until when. */
export interface PlanInfo {
  scope: Entitlement["scope"];
  /** ISO current_period_end; null only under the UNLOCK_ALL dev flag. */
  until: string | null;
}

function plan(ent: Entitlement): PlanInfo {
  return { scope: ent.scope, until: ent.until };
}

// Whether this reader is subscribed to (yearId[, subjectId]), and — when they
// are — the plan's scope and access end date, so the reader can say "Unlocked
// until Dec 1" without a trip to /unlock. Only the grant that answers this
// request is described: no ids, prices, or other subjects.
//
// With `list=subjects` (yearId only) the answer is every subject in that year
// this reader can open, for the subject list's "Unlocked" tags.
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
  const list = req.nextUrl.searchParams.get("list");
  const userId = await getCurrentUserId();

  const locked = () => NextResponse.json({ subscribed: false }, { headers: NO_STORE });

  if (!isUuid(yearId) || (!deviceId && !userId)) {
    return list === "subjects"
      ? NextResponse.json({ subscribed: false, subjects: {} }, { headers: NO_STORE })
      : locked();
  }
  if (subjectId !== null && !isUuid(subjectId)) return locked();
  if (moduleId !== null && (!isUuid(moduleId) || subjectId === null)) return locked();

  if (list === "subjects") {
    if (subjectId !== null || moduleId !== null) return locked();
    const ents = await getYearEntitlements(deviceId, yearId, userId ?? undefined);
    const subjects: Record<string, PlanInfo> = {};
    for (const [id, ent] of Object.entries(ents.subjects)) subjects[id] = plan(ent);
    return NextResponse.json(
      ents.year
        ? { subscribed: true, plan: plan(ents.year), subjects }
        : { subscribed: false, subjects },
      { headers: NO_STORE },
    );
  }

  if (moduleId !== null && subjectId !== null) {
    // The entitlement is checked against (yearId, subjectId), so those must be
    // the module's real parents — otherwise a subscriber to one subject could
    // name it here and read another subject's module.
    const { mod, subject } = await getModuleWithSubject(moduleId, subjectId);
    if (!mod || !subject || subject.year_id !== yearId) return locked();
  }

  const ent = await getEntitlement(deviceId, yearId, subjectId ?? undefined, userId ?? undefined);
  if (!ent) return locked();
  if (moduleId === null) {
    return NextResponse.json({ subscribed: true, plan: plan(ent) }, { headers: NO_STORE });
  }

  const sections = await getModuleActivitySections(moduleId, true);
  return NextResponse.json({ subscribed: true, plan: plan(ent), sections }, { headers: NO_STORE });
}
