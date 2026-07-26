// Pricing formula — this is the client-side preview, in pesos.
// app/api/class/checkout/route.ts is the source of truth and prices the link
// in centavos; app/api/webhooks/paymongo/route.ts recomputes the same formula
// a third time to verify the amount actually paid. Change one, change all three.
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
