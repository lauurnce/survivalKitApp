// Pricing formula — MUST match app/api/class/checkout/route.ts exactly
// (that route is the source of truth; this is the client-side preview).
export const BASE_SUBJECT = 799;
export const BASE_ALL = 999;
export const PER_SEAT = 59;
export const INCLUDED_SEATS = 11;
export const MIN_SEATS = 11;
export const MAX_SEATS = 55;

export interface PriceBreakdown {
  base: number;
  extraSeats: number;
  extra: number;
  total: number;
  perHead: number;
}

export function computePrice(scope: "subject" | "all", seats: number): PriceBreakdown {
  const base = scope === "all" ? BASE_ALL : BASE_SUBJECT;
  const extraSeats = Math.max(0, seats - INCLUDED_SEATS);
  const extra = extraSeats * PER_SEAT;
  const total = base + extra;
  return { base, extraSeats, extra, total, perHead: total / seats };
}
