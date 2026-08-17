/**
 * Growth collector.
 *
 * Deterministic. Calls Postgres aggregate functions over RPC and writes JSON
 * for VANTAGE to interpret. No model involved, so running this costs nothing
 * and it can be re-run freely while debugging.
 *
 * Everything is aggregated in Postgres, never here. Supabase caps a select at
 * 1000 rows and `events` is far past that, so a client-side count(distinct)
 * would silently truncate and report a confidently wrong funnel.
 *
 * Every distribution capped by row count comes back from Postgres as
 * `{ rows, total_groups }`, not a bare array — total_groups is the untruncated
 * group count, so a consumer can say "top 25 of 31" instead of presenting a
 * truncated list as complete (owner ruling, 2026-08-10). See
 * supabase/migrations/20260808000002_growth_audience_agg.sql and
 * supabase/migrations/20260808000003_growth_retention_agg.sql for the exact
 * shape of each aggregate. Every field access on a capped distribution below
 * goes through `.rows`.
 *
 * tsx transpiles to CommonJS: __dirname works, top-level await does not —
 * hence main().catch().
 */

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  diffMetrics,
  renderMetricsTable,
  type Metric,
} from "../../lib/reports/metrics";
import { archiveExistingRun } from "../../lib/reports/runArchive";
import { phDate, phWeekWindows, type PhWindow } from "../../lib/reports/phWeek";
import {
  buildFunnel,
  funnelMetrics,
  largestLeak,
  pct,
  type FunnelCounts,
} from "../../lib/reports/funnel";
import { phaseForRange } from "../../lib/reports/academicCalendar";
import { callRpc, createReportsClient } from "./supabaseAdmin";

const REPO_ROOT = join(__dirname, "..", "..");
const COHORT_WEEKS = 8;

/**
 * The shape every row-count-capped Postgres aggregate returns as of the
 * 2026-08-10 owner ruling: the capped list plus the untruncated group count
 * it was capped from. `rows` can be `null` — `json_agg` over zero rows
 * returns SQL NULL, not `[]`.
 */
interface Capped<T> {
  rows: T[] | null;
  total_groups: number;
}

interface IdentityAgg {
  accounts: number;
  accounts_confirmed: number;
  profiles: number;
  devices_entered: number;
  devices_any_event: number;
  devices_paid: number;
  devices_subscribed: number;
  subscriptions_active: number;
  payments_with_user_id: number;
  payments_total: number;
  waitlist_emails: number;
  class_member_devices: number;
  feedback_devices: number;
}

interface FunnelAgg {
  since: string;
  until: string;
  steps: FunnelCounts & { subject_open_any: number; any_event: number };
  ledger: { paid: number; paid_after_subscribe_click: number };
  entitlements: { subscriptions_created: number };
  dead_events: {
    unlock_click_rows: number;
    unlock_submitted_rows: number;
    dead_last_seen: string | null;
  };
}

interface AcquisitionAgg {
  enters: number;
  devices: number;
  no_referrer: number;
  // Capped at 15, nested per the 2026-08-10 ruling — NOT a bare array.
  by_referrer_host: Capped<{ host: string; count: number }>;
  by_utm_source: Capped<{ utm_source: string; utm_medium: string; count: number }>;
  by_utm_campaign: Capped<{ utm_campaign: string; count: number }>;
}

interface SegmentYearRow {
  year_label: string;
  module_open_devices: number;
  paywall_devices: number;
  paid_devices: number;
}

interface SegmentSubjectRow {
  subject_title: string;
  year_label: string;
  module_open_devices: number;
  paywall_devices: number;
  // NOT "paid_devices". Renamed deliberately (owner ruling, 2026-08-10): this
  // filters payments.subject_id = s.id, which structurally can never match a
  // whole-year-plan payment — those rows carry subject_id IS NULL
  // (20260624120000_payments_ledger.sql:11), because isSubscribed() treats a
  // null-subject year plan as unlocking every subject in that year.
  // Year-plan payers ARE counted, correctly, in by_year.paid_devices instead
  // (that join is on year_id, which a payment always has).
  //
  // So: sum(subject_plan_paid_devices) across all subjects will always be
  // LESS than by_year.paid_devices summed across years, and the gap is
  // exactly the year-plan population — not a discrepancy, not a bug. Do not
  // "reconcile" the two; that was the mistake the rename exists to prevent.
  subject_plan_paid_devices: number;
}

interface SegmentAgg {
  by_year: SegmentYearRow[] | null;
  // Capped at 25, nested. by_year above is deliberately NOT capped/nested —
  // it iterates every row in `years`, which is a small, bounded set.
  by_subject: Capped<SegmentSubjectRow>;
}

interface CohortWeeklyActiveRow {
  active_week: string;
  active_devices: number;
}

interface CohortRow {
  cohort_week: string;
  size: number;
  returned_week_1: number;
  returned_week_2: number;
}

