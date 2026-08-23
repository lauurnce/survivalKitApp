/**
 * The standing assertion against block-price formula drift.
 *
 * The class block price is computed in three places and has drifted twice —
 * see commit 44c2957, whose whole content was a comment correction, because
 * the third copy existed and the warning comment did not name it:
 *
 *   app/(main)/for-blocks/pricing.ts        pesos     the buyer's preview
 *   app/api/class/checkout/route.ts         centavos  prices the PayMongo link
 *   app/api/webhooks/paymongo/route.ts      centavos  rejects underpayment
 *
 * The third is the one that must not drift. Below the checkout's price it
 * starts accepting short payments; above it, every legitimate payment is
 * rejected with "Amount too low" while the buyer sees a failure and is charged
 * nothing. Neither has a test today, which is why this module exists as an
 * assertion rather than as a report row: a P0 should break the build, not wait
 * for the next monthly report.
 *
 * THE ROUTE FILES ARE READ AS TEXT, NOT IMPORTED. Importing the checkout route
 * pulls in next/server, next/headers and a Supabase client, evaluates
 * module-level code, and makes a pricing assertion depend on the whole server
 * runtime booting under jsdom. Textual extraction of named constants is
 * narrower and much harder to break. The cost is real and is stated here
 * rather than hidden: constant agreement is checked exactly, but formula SHAPE
 * is only checked structurally, by asserting the canonical markers are still
 * present. A rewrite that keeps the constants and changes the arithmetic would
 * pass. Nothing short of executing all three copies closes that gap.
 */

export interface BlockConstants {
  baseSubjectCentavos: number;
  baseAllCentavos: number;
  perSeatCentavos: number;
  /** A seat count, not money. Never scaled by normaliseToCentavos. */
  includedSeats: number;
}

export interface BlockSourceSpec {
  /** Repo-relative path. */
  path: string;
  unit: "pesos" | "centavos";
  /** The identifier each constant goes by in this file. */
  names: {
    baseSubject: string;
    baseAll: string;
    perSeat: string;
    includedSeats: string;
  };
}

const CENTAVOS_NAMES = {
  baseSubject: "BASE_SUBJECT_CENTAVOS",
  baseAll: "BASE_ALL_CENTAVOS",
  perSeat: "PER_SEAT_CENTAVOS",
  includedSeats: "INCLUDED_SEATS",
} as const;

/**
 * Every place the block price is computed. Adding a fourth copy of the formula
 * without adding it here is how the drift happens; adding it here is how it
 * gets caught.
 */
export const BLOCK_SOURCES: readonly BlockSourceSpec[] = [
  {
    path: "app/(main)/for-blocks/pricing.ts",
    unit: "pesos",
    names: {
      baseSubject: "BASE_SUBJECT",
      baseAll: "BASE_ALL",
      perSeat: "PER_SEAT",
      includedSeats: "INCLUDED_SEATS",
    },
  },
  { path: "app/api/class/checkout/route.ts", unit: "centavos", names: CENTAVOS_NAMES },
  { path: "app/api/webhooks/paymongo/route.ts", unit: "centavos", names: CENTAVOS_NAMES },
] as const;

export type ExtractResult =
  | { ok: true; constants: BlockConstants }
  | { ok: false; missing: string[] };

/**
 * Pulls a named integer constant out of source text. Matches both
 * `const NAME = 123;` and the comma-declared form the webhook uses, and will
 * not match a longer identifier that merely starts with the name — the `=`
 * must follow the name directly, so BASE_SUBJECT never matches inside
 * BASE_SUBJECT_CENTAVOS.
 */
function readNumber(source: string, name: string): number | null {
  const match = source.match(new RegExp(`\\b${name}\\s*=\\s*(\\d+)`));
  return match ? Number(match[1]) : null;
}

export function extractConstants(
  source: string,
  spec: BlockSourceSpec
): ExtractResult {
  const found = {
    baseSubjectCentavos: readNumber(source, spec.names.baseSubject),
    baseAllCentavos: readNumber(source, spec.names.baseAll),
    perSeatCentavos: readNumber(source, spec.names.perSeat),
    includedSeats: readNumber(source, spec.names.includedSeats),
  };

  const missing = (
    [
      ["baseSubjectCentavos", spec.names.baseSubject],
      ["baseAllCentavos", spec.names.baseAll],
      ["perSeatCentavos", spec.names.perSeat],
      ["includedSeats", spec.names.includedSeats],
    ] as const
  )
    .filter(([field]) => found[field] === null)
    .map(([, name]) => name);

  if (missing.length > 0) return { ok: false, missing };
  return { ok: true, constants: found as BlockConstants };
}

