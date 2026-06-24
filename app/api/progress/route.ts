import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";

// IP-based rate limiter — bounded map to prevent unbounded memory growth.
// Mirrors the approach used by app/api/events/route.ts.
const rateLimitMap = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 120;
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

// GET /api/progress?device_id=...&module_ids=a,b,c
// Returns the list of completed module_ids for the device, optionally filtered
// to a comma-separated set of module_ids (used to build per-subject progress bars).
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const device_id = searchParams.get("device_id");
    const moduleIdsParam = searchParams.get("module_ids");

    if (!device_id) {
      return NextResponse.json({ error: "Missing device_id" }, { status: 400 });
    }

    const supabase = createServerClient();
    let query = supabase
      .from("module_progress")
      .select("module_id")
      .eq("device_id", device_id);

    if (moduleIdsParam) {
      const moduleIds = moduleIdsParam.split(",").map((m) => m.trim()).filter(Boolean);
      if (moduleIds.length === 0) {
        return NextResponse.json({ completed: [] });
      }
      query = query.in("module_id", moduleIds);
    }

    const { data } = await query;
    const completed = (data ?? []).map((row) => row.module_id);
    return NextResponse.json({ completed });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST /api/progress  { device_id, module_id, completed?: boolean }
// Toggles (or explicitly sets) completion for a module. Returns the new state.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { device_id, module_id, completed } = body as {
      device_id: string;
      module_id: string;
      completed?: boolean;
    };

    if (!device_id || !module_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (isRateLimited(getRateLimitKey(req))) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }

    const supabase = createServerClient();
    const userId = await getCurrentUserId();

    // Determine the desired next state. If `completed` is provided, honour it;
    // otherwise toggle based on whether a row already exists.
    let nextCompleted: boolean;
    if (typeof completed === "boolean") {
      nextCompleted = completed;
    } else {
      const { data: existing } = await supabase
        .from("module_progress")
        .select("module_id")
        .eq("device_id", device_id)
        .eq("module_id", module_id)
        .maybeSingle();
      nextCompleted = !existing;
    }

    if (nextCompleted) {
      await supabase
        .from("module_progress")
        .upsert(
          { device_id, module_id, ...(userId ? { user_id: userId } : {}) },
          { onConflict: "device_id,module_id" },
        );
    } else {
      await supabase
        .from("module_progress")
        .delete()
        .eq("device_id", device_id)
        .eq("module_id", module_id);
    }

    return NextResponse.json({ ok: true, completed: nextCompleted });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
