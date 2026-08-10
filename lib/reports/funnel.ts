/**
 * The live acquisition-to-payment funnel, written down once.
 *
 * `unlock_click` and `unlock_submitted` are deliberately absent. They are
 * pre-pivot event types: still in the DB enum, the events API allowlist, and
 * lib/supabase/types.ts, but emitted by no code since the subscription pivot.
 * Anything that renders them shows a frozen count that will never move again.
 *
 * There is also no completion event on the live path. `unlock_submitted` was
 * the "they paid" step and the pivot never replaced it, so completion comes
 * from the payments ledger instead. That is the better source regardless: a
 * ledger row is written by a verified webhook, while a client beacon is simply
 * lost whenever a user bounces to GCash and never comes back.
 */

import type { Metric } from "./metrics";

export interface FunnelStepDef {
  key: string;
  label: string;
  /** Where the number comes from. `paid` is not an event and never will be. */
  source: "events" | "ledger";
}

export const FUNNEL_STEPS: readonly FunnelStepDef[] = [
  { key: "enter", label: "Opened app", source: "events" },
  { key: "year_select", label: "Selected year", source: "events" },
  { key: "subject_open", label: "Opened a subject", source: "events" },
  { key: "module_open", label: "Opened a module", source: "events" },
  { key: "paywall_teaser_view", label: "Saw the paywall", source: "events" },
  { key: "paywall_teaser_click", label: "Tapped the paywall", source: "events" },
  { key: "subscribe_click", label: "Started checkout", source: "events" },
  { key: "paid", label: "Paid (ledger)", source: "ledger" },
] as const;

export type FunnelCounts = Record<string, number>;

export interface FunnelStep {
  key: string;
  label: string;
  source: "events" | "ledger";
  devices: number;
  /** Percentage points from the previous step. null on step 1 or a zero base. */
  fromPrevious: number | null;
  /** Percentage points from the top of the funnel. null on a zero base. */
  fromTop: number | null;
  /** True when this step has MORE devices than the one before it. */
  nonMonotonic: boolean;
}

export interface Leak {
  fromKey: string;
  toKey: string;
  /** Devices that reached `fromKey` but not `toKey`. */
  lost: number;
  /** Those devices as a percentage of `fromKey`. */
  rate: number;
}

/**
 * Whole percentage points, or null when there is no base to divide by.
 *
 * Returning 0 for a zero denominator would state "nobody converted" when the
 * truth is "nobody arrived". Those are different findings and a report must
 * not merge them.
 */
export function pct(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return Math.round((numerator / denominator) * 100);
}

export function buildFunnel(counts: FunnelCounts): FunnelStep[] {
  const top = counts[FUNNEL_STEPS[0].key] ?? 0;

  return FUNNEL_STEPS.map((def, i) => {
    const devices = counts[def.key] ?? 0;
    const previous = i === 0 ? null : counts[FUNNEL_STEPS[i - 1].key] ?? 0;

    return {
      key: def.key,
      label: def.label,
      source: def.source,
      devices,
      fromPrevious: previous === null ? null : pct(devices, previous),
      fromTop: pct(devices, top),
      // Not an error. A device that opens a shared module link emits
      // module_open with no preceding enter, so later steps can legitimately
      // exceed earlier ones. Surfacing it beats silently clamping it.
      nonMonotonic: previous !== null && devices > previous,
    };
  });
}

/**
 * The transition that lost the most devices.
 *
 * Ranked by absolute loss rather than by rate on purpose. At this traffic a
 * two-device step dropping to zero is a 100% "leak" and is noise; several
 * hundred devices lost at one transition is the thing worth a week of work.
 * Ranking by count also avoids inventing a minimum-volume threshold, which
 * would be judgment — and judgment belongs to the agent, not the collector.
 */
export function largestLeak(steps: FunnelStep[]): Leak | null {
  let worst: Leak | null = null;

  for (let i = 1; i < steps.length; i += 1) {
    const from = steps[i - 1];
    const to = steps[i];
    const lost = from.devices - to.devices;
    if (lost <= 0) continue;

    const rate = pct(lost, from.devices);
    if (rate === null) continue;

    const better =
      worst === null || lost > worst.lost || (lost === worst.lost && rate > worst.rate);
    if (better) worst = { fromKey: from.key, toKey: to.key, lost, rate };
  }

  return worst;
}

/**
 * The fixed metric row set for the FUNNEL table. The labels must never change
 * between runs — a changed label resets that row's delta history, which is a
 * deliberate decision and not something to do by accident while editing.
 */
export function funnelMetrics(steps: FunnelStep[], leak: Leak | null): Metric[] {
  return [
    ...steps.map((step, i) => ({
      label: `${i + 1} ${step.label}`,
      value: step.devices,
    })),
    { label: "Largest leak (devices)", value: leak?.lost ?? null },
    { label: "Largest leak (%)", value: leak?.rate ?? null, unit: "%" },
  ];
}