/** Money scales; the seat count does not. Getting that backwards is the bug. */
export function normaliseToCentavos(
  constants: BlockConstants,
  unit: BlockSourceSpec["unit"]
): BlockConstants {
  if (unit === "centavos") return constants;
  return {
    baseSubjectCentavos: constants.baseSubjectCentavos * 100,
    baseAllCentavos: constants.baseAllCentavos * 100,
    perSeatCentavos: constants.perSeatCentavos * 100,
    includedSeats: constants.includedSeats,
  };
}

/** The formula, defined once. Every comparison goes through this. */
export function blockPriceCentavos(
  constants: BlockConstants,
  scope: "subject" | "all",
  seats: number
): number {
  const base =
    scope === "all" ? constants.baseAllCentavos : constants.baseSubjectCentavos;
  const extraSeats = Math.max(0, seats - constants.includedSeats);
  return base + extraSeats * constants.perSeatCentavos;
}

/**
 * The BlockAmountMatcher lib/reports/unitEconomics.ts requires. An amount is a
 * block sale when it is the scope's base plus a whole number of extra seats.
 *
 * A per-device plan can never collide: every plan price is far below either
 * base. An OVERPAYMENT on a per-device plan theoretically could, and would be
 * filed as a block sale — but an overpayment large enough to reach ₱799 is
 * already an exception the reconciler surfaces on the amount axis.
 */
export function isBlockAmountFrom(constants: BlockConstants) {
  return (centavos: number, scope: "subject" | "all"): boolean => {
    const base =
      scope === "all" ? constants.baseAllCentavos : constants.baseSubjectCentavos;
    if (centavos < base) return false;
    const extra = centavos - base;
    return extra % constants.perSeatCentavos === 0;
  };
}

export interface Drift {
  field: keyof BlockConstants;
  values: { path: string; value: number }[];
}

export function compareSources(
  entries: { path: string; constants: BlockConstants }[]
): Drift[] {
  if (entries.length < 2) return [];

  const fields: (keyof BlockConstants)[] = [
    "baseSubjectCentavos",
    "baseAllCentavos",
    "perSeatCentavos",
    "includedSeats",
  ];

  // One entry per disagreeing FIELD, not per pair: three sources disagreeing
  // on one number is one problem, and reporting it three times buries it.
  return fields
    .filter(
      (field) => new Set(entries.map((entry) => entry.constants[field])).size > 1
    )
    .map((field) => ({
      field,
      values: entries.map((entry) => ({
        path: entry.path,
        value: entry.constants[field],
      })),
    }));
}

/**
 * The canonical expression both server copies must still contain. This is a
 * structural check, not a semantic one — see the module header for what it
 * does and does not catch.
 */
export const FORMULA_MARKERS = [
  "Math.max(0, seats - INCLUDED_SEATS)",
  "PER_SEAT_CENTAVOS",
] as const;

export function formulaMarkersPresent(source: string): string[] {
  return FORMULA_MARKERS.filter((marker) => !source.includes(marker));
}

export interface SeatBounds {
  /** The identifier the checkout route compares against, or null. */
  minSeatsCheckout: string | null;
  /** The bare literal the webhook compares against, or null. */
  minSeatsWebhookLiteral: number | null;
  maxEnforcedAtCheckout: boolean;
  maxEnforcedAtWebhook: boolean;
}

/**
 * Reported, not asserted, for the upper bound. MAX_SEATS is declared in
 * pricing.ts and enforced by neither server path — both check only a lower
 * bound. Whether that is deliberate could not be verified, and failing a test
 * on it would be inventing a requirement. LEDGER writes it up as a finding
 * with options instead.
 *
 * The lower bound is different: it is duplicated three times, once as a bare
 * literal in the webhook, and the test asserts those agree.
 */
export function seatBoundEnforcement(
  checkoutSource: string,
  webhookSource: string
): SeatBounds {
  const checkoutMin = checkoutSource.match(/seats\s*<\s*([A-Za-z_][A-Za-z0-9_]*)/);
  const webhookMin = webhookSource.match(/seats\s*<\s*(\d+)/);

  return {
    minSeatsCheckout: checkoutMin ? checkoutMin[1] : null,
    minSeatsWebhookLiteral: webhookMin ? Number(webhookMin[1]) : null,
    maxEnforcedAtCheckout: /MAX_SEATS/.test(checkoutSource),
    maxEnforcedAtWebhook: /MAX_SEATS/.test(webhookSource),
  };
}
