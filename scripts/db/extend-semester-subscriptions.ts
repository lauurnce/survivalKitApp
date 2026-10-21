/**
 * One-off: extend semester subscriptions sold under the old SEMESTER_END.
 *
 * SEMESTER_END moved from 2026-12-31 23:59 PH to 2027-01-31 23:59 PH so that
 * semester access covers PUP's mid-January finals. Rows already written by the
 * webhook carry the old value as `current_period_end`; this script finds rows
 * whose end equals the old constant EXACTLY and moves them to the new one.
 *
 *   npx tsx scripts/db/extend-semester-subscriptions.ts           # dry run
 *   npx tsx scripts/db/extend-semester-subscriptions.ts --apply   # write
 *
 * Dry run is the default and never writes. Output is ids, inferred plan,
 * status and period end only — no device ids, user ids or emails.
 *
 * The exact-equality match is the safety property: a subject_month row can
 * only land on 2026-12-31T15:59:59Z to the second by coincidence, and any row
 * an admin set by hand to a different end is left alone. The update re-checks
 * the old value too, so a second --apply is a no-op.
 *
 * Credentials come from .env.reports.local, like scripts/db/schema-check.ts.
 * tsx transpiles to CommonJS, so no top-level await.
 */

import { SEMESTER_END } from "../../lib/paymongo";
import { createReportsClient } from "../reports/supabaseAdmin";

const OLD_SEMESTER_END_ISO = "2026-12-31T15:59:59.000Z";

interface SubscriptionRow {
  id: string;
  subject_id: string | null;
  status: string;
  current_period_end: string;
}

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  const newEndIso = SEMESTER_END.toISOString();

  if (newEndIso === OLD_SEMESTER_END_ISO) {
    throw new Error("SEMESTER_END still equals the old end; nothing to extend to.");
  }

  const client = createReportsClient();

  const { data, error } = await client
    .from("subscriptions")
    .select("id, subject_id, status, current_period_end")
    .eq("current_period_end", OLD_SEMESTER_END_ISO)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Reading subscriptions failed: ${error.message}`);
  const rows = (data ?? []) as SubscriptionRow[];

  console.log(`Mode: ${apply ? "APPLY" : "dry run (pass --apply to write)"}`);
  console.log(`Old end: ${OLD_SEMESTER_END_ISO}`);
  console.log(`New end: ${newEndIso}`);
  console.log(`Matching subscriptions: ${rows.length}`);
  for (const row of rows) {
    // subscriptions has no plan column. A row on the semester end is a
    // semester plan; subject_id decides which one.
    const plan = row.subject_id === null ? "year_sem" : "subject_sem";
    console.log(`  ${row.id}  ${plan.padEnd(11)}  ${row.status.padEnd(9)}  ${row.current_period_end}`);
  }

  // Class blocks are also granted until SEMESTER_END. Reported, not touched:
  // extending them is a separate decision.
  const { count: classCount, error: classError } = await client
    .from("classes")
    .select("id", { count: "exact", head: true })
    .eq("current_period_end", OLD_SEMESTER_END_ISO);
  console.log(
    `Classes on the old end (not modified by this script): ${
      classError ? `not read (${classError.message})` : classCount ?? "not read"
    }`
  );

  if (!apply || rows.length === 0) return;

  const ids = rows.map((r) => r.id);
  const { data: updated, error: updateError } = await client
    .from("subscriptions")
    .update({ current_period_end: newEndIso })
    .in("id", ids)
    .eq("current_period_end", OLD_SEMESTER_END_ISO)
    .select("id, current_period_end");
  if (updateError) throw new Error(`Updating subscriptions failed: ${updateError.message}`);
  console.log(`Updated ${updated?.length ?? 0} of ${ids.length} subscriptions to ${newEndIso}.`);
}

main().catch((e: unknown) => {
  console.error("extend-semester-subscriptions failed:", e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
