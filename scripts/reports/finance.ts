/**
 * Finance collector.
 *
 * Deterministic. Reads production Supabase read-only, computes every figure
 * through tested functions in lib/reports/, renders the finished tables, and
 * writes JSON for LEDGER to interpret. No model is involved, so running this
 * costs nothing and it can be re-run freely while debugging.
 *
 * DUAL CADENCE. Monthly by default — a month is the smallest window in which
 * revenue accounting means anything. `--weekly` writes a six-row delta into a
 * SUBDIRECTORY of the same data directory, so a weekly file can never be
 * picked up as last month's baseline by readPreviousRun, which globs
 * non-recursively.
 *
 * THE CURRENT MONTH NEVER GETS A DELTA. Its rows render in their own table
 * built from diffMetrics(rows, null) — which emits "—" in the previous and
 * delta columns by construction rather than by anyone remembering to suppress
 * them — and are excluded from the persisted `metrics` array so a later run
 * cannot use them as a baseline either.
 *
 * EVERY NUMBER COMES FROM TESTED CODE. This file reads rows, calls pure
 * functions, and formats. It does no arithmetic of its own beyond summing and
 * counting, and LEDGER does none at all.
 *
 * tsx transpiles to CommonJS: __dirname works, top-level await does not —
 * hence main().catch().
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  diffMetrics,
  renderMetricsTable,
  type Metric,
} from "../../lib/reports/metrics";
import { archiveExistingRun } from "../../lib/reports/runArchive";
import { readPreviousRun } from "../../lib/reports/previousRun";
import {
  daysAgo,
  inWindow,
  phDayOfMonth,
  phDaysInMonth,
  phMonthKey,
} from "../../lib/reports/phWindow";
import { revenueByMonth } from "../../lib/payments";
import {
  annotateMonths,
  acquisitionCost,
  arpu,
  completeMonthDelta,
  completeMonths,
  modelPayback,
  observedLtv,
  paybackMonths,
  pesosFromCentavos,
  revenueByPlan,
  scenarios,
  unlockRevenuePesos,
  ZERO_CAC_DISCLAIMER,
  type BlockAmountMatcher,
} from "../../lib/reports/unitEconomics";
import {
  reconcile,
  summariseExceptions,
  type ClassRow,
  type PaymentRow,
  type SubscriptionRow,
} from "../../lib/reports/ledgerIntegrity";
import {
  expirySchedule,
  recogniseLedger,
  semesterEndStatus,
  semesterPlanParity,
} from "../../lib/reports/revenueRecognition";
import {
  abandonmentHandoff,
  INTENT_EVENT_TYPES,
  intentPerPayment,
  modeMatchSignal,
  quietLedger,
  readLivemodeFlag,
  WEBHOOK_LANDING_CEILING,
} from "../../lib/reports/billingSignals";
import {
  BLOCK_SOURCES,
  compareSources,
  extractConstants,
  isBlockAmountFrom,
  normaliseToCentavos,
  seatBoundEnforcement,
  type BlockConstants,
} from "../../lib/reports/blockPrice";
import {
  countRows,
  loadReportsEnv,
  readAllRows,
  reportsClient,
} from "./supabaseClient";

const REPO_ROOT = join(__dirname, "..", "..");
const MONTHS_OF_HISTORY = 13; // the running month plus twelve complete ones
const WEEK_DAYS = 7;

/** The Ops metric this collector copies. Verified as this exact literal. */
const ACTIVE_CPU_LABEL = "Active CPU / 4h";

interface CollectorError {
  source: string;
  message: string;
}

interface ClassMemberRow {
  id: string;
  class_id: string;
  device_id: string;
}

interface UnlockRow {
  id: string;
  amount: number; // PESOS, not centavos. See unitEconomics.ts.
}

/**
 * Reads the three block-price sources and builds the matcher plan attribution
 * needs. A failure here degrades attribution rather than stopping the run, but
 * it is always recorded — an unavailable matcher would silently file block
 * sales under a subject plan.
 */
