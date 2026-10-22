/**
 * Zero-amount ledger detection for the ops (PULSE) collector.
 *
 * A feedback coupon that covers a plan in full unlocks it with no PayMongo
 * charge: /api/subscribe writes a `payments` row with `amount = 0` and
 * `paymongo_link_id = 'coupon:<code>'`. Each one is real access granted for
 * free. A handful a week is the coupon programme working; a burst means a
 * coupon leak, a validation regression, or someone farming feedback for
 * codes — and it shows nowhere in revenue, because zero adds nothing.
 *
 * Counts only, never rows: the collector uses head:true count queries, so
 * nothing here ever sees a device id, user id, or coupon code.
 */

import type { Metric } from "./metrics";

/** Prefix /api/subscribe stamps on a free unlock's ledger link id. */
export const COUPON_LINK_PREFIX = "coupon:";

export const ZERO_AMOUNT_WINDOW_DAYS = 7;

/** More than this many free unlocks in the window flags the row. */
export const ZERO_AMOUNT_WEEKLY_THRESHOLD = 3;

export interface ZeroAmountCounts {
  /** Null when the count could not be read. */
  lastWindow: number | null;
  allTime: number | null;
}

export interface ZeroAmountSignal extends ZeroAmountCounts {
  threshold: number;
  windowDays: number;
  /** Null when the windowed count is unknown — never a guessed "ok". */
  flagged: boolean | null;
}

export function zeroAmountSignal(counts: ZeroAmountCounts): ZeroAmountSignal {
  return {
    ...counts,
    threshold: ZERO_AMOUNT_WEEKLY_THRESHOLD,
    windowDays: ZERO_AMOUNT_WINDOW_DAYS,
    flagged:
      counts.lastWindow === null ? null : counts.lastWindow > ZERO_AMOUNT_WEEKLY_THRESHOLD,
  };
}

/** Rows for the PULSE health table. Labels are stable across runs. */
export function zeroAmountMetrics(signal: ZeroAmountSignal): Metric[] {
  return [
    { label: `Free coupon unlocks ${signal.windowDays}d`, value: signal.lastWindow },
    { label: "Free coupon unlocks total", value: signal.allTime },
    {
      label: `Free unlocks >${signal.threshold}/${signal.windowDays}d`,
      value: signal.flagged === null ? null : signal.flagged ? "FLAG" : "ok",
    },
  ];
}
