// UTM tagging for every link the product hands to someone else: share sheets,
// invite links, email CTAs. Without these tags a visit from a group chat and a
// visit from a lifecycle email look identical in `events` — 0 of 1,001 entries
// in one 60-day window carried any tag, so no channel could be credited.
//
// Only the three tags the `enter` event records (lib/analytics.ts) are set.
// Adding utm_content/utm_term here would look like tracking while being
// silently dropped on the way into the database.
//
// Values are normalised to lowercase slugs ([a-z0-9_-]) so "Facebook",
// "facebook " and "facebook" never split one channel into three rows.

import { canonicalUrl } from "@/lib/appOrigin";

export interface UtmTags {
  /** Where the link was posted or sent from: "email", "tiktok", "share_card". */
  source: string;
  /** The kind of channel: "email", "social", "groupchat", "referral". */
  medium: string;
  /** The push it belongs to: "finals-dec-2026", "progress_card". */
  campaign: string;
}

/** Lowercase slug; anything outside [a-z0-9_-] collapses to a single "-". */
export function normaliseUtmValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Sets utm_source/utm_medium/utm_campaign on an absolute URL, replacing any
 * existing values and keeping every other query param and the hash. Throws on
 * an empty tag, because a link tagged with a blank campaign is exactly the
 * unattributable traffic this exists to prevent.
 */
export function withUtm(url: string, tags: UtmTags): string {
  const parsed = new URL(url);
  const entries: [string, string][] = [
    ["utm_source", tags.source],
    ["utm_medium", tags.medium],
    ["utm_campaign", tags.campaign],
  ];
  for (const [key, raw] of entries) {
    const value = normaliseUtmValue(raw);
    if (!value) throw new Error(`${key} must not be empty`);
    parsed.searchParams.set(key, value);
  }
  return parsed.toString();
}

/** Absolute, tagged URL on the canonical origin (https://tryi2i.com). */
export function taggedUrl(path: string, tags: UtmTags): string {
  return withUtm(canonicalUrl(path), tags);
}
