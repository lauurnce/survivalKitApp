/**
 * Reconciles entitlement against money.
 *
 * `payments` records money received. `subscriptions` and `classes` record
 * access granted. Every row in one should have a partner in the other, and
 * where it does not, exactly one of two opposite things is true: someone was
 * deliberately given access without paying, or a webhook wrote entitlement
 * without recording money. Counting the gap is useless — the whole value of
 * this module is that it CLASSIFIES and NAMES each exception, so the report
 * arrives with the looking-up already done.
 *
 * THREE THINGS ABOUT THE MATCHING ARE NOT OBVIOUS.
 *
 * 1. Link id alone is not a sufficient join. recordPayment (lib/payments.ts)
 *    OVERWRITES subscriptions.paymongo_link_id when a device pays again for
 *    the same year and subject, so an earlier payment's link id appears on no
 *    subscription row. A link-id-only join reports that renewal as money with
 *    nothing granted — a P0 by the Finance escalation list — when nothing is
 *    wrong. The fallback is the subscription's natural key, the same tuple
 *    subscriptions_device_year_subject_uidx enforces.
 *
 * 2. Locally-minted link ids are named, not excused. 20260716000000_classes.sql
 *    documents 'block-<uuid>' as a placeholder for a manually-generated link.
 *    The classifier recognises an explicit list of OUR prefixes and treats
 *    everything else as an unverifiable gateway id. That direction fails safe:
 *    an unrecognised id is surfaced rather than quietly forgiven. It never
 *    asserts a "link_" prefix — no production link id was ever read, and the
 *    PayMongo secret in .env.reports.local is the literal string [SENSITIVE].
 *
 * 3. The known-exception register ships EMPTY. Comped access should stop being
 *    re-reported every month, but only once someone has written down why.
 *
 * THE AXES ARE INDEPENDENT. A payment can be both unmatched and at a price we
 * do not sell, and it produces one exception on each axis. Conservation holds
 * per axis: every payment appears exactly once on the matching axis and every
 * entitlement exactly once on the entitlement axis. Nothing is dropped.
 *
 * DISCLOSURE: exceptions carry device ids, link ids and amounts. They belong
 * in docs/reports/finance/.data/, which is gitignored, and nowhere else.
 */

import { attributePlan, type BlockAmountMatcher } from "./unitEconomics";

// ── Row shapes, as the collector reads them ─────────────────────────────────

export interface PaymentRow {
  id: string;
  paymongo_link_id: string;
  device_id: string;
  year_id: string;
  subject_id: string | null;
  amount: number; // centavos
  paid_at: string;
}

export interface SubscriptionRow {
  id: string;
  paymongo_link_id: string;
  device_id: string;
  year_id: string;
  subject_id: string | null;
  status: string;
  current_period_end: string;
  created_at: string;
}

export interface ClassRow {
  id: string;
  code: string;
  paymongo_link_id: string;
  rep_device_id: string;
  year_id: string;
  subject_id: string | null;
  seat_cap: number;
  status: string;
  current_period_end: string;
  created_at: string;
}

/** Subscriptions and classes normalised into one shape. */
export interface Entitlement {
  kind: "subscription" | "class";
  id: string;
  linkId: string;
  /** For a class this is the rep — the device that actually paid. */
  deviceId: string;
  yearId: string;
  subjectId: string | null;
  status: string;
  currentPeriodEnd: string;
  createdAt: string;
}

// ── Link id classification ──────────────────────────────────────────────────

/**
 * Prefixes this codebase mints itself. Everything not on this list is treated
 * as a gateway id we cannot verify — which is the safe direction, because an
 * unrecognised id then gets named instead of excused.
 */
export const LOCALLY_MINTED_PREFIXES = ["block-", "comp-", "manual-"] as const;

export type LinkIdClass = "block-placeholder" | "comped" | "manual" | "gateway";

