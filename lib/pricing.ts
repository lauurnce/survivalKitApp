import { PLANS, type PlanKey } from "./paymongo";

// Display-side view of the plan table for surfaces that quote a "from" price
// (the paywall teaser). Every amount comes from PLANS — nothing here restates a
// number — so a price change in lib/paymongo.ts reaches the teaser without a
// second edit. Server-only, like lib/paymongo.ts itself (node:crypto): server
// pages compute the price here and hand the plain strings to client components.

// What each single-subject plan buys, phrased to follow "unlocks every
// reviewer in <subject> …". year_sem is absent: the teaser sits on one subject,
// so its relevant floor is a subject plan.
const SUBJECT_PLAN_TERMS: Partial<Record<PlanKey, string>> = {
  subject_month: "for a month",
  subject_sem: "for the whole semester",
};

export interface FromPrice {
  plan: PlanKey;
  /** e.g. "₱49" */
  amountLabel: string;
  /** e.g. "for a month" */
  term: string;
}

/** Centavos to a peso label: 4900 → "₱49", 29950 → "₱299.50". */
export function formatPeso(centavos: number): string {
  const pesos = centavos / 100;
  return Number.isInteger(pesos)
    ? `₱${pesos.toLocaleString("en-PH")}`
    : `₱${pesos.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** The cheapest plan that unlocks a single subject, for "from ₱X" copy. */
export function cheapestSubjectPrice(): FromPrice {
  const candidates = (Object.keys(SUBJECT_PLAN_TERMS) as PlanKey[]).sort(
    (a, b) => PLANS[a].amount - PLANS[b].amount
  );
  const plan = candidates[0];
  return { plan, amountLabel: formatPeso(PLANS[plan].amount), term: SUBJECT_PLAN_TERMS[plan]! };
}
