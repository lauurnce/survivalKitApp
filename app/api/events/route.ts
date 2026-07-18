import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import type { EventType } from "@/lib/supabase/types";
import { isUuid } from "@/lib/validation";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { getClientIp } from "@/lib/rateLimit";
import { isServerRateLimited } from "@/lib/serverRateLimit";

const VALID_EVENT_TYPES = new Set<EventType>([
  "enter", "year_select", "subject_open", "module_open",
  "section_view", "subscribe_click", "paywall_teaser_view",
  "paywall_teaser_click", "unlock_click", "unlock_submitted",
  "share_card_open", "share_card_share", "share_card_download",
]);

// Shared across all serverless instances via the check_rate_limit RPC — the
// old per-instance Map gave each cold start a fresh 60/min allowance.
const RATE_LIMIT_IP = { max: 60, windowSeconds: 60 };

// Attribution fields are free-form client strings — cap their length and drop
// anything that isn't a string so junk never reaches the events table.
function sanitizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  return value.slice(0, maxLength);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      event_type,
      year_id = null,
      subject_id = null,
      module_id = null,
      section_id = null,
    } = body as {
      device_id: string;
      event_type: EventType;
      year_id?: string | null;
      subject_id?: string | null;
      module_id?: string | null;
      section_id?: string | null;
    };

    // Prefer the signed device cookie over whatever device_id the client
    // claims in the body — otherwise a caller can attribute analytics
    // events (and the visit-counter RPC below) to a device_id they don't
    // own. Fall back to the body value only for a first-time visitor with
    // no cookie yet; there is no per-device data to pollute in that case.
    const cookieStore = await cookies();
    const cookieDeviceId = verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value);
    const bodyDeviceId = (body as { device_id?: string })?.device_id;
    const device_id = cookieDeviceId ?? bodyDeviceId;

    if (!device_id || !event_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate event_type at runtime — TS types are erased
    if (!VALID_EVENT_TYPES.has(event_type)) {
      return NextResponse.json({ error: "Invalid event_type" }, { status: 400 });
    }

    // device_id is required; resource ids are optional. Reject anything that
    // isn't a well-formed UUID so unvalidated strings never reach the events
    // insert or the SECURITY DEFINER record_visit RPC.
    if (!isUuid(device_id)) {
      return NextResponse.json({ error: "Invalid device_id" }, { status: 400 });
    }
    for (const id of [year_id, subject_id, module_id, section_id]) {
      if (id !== null && !isUuid(id)) {
        return NextResponse.json({ error: "Invalid resource id" }, { status: 400 });
      }
    }

    if (await isServerRateLimited(`events:ip:${getClientIp(req)}`, RATE_LIMIT_IP)) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }

    const supabase = createServerClient();
    const { error: insertError } = await supabase.from("events").insert({
      device_id,
      event_type,
      year_id,
      subject_id,
      module_id,
      section_id,
      referrer: sanitizeText(body.referrer, 500),
      utm_source: sanitizeText(body.utm_source, 120),
      utm_medium: sanitizeText(body.utm_medium, 120),
      utm_campaign: sanitizeText(body.utm_campaign, 120),
    });
    if (insertError) {
      // Analytics must never break the app, but a rejected insert must be
      // visible in the function logs — a silent drop here once hid a DB
      // constraint mismatch for weeks.
      console.error(`events insert failed (${event_type}):`, insertError.message);
    }

    // Determine which resource to count (fire-and-forget — never blocks response)
    const counterArgs = (() => {
      if (event_type === "subject_open" && year_id && !subject_id) {
        return { type: "year" as const, id: year_id };
      }
      if (event_type === "subject_open" && subject_id) {
        return { type: "subject" as const, id: subject_id };
      }
      if (event_type === "module_open" && module_id) {
        return { type: "module" as const, id: module_id };
      }
      if (event_type === "section_view" && section_id) {
        return { type: "section" as const, id: section_id };
      }
      return null;
    })();

    if (counterArgs) {
      supabase
        .rpc("record_visit", {
          p_device_id: device_id,
          p_resource_type: counterArgs.type,
          p_resource_id: counterArgs.id,
        })
        .then(null, () => null);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