export function classifyLinkId(linkId: string): LinkIdClass {
  if (linkId.startsWith("block-")) return "block-placeholder";
  if (linkId.startsWith("comp-")) return "comped";
  if (linkId.startsWith("manual-")) return "manual";
  return "gateway";
}

/**
 * The subscription uniqueness tuple, as a string. Mirrors
 * subscriptions_device_year_subject_uidx: the year plan collapses onto the
 * 'year' sentinel so a NULL subject is comparable.
 */
export function naturalKey(row: {
  device_id: string;
  year_id: string;
  subject_id: string | null;
}): string {
  return `${row.device_id}|${row.year_id}|${row.subject_id ?? "year"}`;
}

// ── The known-exception register ────────────────────────────────────────────

export interface KnownException {
  /** The entitlement's paymongo_link_id. */
  linkId: string;
  /** Why this entitlement legitimately has no payment row. Required. */
  reason: string;
  /** YYYY-MM-DD the exception was accepted. Required. */
  since: string;
}

/**
 * Owner-maintained. SHIPS EMPTY on purpose: an empty register means nothing is
 * excused by default, so the first month's report has to look at every
 * unmatched entitlement rather than inheriting someone's assumption. Adding an
 * entry is a deliberate act that costs one line and a sentence of reasoning —
 * the same shape as an ACCEPTED finding, and for the same reason.
 */
export const KNOWN_EXCEPTIONS: readonly KnownException[] = [];

// ── Exceptions ──────────────────────────────────────────────────────────────

export type ExceptionKind =
  | "entitlement-without-payment"
  | "entitlement-locally-minted"
  | "entitlement-known-exception"
  | "payment-without-entitlement"
  | "amount-not-attributable"
  | "duplicate-entitlement"
  | "grant-device-mismatch";

/** Fixed order so the summary's row set never changes shape between runs. */
export const EXCEPTION_KINDS: readonly ExceptionKind[] = [
  "entitlement-without-payment",
  "entitlement-locally-minted",
  "entitlement-known-exception",
  "payment-without-entitlement",
  "amount-not-attributable",
  "duplicate-entitlement",
  "grant-device-mismatch",
] as const;

/**
 * The two kinds nothing explains. Everything else on the matching axis has a
 * documented cause; these two are the ones the escalation list is about.
 */
export const UNRECONCILED_KINDS: readonly ExceptionKind[] = [
  "entitlement-without-payment",
  "payment-without-entitlement",
] as const;

export interface LedgerException {
  kind: ExceptionKind;
  /** The link id that ties this exception back to a real row. */
  linkId: string;
  deviceId: string;
  yearId: string;
  subjectId: string | null;
  /** Present when money is involved; null when the exception is about a grant. */
  amountCentavos: number | null;
  /** paid_at, or the entitlement's created_at. */
  occurredAt: string;
  /** Written for a human. A kind on its own is not a finding. */
  reason: string;
}

export interface MatchedPair {
  paymentId: string;
  entitlementId: string;
  entitlementKind: Entitlement["kind"];
  via: "link-id" | "natural-key";
}

export interface ReconcileInput {
  payments: PaymentRow[];
  subscriptions: SubscriptionRow[];
  classes: ClassRow[];
  isBlockAmount: BlockAmountMatcher;
  register?: readonly KnownException[];
}

export interface ReconcileResult {
  matched: MatchedPair[];
  exceptions: LedgerException[];
  counts: {
    payments: number;
    entitlements: number;
    matchedDirect: number;
    matchedByRenewal: number;
  };
}

function toEntitlements(input: ReconcileInput): Entitlement[] {
  return [
    ...input.subscriptions.map((row): Entitlement => ({
      kind: "subscription",
      id: row.id,
      linkId: row.paymongo_link_id,
      deviceId: row.device_id,
      yearId: row.year_id,
      subjectId: row.subject_id,
      status: row.status,
      currentPeriodEnd: row.current_period_end,
      createdAt: row.created_at,
    })),
    ...input.classes.map((row): Entitlement => ({
      kind: "class",
      id: row.id,
      linkId: row.paymongo_link_id,
      // The rep is who paid. Members join for free against the rep's purchase.
      deviceId: row.rep_device_id,
      yearId: row.year_id,
      subjectId: row.subject_id,
      status: row.status,
      currentPeriodEnd: row.current_period_end,
      createdAt: row.created_at,
    })),
  ];
}

