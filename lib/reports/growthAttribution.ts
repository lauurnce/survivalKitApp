/**
 * Growth acquisition helpers: the `enter` definition break and UTM campaign
 * attribution. Pure functions, so the collector's numbers stay tested code.
 */

/**
 * The PH calendar date `enter` changed meaning (Phase 3 reach track).
 *
 * Before: fired on EVERY visit to `/` and `/account` — bouncing back to the
 * home page counted again, and a visit that landed on a module page, /unlock
 * or a class join link recorded no `enter` (and no attribution) at all.
 *
 * From this date: fires ONCE per browser tab session, on whichever page the
 * visit lands (components/SessionEntryTracker.tsx, deduped in
 * lib/analytics.ts).
 *
 * So `enters` can fall (no more repeat home-page counts) while devices
 * reached rises (deep landings now count). Neither move, across this date, is
 * a change in reach.
 */
export const ENTER_REDEFINED_ON = "2026-10-31";

export type EnterDefinition = "per-home-visit" | "per-session-landing" | "mixed";

const DEFINITION_TEXT: Record<EnterDefinition, string> = {
  "per-home-visit": "every visit to / or /account (pre-2026-10-31 definition)",
  "per-session-landing": "once per tab session, on any landing page",
  mixed: `straddles the ${ENTER_REDEFINED_ON} redefinition`,
};

/** Which `enter` definition a "YYYY-MM-DD → YYYY-MM-DD" PH window was counted under. */
export function enterDefinitionFor(windowLabel: string): EnterDefinition {
  const [first, last] = windowLabel.split(" → ");
  if (!first || !last) throw new Error(`Unparseable window label: ${windowLabel}`);
  if (last < ENTER_REDEFINED_ON) return "per-home-visit";
  if (first >= ENTER_REDEFINED_ON) return "per-session-landing";
  return "mixed";
}

export interface EnterDefinitionNote {
  changedOn: string;
  current: EnterDefinition;
  previous: EnterDefinition;
  /** True only when both windows were counted under the same, unmixed definition. */
  comparable: boolean;
  note: string;
}

/**
 * Whether this week's `enter`-based numbers can be diffed against last
 * week's. When they cannot, the week-over-week delta on "Enters this week"
 * (and on all-time devices reached, which is counted from `enter`) measures
 * the definition change, not reach.
 */
export function enterDefinitionNote(
  currentLabel: string,
  previousLabel: string
): EnterDefinitionNote {
  const current = enterDefinitionFor(currentLabel);
  const previous = enterDefinitionFor(previousLabel);
  const comparable = current === previous && current !== "mixed";
  const note = comparable
    ? `Both windows count enter ${DEFINITION_TEXT[current]}; deltas are comparable.`
    : `enter was redefined on ${ENTER_REDEFINED_ON}: this week counts ${DEFINITION_TEXT[current]}, ` +
      `last week ${DEFINITION_TEXT[previous]}. Enter-based deltas reflect the definition ` +
      `change, not a change in reach.`;
  return { changedOn: ENTER_REDEFINED_ON, current, previous, comparable, note };
}

// ── UTM campaign attribution ────────────────────────────────────────────────

export interface UtmKey {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
}

/** One row of growth_acquisition_agg's `by_utm` (migration 20261101000101). */
export interface UtmTripleRow extends UtmKey {
  enters: number;
  devices: number;
}

export interface CappedRows<T> {
  rows: T[] | null;
  total_groups: number;
}

/** The finals reactivation email's CTA tags (lib/email reactivation template). */
export const REACTIVATION_CAMPAIGN: UtmKey = {
  utm_source: "reactivation",
  utm_medium: "email",
  utm_campaign: "finals-dec-2026",
};

/**
 * Enters attributed to one exact source/medium/campaign triple.
 *
 * Returns null — "not read", never a false zero — when the breakdown is
 * missing (RPC failed, or the migration adding `by_utm` is not applied yet)
 * or when the triple is absent from a TRUNCATED list, where it may sit below
 * the cap. Returns 0 only when the list is complete and the triple is not in it.
 */
export function campaignEnters(
  byUtm: CappedRows<UtmTripleRow> | null | undefined,
  key: UtmKey
): number | null {
  if (!byUtm) return null;
  const rows = byUtm.rows ?? [];
  const match = rows.find(
    (row) =>
      row.utm_source === key.utm_source &&
      row.utm_medium === key.utm_medium &&
      row.utm_campaign === key.utm_campaign
  );
  if (match) return match.enters;
  return rows.length >= byUtm.total_groups ? 0 : null;
}
