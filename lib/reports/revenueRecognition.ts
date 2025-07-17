/**
 * Earned versus deferred revenue, and the expiry schedule behind it.
 *
 * Recognition is straight-line between paid_at and the entitlement's
 * current_period_end; a renewal that overwrites a period counts that period
 * as fully earned rather than deferred. `semesterPlanParity` below guards a
 * pricing edge case near a term's access end (lib/terms.ts). Full rationale, including the exact
 * mechanics of both:
 * docs/reports/finance/billing-edge-cases.md (gitignored).
 */

import { periodEndFor } from "../paymongo";
import { daysUntilScheduleEnds, scheduleHorizon, termForPurchase } from "../terms";
import { PH_OFFSET_MS } from "../payments";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface RecognitionInput {
  amountCentavos: number;
  paidAt: string;
  /** The entitlement's current_period_end. Null when nothing granted. */
  periodEnd: string | null;
  asOf: Date;
  /** True when a later payment overwrote this entitlement's period. */
  superseded?: boolean;
}

export interface Recognition {
  earnedCentavos: number;
  deferredCentavos: number;
  /** 0 to 1, clamped. Always finite. */
  fractionElapsed: number;
  basis: "straight-line" | "fully-earned" | "no-period";
}

function fullyEarned(
  amountCentavos: number,
  basis: Recognition["basis"]
): Recognition {
  return {
    earnedCentavos: amountCentavos,
    deferredCentavos: 0,
    fractionElapsed: 1,
    basis,
  };
}

export function recognise(input: RecognitionInput): Recognition {
  const { amountCentavos, superseded = false } = input;

  if (superseded) return fullyEarned(amountCentavos, "fully-earned");

  // No period means no entitlement was found for this payment. That row is
  // already being reported as a `payment-without-entitlement` exception at a
  // higher severity; counting it as deferred as well would inflate the
  // liability with money that is being escalated on another axis.
  if (input.periodEnd === null) return fullyEarned(amountCentavos, "no-period");

  const paid = Date.parse(input.paidAt);
  const end = Date.parse(input.periodEnd);
  if (!Number.isFinite(paid) || !Number.isFinite(end)) {
    return fullyEarned(amountCentavos, "no-period");
  }

  const span = end - paid;
  if (span <= 0) return fullyEarned(amountCentavos, "fully-earned");

  const elapsed = input.asOf.getTime() - paid;
  const fractionElapsed = Math.min(1, Math.max(0, elapsed / span));
  const earnedCentavos = Math.round(amountCentavos * fractionElapsed);

  return {
    earnedCentavos,
    deferredCentavos: amountCentavos - earnedCentavos,
    fractionElapsed,
    basis: "straight-line",
  };
}

export interface LedgerRecognition {
  earnedCentavos: number;
  deferredCentavos: number;
  /** Rows whose period was destroyed by a renewal. Qualifies `deferred`. */
  supersededCount: number;
  /** Rows with no entitlement to take a period from. Also qualifies it. */
  noPeriodCount: number;
  rows: number;
}

export function recogniseLedger(
  rows: Omit<RecognitionInput, "asOf">[],
  asOf: Date
): LedgerRecognition {
  const totals: LedgerRecognition = {
    earnedCentavos: 0,
    deferredCentavos: 0,
    supersededCount: 0,
    noPeriodCount: 0,
    rows: rows.length,
  };

  for (const row of rows) {
    const recognition = recognise({ ...row, asOf });
    totals.earnedCentavos += recognition.earnedCentavos;
    totals.deferredCentavos += recognition.deferredCentavos;
    if (row.superseded) totals.supersededCount += 1;
    if (recognition.basis === "no-period") totals.noPeriodCount += 1;
  }

  return totals;
}

// ── The term schedule ───────────────────────────────────────────────────────

export interface SemesterEndStatus {
  /** Term a semester pass bought now belongs to; null once the schedule ran out. */
  termId: string | null;
  /** Access end a semester pass bought now gets (the schedule horizon once it ran out). */
  semesterEndIso: string;
  daysRemaining: number;
  /** Days until the last scheduled term ends. lib/terms.test.ts fails at 30. */
  scheduleDaysRemaining: number;
  /** True once no term covers `now`: semester buyers are on the 31-day fallback. */
  past: boolean;
}

export function semesterEndStatus(now: Date): SemesterEndStatus {
  const term = termForPurchase(now);
  const end = term ? new Date(term.accessEndsAt) : scheduleHorizon();
  const remainingMs = end.getTime() - now.getTime();
  return {
    termId: term?.id ?? null,
    semesterEndIso: end.toISOString(),
    daysRemaining: Math.floor(remainingMs / DAY_MS),
    scheduleDaysRemaining: daysUntilScheduleEnds(now),
    past: term === null,
  };
}