export function reconcile(input: ReconcileInput): ReconcileResult {
  const register = input.register ?? KNOWN_EXCEPTIONS;
  const registered = new Map(register.map((entry) => [entry.linkId, entry]));

  const entitlements = toEntitlements(input);
  const matched: MatchedPair[] = [];
  const exceptions: LedgerException[] = [];

  const paymentsByLinkId = new Map(
    input.payments.map((row) => [row.paymongo_link_id, row])
  );
  const entitlementsByLinkId = new Map(
    entitlements.map((entitlement) => [entitlement.linkId, entitlement])
  );
  const entitlementsByNaturalKey = new Map<string, Entitlement[]>();
  for (const entitlement of entitlements) {
    const key = naturalKey({
      device_id: entitlement.deviceId,
      year_id: entitlement.yearId,
      subject_id: entitlement.subjectId,
    });
    entitlementsByNaturalKey.set(key, [
      ...(entitlementsByNaturalKey.get(key) ?? []),
      entitlement,
    ]);
  }

  // ── Entitlement axis: every entitlement lands in exactly one bucket ──
  let matchedDirect = 0;
  for (const entitlement of entitlements) {
    const payment = paymentsByLinkId.get(entitlement.linkId);

    if (payment) {
      matchedDirect += 1;
      matched.push({
        paymentId: payment.id,
        entitlementId: entitlement.id,
        entitlementKind: entitlement.kind,
        via: "link-id",
      });

      // Integrity, not matching: the grant went somewhere the money did not.
      if (payment.device_id !== entitlement.deviceId) {
        exceptions.push({
          kind: "grant-device-mismatch",
          linkId: entitlement.linkId,
          deviceId: entitlement.deviceId,
          yearId: entitlement.yearId,
          subjectId: entitlement.subjectId,
          amountCentavos: payment.amount,
          occurredAt: entitlement.createdAt,
          reason:
            `The ${entitlement.kind} on device ${entitlement.deviceId} was granted ` +
            `against a payment made by device ${payment.device_id}. One device paid ` +
            `and a different one was given access.`,
        });
      }
      continue;
    }

    const known = registered.get(entitlement.linkId);
    if (known) {
      exceptions.push({
        kind: "entitlement-known-exception",
        linkId: entitlement.linkId,
        deviceId: entitlement.deviceId,
        yearId: entitlement.yearId,
        subjectId: entitlement.subjectId,
        amountCentavos: null,
        occurredAt: entitlement.createdAt,
        reason: `Accepted ${known.since}: ${known.reason}`,
      });
      continue;
    }

    const linkClass = classifyLinkId(entitlement.linkId);
    if (linkClass !== "gateway") {
      exceptions.push({
        kind: "entitlement-locally-minted",
        linkId: entitlement.linkId,
        deviceId: entitlement.deviceId,
        yearId: entitlement.yearId,
        subjectId: entitlement.subjectId,
        amountCentavos: null,
        occurredAt: entitlement.createdAt,
        reason:
          `${entitlement.kind} carries a locally-minted ${linkClass} link id, so it ` +
          `was granted by hand and has no ledger row by design. Confirm it was ` +
          `intended, then add it to KNOWN_EXCEPTIONS so it stops recurring.`,
      });
      continue;
    }

    exceptions.push({
      kind: "entitlement-without-payment",
      linkId: entitlement.linkId,
      deviceId: entitlement.deviceId,
      yearId: entitlement.yearId,
      subjectId: entitlement.subjectId,
      amountCentavos: null,
      occurredAt: entitlement.createdAt,
      reason:
        `${entitlement.kind} ${entitlement.id} carries a gateway link id with no ` +
        `payments row. Either it was comped without being recorded, or entitlement ` +
        `was written without money. Resolve which before next month.`,
    });
  }

  // ── Matching axis: every payment lands in exactly one bucket ──
  let matchedByRenewal = 0;
  for (const payment of input.payments) {
    if (entitlementsByLinkId.has(payment.paymongo_link_id)) continue; // counted above

    const siblings = entitlementsByNaturalKey.get(naturalKey(payment)) ?? [];
    const renewalTarget = siblings[0];
    if (renewalTarget) {
      // recordPayment overwrote the entitlement's link id on a later payment.
      // Legitimate, and emphatically not money-without-entitlement.
      matchedByRenewal += 1;
      matched.push({
        paymentId: payment.id,
        entitlementId: renewalTarget.id,
        entitlementKind: renewalTarget.kind,
        via: "natural-key",
      });
      continue;
    }

    exceptions.push({
      kind: "payment-without-entitlement",
      linkId: payment.paymongo_link_id,
      deviceId: payment.device_id,
      yearId: payment.year_id,
      subjectId: payment.subject_id,
      amountCentavos: payment.amount,
      occurredAt: payment.paid_at,
      reason:
        `Payment ${payment.id} has no subscription or class, by link id or by ` +
        `device/year/subject. Money was received and nothing was granted — this is ` +
        `a paying user who may be locked out right now.`,
    });
  }

  // ── Amount axis ──
  for (const payment of input.payments) {
    const { bucket } = attributePlan(
      payment.amount,
      payment.subject_id,
      input.isBlockAmount
    );
    if (bucket !== "unattributed") continue;

    exceptions.push({
      kind: "amount-not-attributable",
      linkId: payment.paymongo_link_id,
      deviceId: payment.device_id,
      yearId: payment.year_id,
      subjectId: payment.subject_id,
      amountCentavos: payment.amount,
      occurredAt: payment.paid_at,
      reason:
        `Payment ${payment.id} is at an amount no current plan or block price ` +
        `explains. Either a price changed without the ledger being re-read, or a ` +
        `link was minted by hand at a custom amount.`,
    });
  }

  // ── Integrity axis: duplicates ──
  for (const [key, group] of entitlementsByNaturalKey) {
    if (group.length < 2) continue;
    for (const entitlement of group) {
      exceptions.push({
        kind: "duplicate-entitlement",
        linkId: entitlement.linkId,
        deviceId: entitlement.deviceId,
        yearId: entitlement.yearId,
        subjectId: entitlement.subjectId,
        amountCentavos: null,
        occurredAt: entitlement.createdAt,
        reason:
          `${group.length} entitlements share the key ${key}. ` +
          `subscriptions_device_year_subject_uidx should make this impossible for ` +
          `subscriptions, so either the index is gone or a class overlaps a ` +
          `subscription.`,
      });
    }
  }

  return {
    matched,
    exceptions,
    counts: {
      payments: input.payments.length,
      entitlements: entitlements.length,
      matchedDirect,
      matchedByRenewal,
    },
  };
}

export interface ExceptionSummary {
  byKind: Record<ExceptionKind, number>;
  /** The two kinds nothing explains. This is the number that escalates. */
  unreconciled: number;
  /** Money sitting behind payments that granted nothing. */
  unmatchedPaymentCentavos: number;
}

export function summariseExceptions(
  exceptions: LedgerException[]
): ExceptionSummary {
  const byKind = Object.fromEntries(
    EXCEPTION_KINDS.map((kind) => [kind, 0])
  ) as Record<ExceptionKind, number>;

  let unmatchedPaymentCentavos = 0;
  for (const exception of exceptions) {
    byKind[exception.kind] += 1;
    if (exception.kind === "payment-without-entitlement") {
      unmatchedPaymentCentavos += exception.amountCentavos ?? 0;
    }
  }

  return {
    byKind,
    unreconciled: UNRECONCILED_KINDS.reduce((sum, kind) => sum + byKind[kind], 0),
    unmatchedPaymentCentavos,
  };
}
