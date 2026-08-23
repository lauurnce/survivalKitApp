/**
 * Revenue accounting, plan attribution, unit economics and scenario modelling.
 *
 * Four rules run through everything here.
 *
 * UNITS ARE IN THE NAMES. `payments.amount` is centavos; the legacy
 * `unlocks.amount` is pesos (default 20, per 001_initial_schema.sql); and
 * `revenueByMonth` in lib/payments.ts has ALREADY divided by 100, so its
 * `revenue` field is pesos and must not be converted a second time. Mixing any
 * two of those misstates revenue by 100×, in the flattering direction.
 *
 * ATTRIBUTION NEVER LOSES A PESO. The webhook grants access on
 * `paid >= expected`, so an overpayment is a real purchase, not a rounding
 * error. Anything that matches no known price lands in an explicit
 * `unattributed` bucket. A breakdown that silently omits rows would let a
 * whole category of revenue disappear without the total moving.
 *
 * NOTHING DIVIDES BY ZERO. Every rate returns null instead of Infinity or NaN.
 * A null renders as "not read", which is honest; a zero would read as "people
 * are paying nothing", which is a different and much more alarming claim.
 *
 * THE BLOCK MATCHER IS REQUIRED. Class block sales are priced by a seat
 * formula, not from PLANS. Without a matcher, a block payment clears the
 * subject-plan price and gets filed as a subject plan — overstating that plan's
 * revenue by more than an order of magnitude per sale. Making the argument
 * required turns forgetting it into a compile error. lib/reports/blockPrice.ts
 * supplies the real one; this module deliberately holds no copy of the formula.
 */

import { PLANS, type PlanKey } from "../paymongo";
import type { MonthlyRevenue } from "../payments";
import { phDayOfMonth, phDaysInMonth, phMonthKey } from "./phWindow";

export const CENTAVOS_PER_PESO = 100;

/** Money is rounded for display at two decimals and nowhere else. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function pesosFromCentavos(centavos: number): number {
  return centavos / CENTAVOS_PER_PESO;
}

/**
 * The pre-pivot `unlocks` ledger, which stores PESOS. Separate function and
 * separate name so it can never be piped through pesosFromCentavos as well.
 */
export function unlockRevenuePesos(rows: { amount: number }[]): number {
  return rows.reduce((sum, row) => sum + row.amount, 0);
}

// ── Plan attribution ────────────────────────────────────────────────────────

export type PlanBucket = PlanKey | "block" | "unattributed";

/** Fixed order. The metrics row set must not change shape between runs. */
export const PLAN_BUCKETS: readonly PlanBucket[] = [
  "subject_month",
  "subject_sem",
  "year_sem",
  "block",
  "unattributed",
] as const;

export interface PlanAttribution {
  bucket: PlanBucket;
  /**
   * How the amount was matched. `over` is a real purchase at more than the
   * list price; `none` means no known price explains it.
   */
  match: "exact" | "over" | "block" | "none";
}

/** Matches an amount against the class block-sale price. Supplied by blockPrice.ts. */
export type BlockAmountMatcher = (
  centavos: number,
  scope: "subject" | "all"
) => boolean;

export function attributePlan(
  amountCentavos: number,
  subjectId: string | null,
  isBlockAmount: BlockAmountMatcher
): PlanAttribution {
  const scope: "subject" | "all" = subjectId === null ? "all" : "subject";

  // Block first. A block sale is larger than every per-device plan, so testing
  // the plans first would file it under whichever one it happens to clear.
  if (isBlockAmount(amountCentavos, scope)) {
    return { bucket: "block", match: "block" };
  }

  // Scope decides which plans are even possible: a row with no subject can
  // only be the whole-year plan, and a subject row can only be a subject plan.
  const candidates: PlanKey[] =
    subjectId === null ? ["year_sem"] : ["subject_month", "subject_sem"];

  for (const plan of candidates) {
    if (PLANS[plan].amount === amountCentavos) return { bucket: plan, match: "exact" };
  }

  const cleared = candidates
    .filter((plan) => amountCentavos > PLANS[plan].amount)
    .sort((a, b) => PLANS[b].amount - PLANS[a].amount)[0];
  if (cleared) return { bucket: cleared, match: "over" };

  return { bucket: "unattributed", match: "none" };
}

