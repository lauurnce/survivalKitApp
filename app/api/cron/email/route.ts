import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { drain, enqueue } from "@/lib/email/outbox";
import { canonicalUrl } from "@/lib/appOrigin";
import { SCAN_SLACK_MS, expiryScopeKey } from "@/lib/email/expiryScan";
import { timingSafeEqualStrings } from "@/lib/auth/timingSafeEqualStrings";

export const runtime = "nodejs";

const DAY = 24 * 60 * 60 * 1000;
const WARN_DAYS = 4; // warn this many days before access ends
const WINBACK_DAYS = 3; // win back this many days after it ended

type Scan = "expiry_warning" | "winback";

// Scans a full day (plus SCAN_SLACK_MS each side) around the target rather
// than an instant: a once-daily cron fires at a nominal time but drifts, and
// an exact-match query would skip any subscription whose period end fell
// between two runs. The outbox's unique index on (kind, user_id, scope_key) is
// what stops an overlapping window from queueing the same mail twice, so
// widening here is safe.
//
// Every semester pass sold in a term ends at the same instant (lib/terms.ts),
// so one run queues that whole cohort at once. With the 09:00 PH cron, a
// 23:59 PH term end is picked up 3 days 15 hours ahead for the warning and
// 3 days 9 hours after for the win-back.
interface ScannedSub {
  id: unknown;
  user_id: unknown;
  year_id: unknown;
  subject_id: unknown;
  current_period_end: string;
}

// True when the same account already holds access that outlasts this row for
// the same content: a renewal bought on another device (recordPayment keys
// rows by device), or a year pass covering a subject pass. Such a user has
// renewed, so "your access ends" or "your reviewers are locked" would be
// false. A failed lookup returns false: a redundant reminder beats a silently
// skipped one.
async function hasLaterAccess(
  supabase: ReturnType<typeof createServerClient>,
  sub: ScannedSub
): Promise<boolean> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("id, subject_id")
    .eq("user_id", String(sub.user_id))
    .eq("status", "active")
    .eq("year_id", String(sub.year_id))
    .gt("current_period_end", sub.current_period_end);
  if (error) return false;
  return (data ?? []).some(
    (other: { id: unknown; subject_id: unknown }) =>
      other.id !== sub.id && (other.subject_id === null || other.subject_id === sub.subject_id)
  );
}

async function scan(
  supabase: ReturnType<typeof createServerClient>,
  kind: Scan,
  offsetMs: number
): Promise<number> {
  const target = Date.now() + offsetMs;
  const { data } = await supabase
    .from("subscriptions")
    .select("id, user_id, year_id, subject_id, current_period_end")
    // Never chase someone who cancelled or paused.
    .eq("status", "active")
    .gte("current_period_end", new Date(target - DAY / 2 - SCAN_SLACK_MS).toISOString())
    .lte("current_period_end", new Date(target + DAY / 2 + SCAN_SLACK_MS).toISOString());

  let queued = 0;
  for (const sub of data ?? []) {
    if (!sub.user_id) continue;
    if (await hasLaterAccess(supabase, sub)) continue;
    const { data: authUser } = await supabase.auth.admin.getUserById(String(sub.user_id));
    const toEmail = authUser?.user?.email;
    if (!toEmail) continue;
    try {
      const { enqueued } = await enqueue(supabase, {
        kind,
        userId: String(sub.user_id),
        toEmail,
        // One mail per subscription per period end. A renewal on the same
        // device updates the same subscription row (lib/payments.ts), so a
        // scope of the bare id would block every warning after the first:
        // a 1st-sem payer who renewed would never hear that the 2nd sem ends.
        scopeKey: expiryScopeKey(sub),
        payload: {
          planLabel: sub.subject_id ? "Subject access" : "All subjects",
          accessEndsAt: sub.current_period_end,
          url: canonicalUrl("/account"),
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
  if (!secret || !timingSafeEqualStrings(req.headers.get("authorization"), `Bearer ${secret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const warned = await scan(supabase, "expiry_warning", WARN_DAYS * DAY);
  const winback = await scan(supabase, "winback", -WINBACK_DAYS * DAY);
  const drained = await drain(supabase);

  return NextResponse.json({ ok: true, warned, winback, ...drained });
}
