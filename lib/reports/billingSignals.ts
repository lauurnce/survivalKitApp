/**
 * Billing operations, and the PAYMONGO_LIVEMODE mode-matching trap.
 *
 * THE TRAP. app/api/webhooks/paymongo/route.ts:21 computes
 * `EXPECTED_LIVEMODE = process.env.PAYMONGO_LIVEMODE === "true"`, and line 74
 * answers a mismatch with 200 { ok: true, ignored: "livemode" }. The 2xx is
 * correct — it stops PayMongo retrying an event this deployment will never act
 * on — but it means a mismatch produces NO ERROR ANYWHERE. PayMongo records
 * success. Vercel logs a 200. The buyer is charged. No subscription is written.
 * The only symptom is an absence.
 *
 * The `=== "true"` coercion is what makes it dangerous: every value that is not
 * the exact literal "true" means "expect test mode" — unset, empty, "True", a
 * trailing space, or the literal string "[SENSITIVE]". Any of those in a
 * production environment quietly switches production into test-only mode.
 *
 * THIS COLLECTOR CANNOT READ PRODUCTION'S VALUE. The PayMongo variables in
 * .env.reports.local are all the literal "[SENSITIVE]", because `vercel env
 * pull` cannot retrieve Sensitive values — and even a readable value would
 * only describe a local file, not the deployed environment. The reading is
 * `not read`, twice over, and it is reported that way rather than coerced.
 *
 * WHAT IS LEFT IS A DATABASE-SIDE PROXY, AND IT IS A GOOD ONE. A row in
 * `payments` can only be written by a webhook that already passed the livemode
 * gate, so ANY payment is proof the mode matched when it landed. Absence of
 * payments proves nothing on its own — which is exactly why the signal is
 * three-valued and why the middle state carries three hypotheses instead of a
 * verdict.
 *
 * Everything here takes counts rather than rows: intent is counted with
 * `head: true` queries against `events`, which is far past the 1000-row select
 * cap, and a count query is unaffected by it.
 */

/** What `vercel env pull` writes in place of a Sensitive value. */
export const SENSITIVE_PLACEHOLDER = "[SENSITIVE]";

export const LIVEMODE_TRAP =
  "A PAYMONGO_LIVEMODE mismatch is silent: the webhook answers 200 with " +
  'ignored: "livemode", so PayMongo records success, Vercel logs no error, the ' +
  "buyer is charged, and no entitlement is written. The only symptom is payments " +
  "stopping. Because the check is `=== \"true\"`, any value other than that exact " +
  "literal — unset, empty, mis-cased, or [SENSITIVE] — puts production in test mode.";

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
  "Confirming that every paid PayMongo link produced a ledger row means listing " +
  "payments at PayMongo (listRecentPaidLinks in lib/paymongo.ts), which needs the " +
  "live secret key. That key is [SENSITIVE] and cannot be pulled, so the collector " +
  "cannot perform this check. The admin reconcile view " +
  "(app/api/admin/reconcile/route.ts) already does exactly it with real " +
  "credentials — recommend running that rather than substituting an estimate.";

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