export interface PlanRevenue {
  bucket: PlanBucket;
  revenuePesos: number;
  payments: number;
}

export function revenueByPlan(
  rows: { amount: number; subject_id: string | null }[],
  isBlockAmount: BlockAmountMatcher
): PlanRevenue[] {
  const centavos = new Map<PlanBucket, { centavos: number; payments: number }>(
    PLAN_BUCKETS.map((bucket) => [bucket, { centavos: 0, payments: 0 }])
  );

  for (const row of rows) {
    const { bucket } = attributePlan(row.amount, row.subject_id, isBlockAmount);
    const acc = centavos.get(bucket);
    // Every bucket is pre-seeded, so this cannot miss — but a defensive skip
    // here would silently drop money, which is the one thing that must not
    // happen. Fail loudly instead.
    if (!acc) throw new Error(`unknown plan bucket: ${bucket}`);
    acc.centavos += row.amount;
    acc.payments += 1;
  }

  // Divide once at the end so centavos stay integers while summing — the same
  // discipline revenueByMonth uses.
  return PLAN_BUCKETS.map((bucket) => {
    const acc = centavos.get(bucket)!;
    return {
      bucket,
      revenuePesos: pesosFromCentavos(acc.centavos),
      payments: acc.payments,
    };
  });
}

// ── Unit economics ──────────────────────────────────────────────────────────

export function arpu(revenuePesos: number, payingDevices: number): number | null {
  if (payingDevices <= 0) return null;
  return round2(revenuePesos / payingDevices);
}

export interface LtvObservation {
  pesos: number | null;
  paymentsPerPayingDevice: number | null;
  /**
   * True while no device has paid twice. LTV is then arithmetically identical
   * to ARPU, and reporting them as two numbers implies a second source that
   * does not exist. LEDGER must say so rather than quote both.
   */
  indistinguishableFromArpu: boolean;
}

export function observedLtv(
  revenuePesos: number,
  payingDevices: number,
  payments: number
): LtvObservation {
  if (payingDevices <= 0) {
    return {
      pesos: null,
      paymentsPerPayingDevice: null,
      indistinguishableFromArpu: true,
    };
  }
  return {
    pesos: round2(revenuePesos / payingDevices),
    paymentsPerPayingDevice: round2(payments / payingDevices),
    indistinguishableFromArpu: payments <= payingDevices,
  };
}

export type CacBasis = "zero-spend" | "computed" | "no-acquisitions";

export interface AcquisitionCost {
  pesos: number | null;
  basis: CacBasis;
}

/**
 * The sentence LEDGER must write whenever CAC is zero. Exported as a constant
 * rather than left to the agent's phrasing, because "CAC is zero" read on its
 * own is a claim about efficiency, and it is not one.
 */
export const ZERO_CAC_DISCLAIMER =
  "CAC is zero because no money is spent on acquisition, not because acquisition is efficient. " +
  "Distribution is organic; the number says nothing about how well it works.";

export function acquisitionCost(
  spendPesos: number,
  newPayingDevices: number
): AcquisitionCost {
  if (spendPesos === 0) return { pesos: 0, basis: "zero-spend" };
  if (newPayingDevices <= 0) return { pesos: null, basis: "no-acquisitions" };
  return { pesos: round2(spendPesos / newPayingDevices), basis: "computed" };
}

export function paybackMonths(
  cacPesos: number | null,
  monthlyArpuPesos: number | null
): number | null {
  if (cacPesos === null || monthlyArpuPesos === null) return null;
  if (cacPesos === 0) return 0; // nothing to pay back
  if (monthlyArpuPesos <= 0) return null;
  return round2(cacPesos / monthlyArpuPesos);
}

export interface PaybackModel {
  cacPesos: number | null;
  months: number | null;
  assumptions: string[];
}

/**
 * What payback becomes if acquisition spend starts. Kept separate from the
 * measured `paybackMonths` so a hypothetical can never be mistaken for a
 * reading — this belongs in prose and in `raw`, never in a metrics row.
 */
