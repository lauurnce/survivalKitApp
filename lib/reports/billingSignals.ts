/**
 * Billing operations signal helpers.
 *
 * Detects a PAYMONGO_LIVEMODE misconfiguration indirectly, via a
 * database-side proxy (see `modeMatchSignal`) rather than by reading
 * production's env value directly — the collector can't read that value at
 * all (it's [SENSITIVE], see `readLivemodeFlag`). Everything here takes
 * counts rather than rows: intent is counted with `head: true` queries
 * against `events`, unaffected by the 1000-row select cap. Full rationale:
 * docs/reports/finance/billing-edge-cases.md (gitignored).
 */

/** What `vercel env pull` writes in place of a Sensitive value. */
export const SENSITIVE_PLACEHOLDER = "[SENSITIVE]";

export const LIVEMODE_TRAP =
  "A PAYMONGO_LIVEMODE mismatch fails silently: the webhook still answers 200, " +
  "so nothing errors while entitlements stop being written. See " +
  "docs/reports/finance/billing-edge-cases.md for the exact mechanics.";

export type LivemodeState = "true" | "false" | "unset" | "sensitive-placeholder" | "malformed";

export interface LivemodeReading {
  /** The honest reading. Null whenever the value is not usable. */
  value: boolean | null;
  state: LivemodeState;
  /**
   * What the webhook's `=== "true"` would produce for this raw value. The gap
   * between this and `value` is the trap made visible: a value we cannot read
   * still coerces to "expect test mode" in the running app.
   */
  appWouldExpectLive: boolean;
}

export function readLivemodeFlag(raw: string | undefined): LivemodeReading {
  const appWouldExpectLive = raw === "true";

  if (raw === undefined || raw === "") {
    return { value: null, state: "unset", appWouldExpectLive };
  }
  if (raw === SENSITIVE_PLACEHOLDER) {
    return { value: null, state: "sensitive-placeholder", appWouldExpectLive };
  }
  if (raw === "true") return { value: true, state: "true", appWouldExpectLive };
  if (raw === "false") return { value: false, state: "false", appWouldExpectLive };

  // "True", " true", "1" — all coerce to test mode in the webhook, and none of
  // them is what anybody meant to write.
  return { value: null, state: "malformed", appWouldExpectLive };
}

// ── The database-side proxy ─────────────────────────────────────────────────

export type ModeMatchState = "consistent" | "intent-without-money" | "no-signal";

export interface ModeMatchSignal {
  state: ModeMatchState;
  /** Everything that could explain the state. Never narrowed to one. */
  hypotheses: string[];
  evidence: { paymentsInWindow: number; intentInWindow: number | null };
}

export function modeMatchSignal(input: {
  paymentsInWindow: number;
  intentInWindow: number | null;
}): ModeMatchSignal {
  const evidence = {
    paymentsInWindow: input.paymentsInWindow,
    intentInWindow: input.intentInWindow,
  };

  if (input.paymentsInWindow > 0) {
    return { state: "consistent", hypotheses: [], evidence };
  }

  // A count that failed is not a count of zero. Treating a null as "nobody
  // tried" would turn a broken query into a reassuring answer.
  if (input.intentInWindow === null || input.intentInWindow === 0) {
    return { state: "no-signal", hypotheses: [], evidence };
  }

  return {
    state: "intent-without-money",
    hypotheses: [
      "PAYMONGO_LIVEMODE in production does not match the events PayMongo is sending, so every payment is being acknowledged and discarded.",
      "The webhook is failing for another reason — signature verification, a malformed payload, or an error after the ledger insert.",
      "Nobody actually completed a purchase. Clicking the paywall is not paying, and this is the most common explanation at low volume.",
    ],
    evidence,
  };
}

// ── Abandonment, which belongs to Growth ────────────────────────────────────

/** Live intent events. `unlock_click` and `unlock_submitted` are dead types. */
export const INTENT_EVENT_TYPES = ["subscribe_click", "paywall_teaser_click"] as const;

export const INTENT_IS_NOT_DEVICES =
  "This counts intent EVENTS, not devices — one device can click many times — so it " +
  "is not a conversion rate. The device-level funnel belongs to Growth " +
  "(growth_funnel_agg); Finance hands this across rather than computing a second " +
  "number that would disagree with it.";

export function intentPerPayment(
  intentEvents: number | null,
  payments: number
): number | null {
  if (intentEvents === null) return null;
  if (payments <= 0) return null;
  return Math.round((intentEvents / payments) * 100) / 100;
}

export interface GrowthHandoff {
  window: { sinceIso: string; untilIso: string };
  intentEvents: number | null;
  payments: number;
  intentPerPayment: number | null;
  caveat: string;
}

export function abandonmentHandoff(input: {
  window: { sinceIso: string; untilIso: string };
  intentEvents: number | null;
  payments: number;
}): GrowthHandoff {
  return {
    window: input.window,
    intentEvents: input.intentEvents,
    payments: input.payments,
    intentPerPayment: intentPerPayment(input.intentEvents, input.payments),
    caveat: INTENT_IS_NOT_DEVICES,
  };
}

// ── What this module cannot do ──────────────────────────────────────────────

export const WEBHOOK_LANDING_CEILING =
  "The collector can't confirm every paid link reached the ledger — that needs " +
  "the live secret key, which is [SENSITIVE]. Run the admin reconcile view " +
  "instead of substituting an estimate; see " +
  "docs/reports/finance/billing-edge-cases.md for detail.";

export interface QuietLedger {
  daysSinceLastPayment: number | null;
}

export function quietLedger(lastPaidAtIso: string | null, now: Date): QuietLedger {
  if (!lastPaidAtIso) return { daysSinceLastPayment: null };
  const last = Date.parse(lastPaidAtIso);
  if (!Number.isFinite(last)) return { daysSinceLastPayment: null };
  const days = Math.floor((now.getTime() - last) / (24 * 60 * 60 * 1000));
  // A future timestamp is a clock skew, not negative days.
  return { daysSinceLastPayment: Math.max(0, days) };
}
