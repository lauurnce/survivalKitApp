import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { drain, enqueue } from "@/lib/email/outbox";

export const runtime = "nodejs";

const DAY = 24 * 60 * 60 * 1000;
const WARN_DAYS = 4; // warn this many days before access ends
const WINBACK_DAYS = 3; // win back this many days after it ended

type Scan = "expiry_warning" | "winback";

// Scans a full day around the target rather than an instant: a once-daily cron
// fires at a nominal time but drifts, and an exact-match query would skip any
// subscription whose period end fell between two runs. The outbox's unique
// index on (kind, user_id, scope_key) is what stops an overlapping window from
// queueing the same mail twice, so widening here is safe.
async function scan(
  supabase: ReturnType<typeof createServerClient>,
  kind: Scan,
  offsetMs: number
): Promise<number> {
  const target = Date.now() + offsetMs;
  const { data } = await supabase
    .from("subscriptions")
    .select("id, user_id, subject_id, current_period_end")
    // Never chase someone who cancelled or paused.
    .eq("status", "active")
    .gte("current_period_end", new Date(target - DAY / 2).toISOString())
    .lte("current_period_end", new Date(target + DAY / 2).toISOString());

  let queued = 0;
  for (const sub of data ?? []) {
    if (!sub.user_id) continue;
    const { data: authUser } = await supabase.auth.admin.getUserById(String(sub.user_id));
    const toEmail = authUser?.user?.email;
    if (!toEmail) continue;
    try {
      const { enqueued } = await enqueue(supabase, {
        kind,
        userId: String(sub.user_id),
        toEmail,
        // The subscription itself is the scope: one warning per subscription, ever.
        scopeKey: String(sub.id),
        payload: {
          planLabel: sub.subject_id ? "Subject access" : "All subjects",
          accessEndsAt: sub.current_period_end,
          url: "https://survival-kit-app.vercel.app/account",
        },
      });
      if (enqueued) queued++;
    } catch (err) {
      // One bad row must not abandon the rest of the batch.
      console.error(`${kind} enqueue failed for ${sub.id}:`, err instanceof Error ? err.message : err);
    }
  }
  return queued;
}

export async function GET(req: Request) {
  // Fail closed: an unset secret rejects everyone rather than matching
  // "Bearer undefined" and exposing the queue on a misconfigured deploy.
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const warned = await scan(supabase, "expiry_warning", WARN_DAYS * DAY);
  const winback = await scan(supabase, "winback", -WINBACK_DAYS * DAY);
  const drained = await drain(supabase);

  return NextResponse.json({ ok: true, warned, winback, ...drained });
}
