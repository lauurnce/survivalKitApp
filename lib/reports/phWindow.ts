/**
 * Asia/Manila window boundaries for finance reporting.
 *
 * Month boundaries decide which month a payment's revenue lands in. An
 * off-by-eight-hours boundary silently moves revenue between months, and the
 * month-over-month comparison built on top of it is then confidently wrong —
 * worse than having no comparison at all.
 *
 * The Philippines has no daylight saving, so a fixed +8h offset is exact.
 * PH_OFFSET_MS is imported from lib/payments.ts rather than redeclared so
 * `revenueByMonth` and these helpers can never disagree about what a Manila
 * month is.
 *
 * The technique throughout: shift the instant by +8h and then read UTC fields
 * off the shifted value. The shifted Date is a Manila wall clock wearing a UTC
 * costume — never format it or hand it to anything that treats it as a real
 * instant.
 */

import { PH_OFFSET_MS } from "../payments";

/** "YYYY-MM" for the Manila calendar month containing `now`. */
export function phMonthKey(now: Date): string {
  return new Date(now.getTime() + PH_OFFSET_MS).toISOString().slice(0, 7);
}

/** The real UTC instant at which the Manila calendar month began. */
export function phMonthStartUtc(now: Date): Date {
  const ph = new Date(now.getTime() + PH_OFFSET_MS);
  return new Date(
    Date.UTC(ph.getUTCFullYear(), ph.getUTCMonth(), 1) - PH_OFFSET_MS
  );
}

/** Day of the Manila month, 1-based. */
export function phDayOfMonth(now: Date): number {
  return new Date(now.getTime() + PH_OFFSET_MS).getUTCDate();
}

/** Days in the Manila month containing `now`. Day 0 of the next month. */
export function phDaysInMonth(now: Date): number {
  const ph = new Date(now.getTime() + PH_OFFSET_MS);
  return new Date(
    Date.UTC(ph.getUTCFullYear(), ph.getUTCMonth() + 1, 0)
  ).getUTCDate();
}

/** `days` whole days before `now`. Timezone-free — a duration, not a date. */
export function daysAgo(now: Date, days: number): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

/**
 * Half-open window test: `from` inclusive, `to` exclusive, so two adjacent
 * windows can never both claim the same payment. An unparseable timestamp is
 * outside every window rather than an exception — a malformed row must not
 * take the whole collector down.
 */
export function inWindow(iso: string, from: Date, to: Date): boolean {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return t >= from.getTime() && t < to.getTime();
}
