/**
 * Move semester subscriptions from one term access end to another.
 *
 * Use when a scheduled term's `accessEndsAt` in lib/terms.ts moves after
 * passes have already been sold against it (first needed when the old
 * SEMESTER_END constant moved from 2026-12-31 to 2027-01-31 to cover PUP's January
 * finals). Rows the webhook wrote carry the old end as `current_period_end`;
 * this finds rows whose end equals --from EXACTLY and moves them to --to.
 *
 *   npx tsx scripts/db/extend-semester-subscriptions.ts --from 2027-06-30T15:59:59Z --to 2027-07-07T15:59:59Z
 *   npx tsx scripts/db/extend-semester-subscriptions.ts --from ... --to ... --apply
 *
 * --to must be a term end currently in TERM_SCHEDULE, so the script cannot
 * move rows to a date the code would not itself grant. Change lib/terms.ts
 * first, then run this. Full procedure: docs/runbooks/semester-rollover.md.
 *
 * Dry run is the default and never writes. Output is ids, inferred plan,
 * status and period end only — no device ids, user ids or emails.
 *
 * The exact-equality match is the safety property: a subject_month row can
 * only land on a term end to the second by coincidence, and any row an admin
 * set by hand to a different end is left alone. The update re-checks the old
 * value too, so a second --apply is a no-op. Only ever extends: --to must be
 * later than --from.
 *
 * Credentials come from .env.reports.local, like scripts/db/schema-check.ts.
 * tsx transpiles to CommonJS, so no top-level await.
 */

import { TERM_SCHEDULE } from "../../lib/terms";
import { createReportsClient } from "../reports/supabaseAdmin";

function isoArg(flag: string): string {
  const i = process.argv.indexOf(flag);
  const raw = i === -1 ? undefined : process.argv[i + 1];
  if (!raw) throw new Error(`${flag} <ISO instant> is required`);
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) throw new Error(`${flag} is not a date: ${raw}`);
  return d.toISOString();
}

interface SubscriptionRow {
  id: string;
  subject_id: string | null;
  status: string;
  current_period_end: string;
}

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  const oldEndIso = isoArg("--from");
  const newEndIso = isoArg("--to");

  if (new Date(newEndIso).getTime() <= new Date(oldEndIso).getTime()) {
    throw new Error("--to must be later than --from; this script only extends access.");
  }
  const scheduled = TERM_SCHEDULE.map((t) => new Date(t.accessEndsAt).toISOString());
  if (!scheduled.includes(newEndIso)) {
    throw new Error(`--to ${newEndIso} is not a term end in lib/terms.ts (${scheduled.join(", ")}).`);
  }

  const client = createReportsClient();

  const { data, error } = await client
    .from("subscriptions")
    .select("id, subject_id, status, current_period_end")
    .eq("current_period_end", oldEndIso)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Reading subscriptions failed: ${error.message}`);
  const rows = (data ?? []) as SubscriptionRow[];

  console.log(`Mode: ${apply ? "APPLY" : "dry run (pass --apply to write)"}`);
  console.log(`Old end: ${oldEndIso}`);
  console.log(`New end: ${newEndIso}`);
  console.log(`Matching subscriptions: ${rows.length}`);
  for (const row of rows) {
    // subscriptions has no plan column. A row on the semester end is a
    // semester plan; subject_id decides which one.
    const plan = row.subject_id === null ? "year_sem" : "subject_sem";
    console.log(`  ${row.id}  ${plan.padEnd(11)}  ${row.status.padEnd(9)}  ${row.current_period_end}`);
  }

  // Class blocks are also granted until the term end. Reported, not touched:
  // extending them is a separate decision (SQL in the runbook).
  const { count: classCount, error: classError } = await client
    .from("classes")
    .select("id", { count: "exact", head: true })
    .eq("current_period_end", oldEndIso);
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
    .eq("current_period_end", oldEndIso)
    .select("id, current_period_end");
  if (updateError) throw new Error(`Updating subscriptions failed: ${updateError.message}`);
  console.log(`Updated ${updated?.length ?? 0} of ${ids.length} subscriptions to ${newEndIso}.`);
}

main().catch((e: unknown) => {
  console.error("extend-semester-subscriptions failed:", e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