export interface PlanParity {
  /** True when the semester plan and the month plan grant the same period. */
  identical: boolean;
  semesterPlanEndIso: string;
  monthPlanEndIso: string;
  /** Days until the two collapse. Zero once they already have. */
  daysUntilParity: number;
}

/**
 * Guards a pricing edge case near a term's access end — see
 * docs/reports/finance/billing-edge-cases.md for the exact mechanics. With a
 * term cutoff a month before each end this should only fire late in a short
 * term (midyear) or once the schedule has run out.
 */
export function semesterPlanParity(now: Date): PlanParity {
  const semesterPlanEnd = periodEndFor("subject_sem", now);
  const monthPlanEnd = periodEndFor("subject_month", now);
  const identical = semesterPlanEnd.getTime() === monthPlanEnd.getTime();

  const term = termForPurchase(now);
  const remainingMs = term ? new Date(term.accessEndsAt).getTime() - now.getTime() : 0;
  const daysUntilParity = identical
    ? 0
    : Math.max(0, Math.floor((remainingMs - 31 * DAY_MS) / DAY_MS));

  return {
    identical,
    semesterPlanEndIso: semesterPlanEnd.toISOString(),
    monthPlanEndIso: monthPlanEnd.toISOString(),
    daysUntilParity,
  };
}

// ── Expiry and revenue at risk ──────────────────────────────────────────────

export const EXPIRY_BUCKETS = ["expired", "<=7d", "<=30d", "<=90d", "beyond"] as const;
export type ExpiryBucket = (typeof EXPIRY_BUCKETS)[number];

export interface ExpiringEntitlement {
  id: string;
  currentPeriodEnd: string;
  status: string;
  /** From the payment that granted it. Null when no payment was matched. */
  amountCentavos: number | null;
}

export interface ExpiryBucketRow {
  label: ExpiryBucket;
  count: number;
  revenueAtRiskCentavos: number;
  /** How many of `count` had no matched payment, so contributed no money. */
  unpricedCount: number;
}

export interface ExpiryCluster {
  /** Manila calendar date the entitlements lapse on. */
  phDate: string;
  count: number;
  revenueAtRiskCentavos: number;
}

export interface ExpirySchedule {
  buckets: ExpiryBucketRow[];
  /** Busiest expiry dates, most crowded first. */
  clusters: ExpiryCluster[];
  /** Largest cluster as a share of all active entitlements. 0 when empty. */
  concentration: number;
}

function bucketFor(daysAway: number): ExpiryBucket {
  if (daysAway < 0) return "expired";
  if (daysAway <= 7) return "<=7d";
  if (daysAway <= 30) return "<=30d";
  if (daysAway <= 90) return "<=90d";
  return "beyond";
}

function phCalendarDate(iso: string): string {
  return new Date(Date.parse(iso) + PH_OFFSET_MS).toISOString().slice(0, 10);
}

export function expirySchedule(
  entitlements: ExpiringEntitlement[],
  now: Date
): ExpirySchedule {
  const buckets = new Map<ExpiryBucket, ExpiryBucketRow>(
    EXPIRY_BUCKETS.map((label) => [
      label,
      { label, count: 0, revenueAtRiskCentavos: 0, unpricedCount: 0 },
    ])
  );
  const clusters = new Map<string, ExpiryCluster>();

  // Only live entitlements are at risk. A cancelled row has already lapsed as
  // far as revenue is concerned, and counting it would double-count the loss.
  const active = entitlements.filter((entitlement) => entitlement.status === "active");

  for (const entitlement of active) {
    const daysAway = Math.floor(
      (Date.parse(entitlement.currentPeriodEnd) - now.getTime()) / DAY_MS
    );
    const row = buckets.get(bucketFor(daysAway))!;
    row.count += 1;
    if (entitlement.amountCentavos === null) row.unpricedCount += 1;
    row.revenueAtRiskCentavos += entitlement.amountCentavos ?? 0;

    // Manila day, not UTC: semester access clusters on an academic date, and
    // that date is a Philippine one. Grouping in UTC splits a single cluster
    // across two days for everything expiring after 16:00 UTC.
    const day = phCalendarDate(entitlement.currentPeriodEnd);
    const cluster = clusters.get(day) ?? {
      phDate: day,
      count: 0,
      revenueAtRiskCentavos: 0,
    };
    cluster.count += 1;
    cluster.revenueAtRiskCentavos += entitlement.amountCentavos ?? 0;
    clusters.set(day, cluster);
  }

  const ordered = [...clusters.values()].sort((a, b) => b.count - a.count);

  return {
    buckets: EXPIRY_BUCKETS.map((label) => buckets.get(label)!),
    clusters: ordered,
    concentration: active.length > 0 ? (ordered[0]?.count ?? 0) / active.length : 0,
  };
}
