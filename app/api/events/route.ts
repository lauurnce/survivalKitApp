import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { EventType } from "@/lib/supabase/types";

const VALID_EVENT_TYPES = new Set<EventType>([
  "enter", "year_select", "subject_open", "module_open",
  "section_view", "unlock_click", "unlock_submitted",
]);

// IP-based rate limiter — bounded map to prevent unbounded memory growth
const rateLimitMap = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;
const MAX_MAP_SIZE = 10_000;

function getRateLimitKey(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ??
    "unknown"
  );
}

function isRateLimited(key: string): boolean {
  const now = Date.now();

  // Prune map if it gets too large to prevent memory leak
  if (rateLimitMap.size >= MAX_MAP_SIZE) {
    for (const [k, timestamps] of rateLimitMap) {
      if (timestamps.every((t) => now - t >= WINDOW_MS)) rateLimitMap.delete(k);
      if (rateLimitMap.size < MAX_MAP_SIZE * 0.8) break;
    }
  }

  const timestamps = (rateLimitMap.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_PER_WINDOW) return true;
  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      device_id,
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

    if (!device_id || !event_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate event_type at runtime — TS types are erased
    if (!VALID_EVENT_TYPES.has(event_type)) {
      return NextResponse.json({ error: "Invalid event_type" }, { status: 400 });
    }

    if (isRateLimited(getRateLimitKey(req))) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }

    const supabase = createServerClient();
    await supabase.from("events").insert({
      device_id,
      event_type,
      year_id,
      subject_id,
      module_id,
      section_id,
    });

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