interface CohortAgg {
  weekly_active: CohortWeeklyActiveRow[] | null;
  cohorts: CohortRow[] | null;
}

interface ContentRow {
  module_title: string;
  subject_title: string;
  open_devices: number;
  completed_devices: number;
}

// growth_content_agg's ENTIRE return value is { rows, total_groups } — not a
// sub-key within a larger object, per the 2026-08-10 ruling.
type ContentAgg = Capped<ContentRow>;

interface DemandSourceRow {
  source: string;
  count: number;
}

interface DemandYearRow {
  year_label: string;
  count: number;
}

interface DemandSubjectRow {
  subject_title: string;
  year_label: string;
  count: number;
}

interface DemandWillingToPayRow {
  answer: string;
  count: number;
}

interface DemandDeviceTypeRow {
  device_type: string;
  count: number;
}

interface DemandAgg {
  signups_window: number;
  signups_all_time: number;
  by_source: DemandSourceRow[] | null;
  by_year: DemandYearRow[] | null;
  // Capped at 20, nested. The other four breakdowns above are drawn from
  // small, inherently bounded value sets and stay bare arrays.
  by_subject: Capped<DemandSubjectRow>;
  willing_to_pay: DemandWillingToPayRow[] | null;
  by_device_type: DemandDeviceTypeRow[] | null;
}

interface FeedbackRecentRow {
  created_at: string;
  app_rating: number | null;
  module_rating: number | null;
  feedback_text: string | null;
  module_title: string | null;
}

interface FeedbackAgg {
  rows_window: number;
  rows_all_time: number;
  avg_app_rating: number | null;
  avg_module_rating: number | null;
  // Capped at 40, nested. total_groups counts rows with non-empty
  // feedback_text in the window, which is NOT rows_window (that also counts
  // blank-text rows `recent` excludes) — rows_window cannot substitute as
  // this field's own truncation signal.
  recent: Capped<FeedbackRecentRow>;
}

interface CollectorError {
  rpc: string;
  message: string;
}

/**
 * Finds the most recent prior run and its metrics. Identical in behaviour to
 * the Ops collector's version: any failure degrades to a baseline run rather
 * than crashing. A previous run is a nice-to-have, never a hard dependency.
 */