function resolveBlockPricing(errors: CollectorError[]): {
  matcher: BlockAmountMatcher;
  constants: BlockConstants | null;
  sourcesRead: number;
  drift: ReturnType<typeof compareSources>;
  seatBounds: ReturnType<typeof seatBoundEnforcement> | null;
} {
  const entries: { path: string; constants: BlockConstants }[] = [];
  const texts = new Map<string, string>();

  for (const spec of BLOCK_SOURCES) {
    const full = join(REPO_ROOT, spec.path);
    if (!existsSync(full)) {
      errors.push({ source: spec.path, message: "file not found" });
      continue;
    }
    const text = readFileSync(full, "utf8");
    texts.set(spec.path, text);

    const result = extractConstants(text, spec);
    if (!result.ok) {
      errors.push({ source: spec.path, message: `missing ${result.missing.join(", ")}` });
      continue;
    }
    entries.push({
      path: spec.path,
      constants: normaliseToCentavos(result.constants, spec.unit),
    });
  }

  const drift = compareSources(entries);
  if (drift.length > 0) {
    errors.push({
      source: "block-price",
      message: `formula drift on ${drift.map((entry) => entry.field).join(", ")}`,
    });
  }

  const constants = entries[0]?.constants ?? null;
  const checkout = texts.get(BLOCK_SOURCES[1].path);
  const webhook = texts.get(BLOCK_SOURCES[2].path);

  return {
    // With no readable source there is no matcher. Returning false for
    // everything is wrong, and it is recorded as an error rather than hidden:
    // block sales would then land in the unattributed bucket, which is visible.
    matcher: constants ? isBlockAmountFrom(constants) : () => false,
    constants,
    sourcesRead: entries.length,
    drift,
    seatBounds: checkout && webhook ? seatBoundEnforcement(checkout, webhook) : null,
  };
}

/**
 * Copies the Active CPU reading from the most recent Operations run.
 *
 * readPreviousRun returns the latest file that sorts BEFORE the name it is
 * given, so a sentinel filename that sorts after every real date returns the
 * newest run. That reuses tested code instead of adding a second directory
 * scan with its own edge cases.
 *
 * Never estimated. If Ops has not run, or ran without the meter being read by
 * eye, this stays null and renders as "not read".
 */
function activeCpuFromOps(errors: CollectorError[]): {
  value: Metric["value"];
  fromRun: string | null;
} {
  const opsDir = join(REPO_ROOT, "docs", "reports", "ops", ".data");
  const latest = readPreviousRun(opsDir, "9999-99-99.json");
  if (!latest) {
    errors.push({
      source: "ops-handoff",
      message: "no Operations run found; Active CPU stays not read",
    });
    return { value: null, fromRun: null };
  }

  const row = latest.metrics.find((metric) => metric.label === ACTIVE_CPU_LABEL);
  if (!row) {
    errors.push({
      source: "ops-handoff",
      message: `Operations run ${latest.key} has no "${ACTIVE_CPU_LABEL}" row`,
    });
    return { value: null, fromRun: latest.key };
  }

  return { value: row.value, fromRun: latest.key };
}