export function modelPayback(
  hypotheticalSpendPesos: number,
  hypotheticalNewPayingDevices: number,
  monthlyArpuPesos: number | null
): PaybackModel {
  const cac = acquisitionCost(hypotheticalSpendPesos, hypotheticalNewPayingDevices);
  return {
    cacPesos: cac.pesos,
    months: paybackMonths(cac.pesos, monthlyArpuPesos),
    assumptions: [
      "Spend and acquisitions are hypothetical; no acquisition money has been spent.",
      "Monthly ARPU is held at its observed value, which is measured over a period with no paid acquisition in it.",
      "Assumes paid acquisition converts at the same rate as organic, which is the assumption most likely to be wrong.",
    ],
  };
}

// ── Scenario modelling ──────────────────────────────────────────────────────

export const SCENARIO_MULTIPLIERS: readonly number[] = [2, 5, 10] as const;

export interface Scenario {
  multiplier: number;
  revenuePesos: number;
  assumptions: string[];
}

const SCENARIO_ASSUMPTIONS = [
  "Conversion is the only variable. Price points and plan mix are held at the baseline month's.",
  "No discounting, no new plan, and no change in what is sold.",
  "Cost of operation is held flat. The free-tier ceiling is a separate row and is not modelled here.",
  "This is a sensitivity, not a forecast. It says what the money would be at that multiple, not whether the multiple is reachable.",
];

export function scenarios(
  baseline: { month: string; revenuePesos: number; complete: boolean },
  multipliers: readonly number[] = SCENARIO_MULTIPLIERS
): Scenario[] {
  if (!baseline.complete) {
    throw new Error(
      `Refusing to model scenarios from ${baseline.month}, which is incomplete. ` +
        `Multiplying a partial month projects a partial month, and the result ` +
        `looks like a full one. Pass the last complete month.`
    );
  }

  return multipliers.map((multiplier) => ({
    multiplier,
    revenuePesos: round2(baseline.revenuePesos * multiplier),
    // Copied per scenario on purpose: the assumptions travel with the number
    // wherever it is quoted, including when only the 10x line is quoted.
    assumptions: [...SCENARIO_ASSUMPTIONS],
  }));
}

// ── Month-over-month ────────────────────────────────────────────────────────

export interface AnnotatedMonth {
  month: string; // "YYYY-MM", Manila calendar
  revenuePesos: number;
  payments: number;
  /** False only for the month currently running. */
  complete: boolean;
  /** Present only on the incomplete month: how far through it we are. */
  dayOfMonth?: number;
  daysInMonth?: number;
}

/**
 * Marks the running month so it can never be compared against a finished one.
 * Completeness is decided by the month key rather than by array position, so
 * it stays right whatever order the caller passes.
 */
export function annotateMonths(months: MonthlyRevenue[], now: Date): AnnotatedMonth[] {
  const currentKey = phMonthKey(now);

  return months.map((month) => {
    const complete = month.month !== currentKey;
    return {
      month: month.month,
      // Already pesos. revenueByMonth divided by 100 before returning.
      revenuePesos: month.revenue,
      payments: month.payments,
      complete,
      ...(complete
        ? {}
        : { dayOfMonth: phDayOfMonth(now), daysInMonth: phDaysInMonth(now) }),
    };
  });
}

export function completeMonths(months: AnnotatedMonth[]): AnnotatedMonth[] {
  return months.filter((month) => month.complete);
}

export interface MonthDelta {
  from: string;
  to: string;
  deltaPesos: number;
}

/**
 * The month-over-month move, computed across complete months only. Returns
 * null rather than reaching for the running month when there is only one
 * finished month to look at.
 */
export function completeMonthDelta(months: AnnotatedMonth[]): MonthDelta | null {
  const finished = completeMonths(months);
  if (finished.length < 2) return null;

  // Input is newest first, so index 0 is the most recently finished month.
  const [latest, previous] = finished;
  return {
    from: previous.month,
    to: latest.month,
    deltaPesos: round2(latest.revenuePesos - previous.revenuePesos),
  };
}