function readPreviousRun(
  outDir: string,
  todayFilename: string
): { date: string; metrics: Metric[] } | null {
  let files: string[];
  try {
    files = readdirSync(outDir).filter((name) => name.endsWith(".json"));
  } catch {
    return null;
  }

  const previousFile = files.filter((name) => name < todayFilename).sort().at(-1);
  if (!previousFile) return null;

  try {
    const parsed = JSON.parse(
      readFileSync(join(outDir, previousFile), "utf8")
    ) as { metrics?: unknown };
    if (!Array.isArray(parsed.metrics)) return null;
    return {
      date: previousFile.replace(/\.json$/, ""),
      metrics: parsed.metrics as Metric[],
    };
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const started = Date.now();
  const client = createReportsClient();
  const errors: CollectorError[] = [];

  const [current, previous] = phWeekWindows(new Date(), 2) as [PhWindow, PhWindow];
  const windowArgs = { p_since: current.sinceIso, p_until: current.untilIso };

  // --- Fatal reads. A Growth report without these is not a Growth report. ---
  const identityResult = await callRpc<IdentityAgg>(client, "growth_identity_agg");
  if (!identityResult.ok || !identityResult.data) {
    throw new Error(
      `growth_identity_agg failed: ${identityResult.error}. The identity ` +
        `reconciliation is the first-run priority; every other Growth number is ` +
        `untrustworthy without it. Refusing to write a report.`
    );
  }
  const identity = identityResult.data;

  const funnelResult = await callRpc<FunnelAgg>(client, "growth_funnel_agg", windowArgs);
  if (!funnelResult.ok || !funnelResult.data) {
    throw new Error(`growth_funnel_agg failed: ${funnelResult.error}. Refusing to write a report.`);
  }
  const funnelAgg = funnelResult.data;

  // --- Degradable reads. A failure here costs a section, not the run. ---
  async function optional<T>(name: string, args: Record<string, unknown> = {}): Promise<T | null> {
    const result = await callRpc<T>(client, name, args);
    if (!result.ok) {
      errors.push({ rpc: name, message: result.error ?? "unknown error" });
      return null;
    }
    return result.data;
  }

  const acquisition = await optional<AcquisitionAgg>("growth_acquisition_agg", windowArgs);
  const segments = await optional<SegmentAgg>("growth_segment_agg", windowArgs);
  const cohorts = await optional<CohortAgg>("growth_cohort_agg", { p_weeks: COHORT_WEEKS });
  const content = await optional<ContentAgg>("growth_content_agg", windowArgs);
  const demand = await optional<DemandAgg>("growth_demand_agg", windowArgs);
  const feedback = await optional<FeedbackAgg>("growth_feedback_agg", windowArgs);

  // --- Shape the funnel ---
  const steps = buildFunnel({
    ...funnelAgg.steps,
    paid: funnelAgg.ledger.paid,
  });
  const leak = largestLeak(steps);

  const funnelRows: Metric[] = [
    ...funnelMetrics(steps, leak),
    {
      label: "Paid without checkout click",
      value: funnelAgg.ledger.paid - funnelAgg.ledger.paid_after_subscribe_click,
    },
    { label: "Subscriptions created", value: funnelAgg.entitlements.subscriptions_created },
    // Not the funnel step: this counts every subject_open including the ones
    // the subject LIST page emits without a subject_id. The gap against row 3
    // is the inflation the admin dashboard currently shows.
    { label: "subject_open (unfiltered)", value: funnelAgg.steps.subject_open_any },
  ];

  const audienceRows: Metric[] = [
    // Identity. Two populations, two names, never merged into "users".
    { label: "Devices reached (all-time)", value: identity.devices_entered },
    { label: "Devices any event (all-time)", value: identity.devices_any_event },
    { label: "Accounts (auth)", value: identity.accounts },
    { label: "Accounts confirmed", value: identity.accounts_confirmed },
    { label: "Profiles", value: identity.profiles },
    { label: "Devices paid (all-time)", value: identity.devices_paid },
    { label: "Subscriptions active", value: identity.subscriptions_active },
    // Acquisition.
    { label: "Enters this week", value: acquisition?.enters ?? null },
    {
      label: "No-referrer share",
      value: acquisition ? pct(acquisition.no_referrer, acquisition.enters) : null,
      unit: "%",
    },
    {
      // by_referrer_host is capped-and-nested ({ rows, total_groups }), not a
      // bare array — the `.rows` here is load-bearing. Omitting it types as
      // `undefined` silently rather than erroring (Ruling 1, 2026-08-10).
      label: "Top referrer host",
      value: acquisition?.by_referrer_host?.rows?.[0]?.host ?? null,
    },
    // Demand and voice.
    { label: "Waitlist signups this week", value: demand?.signups_window ?? null },
    { label: "Feedback rows this week", value: feedback?.rows_window ?? null },
    { label: "Avg app rating this week", value: feedback?.avg_app_rating ?? null },
    // Health of the run itself.
    { label: "Collector RPC errors", value: errors.length },
  ];

  const metrics = [...funnelRows, ...audienceRows];

  const collectMs = Date.now() - started;

  // Manila calendar date, matching the Ops collector. VANTAGE reads this
  // filename back with `TZ=Asia/Manila date +%F`. Between midnight and 8am
  // Manila, UTC is on a different calendar day, so using UTC here would make
  // the agent look for a file this script never wrote.
  const date = phDate(new Date());
  const outDir = join(REPO_ROOT, "docs", "reports", "growth", ".data");
  mkdirSync(outDir, { recursive: true });

  const outFilename = `${date}.json`;
  const previousRun = readPreviousRun(outDir, outFilename);

  // The collector renders both finished tables so VANTAGE pastes them verbatim
  // and never touches a number — every figure in the report traces back to
  // tested code, not to the agent's arithmetic.
  const tables = {
    funnel: renderMetricsTable(
      diffMetrics(funnelRows, previousRun?.metrics ?? null),
      "FUNNEL",
      { now: "THIS WEEK", previous: "LAST WEEK" }
    ),
    audience: renderMetricsTable(
      diffMetrics(audienceRows, previousRun?.metrics ?? null),
      "AUDIENCE",
      { now: "THIS WEEK", previous: "LAST WEEK" }
    ),
  };

  const [startPhDate, endPhDate] = current.label.split(" → ");

  const payload = {
    collectedAt: new Date().toISOString(),
    collectMs,
    window: { current, previous },
    termPhase: phaseForRange(startPhDate, endPhDate),
    metrics,
    previousDate: previousRun?.date ?? null,
    tables,
    funnel: steps,
    leak,
    // Stored as the RPCs returned them, so every capped distribution's
    // total_groups travels with it automatically — nothing here reshapes or
    // strips it. VANTAGE reads raw.acquisition.by_referrer_host.total_groups,
    // raw.segments.by_subject.total_groups, raw.content.total_groups,
    // raw.demand.by_subject.total_groups and raw.feedback.recent.total_groups
    // to report "top N of M" honestly.
    raw: {
      identity,
      funnel: funnelAgg,
      acquisition,
      segments,
      cohorts,
      content,
      demand,
      feedback,
    },
    errors,
  };

  // A second run today would land on the same filename. Displace the earlier
  // run rather than overwriting it, so a report already published from it can
  // still be checked against the numbers it actually cited.
  const superseded = archiveExistingRun(outDir, outFilename);

  const outPath = join(outDir, outFilename);
  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(outPath);
  if (superseded) console.log(`superseded earlier run today -> ${superseded}`);
  if (errors.length > 0) {
    console.log(`${errors.length} RPC error(s) recorded in the payload's errors array`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