async function main(): Promise<void> {
  const started = Date.now();
  const weekly = process.argv.includes("--weekly");
  const now = new Date();
  const errors: CollectorError[] = [];

  loadReportsEnv();
  const client = reportsClient();

  // ── Fatal reads ──
  const payments = await readAllRows<PaymentRow>(
    client,
    "payments",
    "id,paymongo_link_id,device_id,year_id,subject_id,amount,paid_at"
  );
  const subscriptions = await readAllRows<SubscriptionRow>(
    client,
    "subscriptions",
    "id,paymongo_link_id,device_id,year_id,subject_id,status,current_period_end,created_at"
  );

  // ── Degradable reads. A failure costs a section, not the run. ──
  async function optional<T>(table: string, columns: string): Promise<T[] | null> {
    try {
      return await readAllRows<T>(client, table, columns);
    } catch (error) {
      errors.push({
        source: table,
        message: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  const classes = await optional<ClassRow>(
    "classes",
    "id,code,paymongo_link_id,rep_device_id,year_id,subject_id,seat_cap,status,current_period_end,created_at"
  );
  const classMembers = await optional<ClassMemberRow>(
    "class_members",
    "id,class_id,device_id"
  );
  const unlocks = await optional<UnlockRow>("unlocks", "id,amount");

  // ── Windows ──
  const weekFrom = daysAgo(now, WEEK_DAYS);
  const priorWeekFrom = daysAgo(now, WEEK_DAYS * 2);
  const monthKey = phMonthKey(now);

  // Intent is COUNTED, never selected: `events` is far past the 1000-row cap
  // and head:true queries return a count header with no rows.
  const intentWindow = weekly
    ? { since: weekFrom, until: now }
    : { since: daysAgo(now, phDayOfMonth(now) - 1), until: now };
  const intentEvents = await countRows(client, "events", (query) =>
    query
      .in("event_type", [...INTENT_EVENT_TYPES])
      .gte("created_at", intentWindow.since.toISOString())
      .lt("created_at", intentWindow.until.toISOString())
  );
  if (intentEvents === null) {
    errors.push({ source: "events", message: "intent count unavailable" });
  }

  // ── Pure computation. Everything below comes from tested functions. ──
  const blockPricing = resolveBlockPricing(errors);
  const reconciliation = reconcile({
    payments,
    subscriptions,
    classes: classes ?? [],
    isBlockAmount: blockPricing.matcher,
  });
  const exceptions = summariseExceptions(reconciliation.exceptions);

  const months = annotateMonths(revenueByMonth(payments, MONTHS_OF_HISTORY, now), now);
  const finished = completeMonths(months);
  const monthDelta = completeMonthDelta(months);
  const current = months[0];

  const planRevenue = revenueByPlan(payments, blockPricing.matcher);
  const revenuePesosAllTime = pesosFromCentavos(
    payments.reduce((sum, row) => sum + row.amount, 0)
  );
  const payingDevices = new Set(payments.map((row) => row.device_id)).size;
  const ltv = observedLtv(revenuePesosAllTime, payingDevices, payments.length);
  const cac = acquisitionCost(0, payingDevices); // no acquisition spend exists

  // Recognition needs a period end, which lives on the entitlement, not the
  // payment. Build the join from the reconciler's matched pairs so the two
  // cannot disagree about which payment granted what.
  const entitlementById = new Map(
    [
      ...subscriptions.map((row) => [row.id, row.current_period_end] as const),
      ...(classes ?? []).map((row) => [row.id, row.current_period_end] as const),
    ]
  );
  const matchByPaymentId = new Map(
    reconciliation.matched.map((pair) => [pair.paymentId, pair])
  );
  const recognitionRows = payments.map((row) => {
    const pair = matchByPaymentId.get(row.id);
    return {
      amountCentavos: row.amount,
      paidAt: row.paid_at,
      periodEnd: pair ? entitlementById.get(pair.entitlementId) ?? null : null,
      // A payment matched only by natural key had its period overwritten by a
      // later renewal — the original is unrecoverable, so it is fully earned.
      superseded: pair?.via === "natural-key",
    };
  });
  const recognition = recogniseLedger(recognitionRows, now);

  // Revenue at risk needs the amount that bought each entitlement.
  const amountByEntitlementId = new Map<string, number>();
  for (const pair of reconciliation.matched) {
    if (pair.via !== "link-id") continue; // the renewal's own payment is the live one
    const payment = payments.find((row) => row.id === pair.paymentId);
    if (payment) amountByEntitlementId.set(pair.entitlementId, payment.amount);
  }
  const expiry = expirySchedule(
    [
      ...subscriptions.map((row) => ({
        id: row.id,
        currentPeriodEnd: row.current_period_end,
        status: row.status,
        amountCentavos: amountByEntitlementId.get(row.id) ?? null,
      })),
      ...(classes ?? []).map((row) => ({
        id: row.id,
        currentPeriodEnd: row.current_period_end,
        status: row.status,
        amountCentavos: amountByEntitlementId.get(row.id) ?? null,
      })),
    ],
    now
  );
  const expiringSoon = expiry.buckets
    .filter((bucket) => bucket.label === "<=7d" || bucket.label === "<=30d")
    .reduce(
      (acc, bucket) => ({
        count: acc.count + bucket.count,
        centavos: acc.centavos + bucket.revenueAtRiskCentavos,
      }),
      { count: 0, centavos: 0 }
    );

  const semesterEnd = semesterEndStatus(now);
  const parity = semesterPlanParity(now);

  const lastPaidAt =
    payments
      .map((row) => row.paid_at)
      .sort()
      .at(-1) ?? null;
  const quiet = quietLedger(lastPaidAt, now);

  const paymentsThisWeek = payments.filter((row) =>
    inWindow(row.paid_at, weekFrom, now)
  );
  const paymentsPriorWeek = payments.filter((row) =>
    inWindow(row.paid_at, priorWeekFrom, weekFrom)
  );

  const livemode = readLivemodeFlag(process.env.PAYMONGO_LIVEMODE);
  const modeMatch = modeMatchSignal({
    paymentsInWindow: weekly
      ? paymentsThisWeek.length
      : payments.filter((row) => phMonthKey(new Date(row.paid_at)) === monthKey).length,
    intentInWindow: intentEvents,
  });

  const activeCpu = activeCpuFromOps(errors);

  // ── Metric rows. The row set is the contract: identical every run. ──
  const planRow = (bucket: string) =>
    planRevenue.find((row) => row.bucket === bucket)?.revenuePesos ?? null;

  const ledgerRows: Metric[] = [
    { label: "Payments recorded", value: payments.length },
    { label: "Subscriptions", value: subscriptions.length },
    {
      label: "Subscriptions active",
      value: subscriptions.filter((row) => row.status === "active").length,
    },
    { label: "Classes", value: classes?.length ?? null },
    {
      label: "Class seats sold",
      value: classes ? classes.reduce((sum, row) => sum + row.seat_cap, 0) : null,
    },
    { label: "Class seats occupied", value: classMembers?.length ?? null },
    { label: "Matched by link id", value: reconciliation.counts.matchedDirect },
    { label: "Matched via renewal", value: reconciliation.counts.matchedByRenewal },
    { label: "Ledger exceptions", value: reconciliation.exceptions.length },
    {
      label: "Unexplained entitlements",
      value: exceptions.byKind["entitlement-without-payment"],
    },
    {
      label: "Payments without entitlement",
      value: exceptions.byKind["payment-without-entitlement"],
    },
    {
      label: "Locally-minted grants",
      value: exceptions.byKind["entitlement-locally-minted"],
    },
    {
      label: "Amounts not attributable",
      value: exceptions.byKind["amount-not-attributable"],
    },
    { label: "Duplicate entitlements", value: exceptions.byKind["duplicate-entitlement"] },
    { label: "Grant device mismatches", value: exceptions.byKind["grant-device-mismatch"] },
    { label: "Days since last payment", value: quiet.daysSinceLastPayment },
    // Not read, twice over: the value is [SENSITIVE], and this file is a local
    // copy rather than the deployed environment. See billingSignals.ts.
    { label: "LIVEMODE (local copy)", value: livemode.value === null ? null : String(livemode.value) },
    { label: "Mode-match signal", value: modeMatch.state },
    { label: "Intent events (window)", value: intentEvents },
    { label: "Intent per payment", value: intentPerPayment(intentEvents, paymentsThisWeek.length) },
    {
      label: "Block price sources agreeing",
      value: `${blockPricing.drift.length === 0 ? blockPricing.sourcesRead : 0}/${BLOCK_SOURCES.length}`,
    },
    {
      label: "MAX_SEATS enforced",
      value: blockPricing.seatBounds
        ? blockPricing.seatBounds.maxEnforcedAtCheckout &&
          blockPricing.seatBounds.maxEnforcedAtWebhook
          ? "yes"
          : "no"
        : null,
    },
    { label: "Collector errors", value: errors.length },
  ];

  const economicsRows: Metric[] = [
    { label: "Revenue · last complete", value: finished[0]?.revenuePesos ?? null },
    { label: "Payments · last complete", value: finished[0]?.payments ?? null },
    { label: "Month-over-month Δ", value: monthDelta?.deltaPesos ?? null },
    { label: "Revenue · subject_month", value: planRow("subject_month") },
    { label: "Revenue · subject_sem", value: planRow("subject_sem") },
    { label: "Revenue · year_sem", value: planRow("year_sem") },
    { label: "Revenue · block", value: planRow("block") },
    { label: "Revenue · unattributed", value: planRow("unattributed") },
    {
      label: "Legacy unlock revenue",
      value: unlocks ? unlockRevenuePesos(unlocks) : null,
    },
    { label: "Paying devices", value: payingDevices },
    { label: "ARPU", value: arpu(revenuePesosAllTime, payingDevices) },
    { label: "Observed LTV", value: ltv.pesos },
    { label: "Payments per paying device", value: ltv.paymentsPerPayingDevice },
    { label: "CAC", value: cac.pesos },
    {
      label: "Payback (months)",
      value: paybackMonths(cac.pesos, arpu(revenuePesosAllTime, payingDevices)),
    },
    { label: "Earned revenue", value: pesosFromCentavos(recognition.earnedCentavos) },
    { label: "Deferred revenue", value: pesosFromCentavos(recognition.deferredCentavos) },
    { label: "Entitlements expiring <=30d", value: expiringSoon.count },
    { label: "Revenue at risk <=30d", value: pesosFromCentavos(expiringSoon.centavos) },
    {
      label: "Expiry concentration",
      value: Math.round(expiry.concentration * 100),
      unit: "%",
    },
    { label: "Semester end", value: semesterEnd.semesterEndIso.slice(0, 10) },
    { label: "Days to semester end", value: semesterEnd.daysRemaining },
    { label: "Sem/month plan parity", value: parity.identical ? "IDENTICAL" : "distinct" },
    // Copied from Operations, never estimated here.
    { label: ACTIVE_CPU_LABEL, value: activeCpu.value },
  ];

  // Never diffed and never persisted into `metrics`. See the module header.
  const monthToDateRows: Metric[] = [
    { label: "Month", value: current?.month ?? monthKey },
    {
      label: "Day of month",
      value: `${current?.dayOfMonth ?? phDayOfMonth(now)}/${current?.daysInMonth ?? phDaysInMonth(now)}`,
    },
    { label: "Revenue so far", value: current?.revenuePesos ?? 0 },
    { label: "Payments so far", value: current?.payments ?? 0 },
  ];

  const weeklyRows: Metric[] = [
    {
      label: "Revenue this week",
      value: pesosFromCentavos(
        paymentsThisWeek.reduce((sum, row) => sum + row.amount, 0)
      ),
    },
    { label: "Payments this week", value: paymentsThisWeek.length },
    { label: "Days since last payment", value: quiet.daysSinceLastPayment },
    {
      label: "Unexplained entitlements",
      value: exceptions.byKind["entitlement-without-payment"],
    },
    {
      label: "Payments without entitlement",
      value: exceptions.byKind["payment-without-entitlement"],
    },
    { label: "Collector errors", value: errors.length },
  ];

  // ── Output ──
  const collectMs = Date.now() - started;
  const baseDir = join(REPO_ROOT, "docs", "reports", "finance", ".data");
  const outDir = weekly ? join(baseDir, "weekly") : baseDir;
  mkdirSync(outDir, { recursive: true });

  // Manila calendar key. The monthly run is keyed by month; the weekly one by
  // day, using the same expression scripts/reports/ops.ts uses so the two
  // collectors cannot drift apart on what "today" means.
  const key = weekly
    ? new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" })
    : monthKey;
  const outFilename = `${key}.json`;
  const previous = readPreviousRun(outDir, outFilename);

  const metrics = weekly ? weeklyRows : [...ledgerRows, ...economicsRows];
  const previousMetrics = previous?.metrics ?? null;

  const tables = weekly
    ? {
        week: renderMetricsTable(diffMetrics(weeklyRows, previousMetrics), "WEEK", {
          now: "THIS WEEK",
          previous: "LAST RUN",
        }),
      }
    : {
        ledger: renderMetricsTable(diffMetrics(ledgerRows, previousMetrics), "LEDGER", {
          now: "NOW",
          previous: "LAST MONTH",
        }),
        economics: renderMetricsTable(
          diffMetrics(economicsRows, previousMetrics),
          "ECONOMICS",
          { now: "NOW", previous: "LAST MONTH" }
        ),
        // diffMetrics(rows, null) renders "—" in both comparison columns by
        // construction. The running month cannot be given a delta even by
        // accident.
        monthToDate: renderMetricsTable(
          diffMetrics(monthToDateRows, null),
          "MONTH TO DATE",
          { now: "SO FAR", previous: "n/a" }
        ),
      };

  const payload = {
    collectedAt: new Date().toISOString(),
    collectMs,
    mode: weekly ? "weekly" : "monthly",
    key,
    monthKey,
    previousKey: previous?.key ?? null,
    metrics,
    tables,
    reconciliation: {
      counts: reconciliation.counts,
      summary: exceptions,
      // Named, not counted. Carries device and link ids — gitignored only.
      exceptions: reconciliation.exceptions,
    },
    months,
    monthDelta,
    weekOverWeek: {
      thisWeekPesos: pesosFromCentavos(
        paymentsThisWeek.reduce((sum, row) => sum + row.amount, 0)
      ),
      priorWeekPesos: pesosFromCentavos(
        paymentsPriorWeek.reduce((sum, row) => sum + row.amount, 0)
      ),
      thisWeekPayments: paymentsThisWeek.length,
      priorWeekPayments: paymentsPriorWeek.length,
    },
    economics: {
      planRevenue,
      revenuePesosAllTime,
      payingDevices,
      ltv,
      cac: { ...cac, disclaimer: ZERO_CAC_DISCLAIMER },
      modelledPayback: modelPayback(1000, 8, arpu(revenuePesosAllTime, payingDevices)),
      scenarios: finished[0]
        ? scenarios(finished[0])
        : null, // no complete month yet; stated rather than modelled from a partial one
    },
    recognition,
    expiry,
    semester: { ...semesterEnd, parity },
    billing: {
      livemode,
      modeMatch,
      handoffToGrowth: abandonmentHandoff({
        window: {
          sinceIso: intentWindow.since.toISOString(),
          untilIso: intentWindow.until.toISOString(),
        },
        intentEvents,
        payments: paymentsThisWeek.length,
      }),
      webhookLandingCeiling: WEBHOOK_LANDING_CEILING,
    },
    blockPrice: {
      sourcesRead: blockPricing.sourcesRead,
      expected: BLOCK_SOURCES.length,
      drift: blockPricing.drift,
      seatBounds: blockPricing.seatBounds,
    },
    costOfOperation: {
      activeCpu: activeCpu.value,
      activeCpuFromOpsRun: activeCpu.fromRun,
      note:
        "Vercel Active CPU has no API and is read by eye at the usage page. " +
        "Operations owns that measurement; this row is copied from the latest " +
        "Operations run or left not read. Hosting is on free tiers, so the " +
        "marginal cost of one more paying device is zero until a tier is " +
        "exceeded — which is a threshold, not a slope.",
    },
    errors,
  };

  // A second run in the same period would land on the same filename. Displace
  // the earlier run rather than overwriting it, so a report already published
  // from it can still be checked against the numbers it cited.
  const superseded = archiveExistingRun(outDir, outFilename);

  const outPath = join(outDir, outFilename);
  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(outPath);
  if (superseded) console.log(`superseded earlier run -> ${superseded}`);
  if (errors.length > 0) {
    console.log(`${errors.length} error(s) recorded in the payload's errors array`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
