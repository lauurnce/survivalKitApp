import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import type { EventType } from "@/lib/supabase/types";
import { isUuid } from "@/lib/validation";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { getClientIp } from "@/lib/rateLimit";
import { isServerRateLimited } from "@/lib/serverRateLimit";
import { counterVisitsFor, isUncountableRequest } from "@/lib/readCounting";
import { isSearchEventType, normalizeSearchQuery } from "@/lib/analyticsSearch";

const VALID_EVENT_TYPES = new Set<EventType>([
  "enter", "year_select", "subject_open", "module_open",
  "section_view", "subscribe_click", "paywall_teaser_view",
  "paywall_teaser_click", "unlock_click", "unlock_submitted",
  "share_card_open", "share_card_share", "share_card_download",
  "print_click", "print_gate_shown",
  "lesson_halfway", "lesson_end", "next_lesson_click", "lesson_resume",
  "quick_check_correct", "quick_check_wrong", "lesson_share", "code_run",
  "recent_lesson_click", "install_prompt_shown", "pwa_installed",
  "search_query", "search_no_results", "search_result_click",
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

// utm_content / utm_term (migration 20261101000100) are sent to the insert
// only when the client supplied one. An untagged visit — nearly all of them —
// then inserts exactly the columns it always did, so a deploy that lands
// before the migration is applied loses only the rare fully-tagged `enter`,
// not every row.
function optionalAttribution(body: Record<string, unknown>) {
  const extra: { utm_content?: string; utm_term?: string } = {};
  const content = sanitizeText(body.utm_content, 120);
  const term = sanitizeText(body.utm_term, 120);
  if (content !== null) extra.utm_content = content;
  if (term !== null) extra.utm_term = term;
  return extra;
}

// Generous ceilings: the catalogue has a few hundred items, so anything past
// these is junk, not a real search.
const MAX_RESULT_COUNT = 10_000;
const MAX_RESULT_RANK = 1_000;

function boundedInt(value: unknown, min: number, max: number): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max
    ? value
    : null;
}

type SearchFields = {
  search_query: string;
  result_count: number | null;
  result_rank: number | null;
};

/**
 * Validates the search detail (migration 20261101000700) for the three search
 * events. The query is re-normalized here — the client is never trusted to
 * have lowercased, redacted or capped it. Returns an error message for a
 * malformed search event; non-search events never reach this.
 */
function searchFields(
  event_type: EventType,
  body: Record<string, unknown>,
  ids: { subject_id: string | null; module_id: string | null },
): { fields: SearchFields } | { error: string } {
  const search_query = normalizeSearchQuery(body.search_query);
  if (search_query === null) return { error: "Invalid search_query" };

  if (event_type === "search_query") {
    const result_count = boundedInt(body.result_count, 0, MAX_RESULT_COUNT);
    if (result_count === null) return { error: "Invalid result_count" };
    return { fields: { search_query, result_count, result_rank: null } };
  }

  if (event_type === "search_no_results") {
    return { fields: { search_query, result_count: 0, result_rank: null } };
  }

  // search_result_click: which result, and where it sat in the list.
  const result_rank = boundedInt(body.result_rank, 1, MAX_RESULT_RANK);
  if (result_rank === null) return { error: "Invalid result_rank" };
  if (!ids.subject_id && !ids.module_id) return { error: "Missing clicked result id" };
  return { fields: { search_query, result_count: null, result_rank } };
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

    // Search detail is validated only for search events, and only search
    // events send the three columns — so every other event inserts exactly
    // the columns it always did, even before the migration is applied.
    let search: SearchFields | null = null;
    if (isSearchEventType(event_type)) {
      const result = searchFields(event_type, body as Record<string, unknown>, {
        subject_id,
        module_id,
      });
      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      search = result.fields;
    }

    // Fail OPEN: a limiter outage must never silently zero out the reads/
    // readers counters (record_visit below) — this is a public, non-revenue
    // endpoint, not an abuse-prone one, so losing rate-limit coverage for the
    // duration of a backend outage is an acceptable trade-off.
    if (
      await isServerRateLimited(`events:ip:${getClientIp(req)}`, {
        ...RATE_LIMIT_IP,
        onFailure: "allow",
      })
    ) {
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
      ...optionalAttribution(body),
      ...(search ?? {}),
    });
    if (insertError) {
      // Analytics must never break the app, but a rejected insert must be
      // visible in the function logs — a silent drop here once hid a DB
      // constraint mismatch for weeks.
      console.error(`events insert failed (${event_type}):`, insertError.message);
    }

    // Reader/read counters (lib/readCounting.ts). Keyed by device, so signed-out
    // visitors count exactly like signed-in ones. Bots and speculative
    // prerenders still land in `events` but never move a public counter.
    // Fire-and-forget: a counter failure must never fail the request, but it
    // must reach the function logs.
    const visits = isUncountableRequest(req.headers)
      ? []
      : counterVisitsFor({ event_type, year_id, subject_id, module_id, section_id });
    for (const visit of visits) {
      supabase
        .rpc("record_visit", {
          p_device_id: device_id,
          p_resource_type: visit.type,
          p_resource_id: visit.id,
        })
        .then(
          ({ error }) => {
            if (error) console.error(`record_visit failed (${visit.type}):`, error.message);
          },
          (error: unknown) => {
            console.error(`record_visit failed (${visit.type}):`, error instanceof Error ? error.message : error);
          },
        );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
