/**
 * Search analytics: the ONE shape a typed search query takes before it is
 * stored. Shared by the /search client (lib/analytics.ts callers) and the
 * /api/events route, which re-applies it — the client is never trusted to
 * have normalized anything.
 *
 * A query is free text a student typed, so it is the most personal thing the
 * events table holds. Only this normalized form is ever kept:
 *   - lowercased, Unicode-folded (NFKC), control characters dropped
 *   - whitespace collapsed to single spaces and trimmed
 *   - anything shaped like an email address → "[email]"
 *   - any run of 7+ digits (phone, student or card number) → "[number]"
 *   - capped at SEARCH_QUERY_MAX characters
 * Nothing else typed into the search box is recorded.
 */

export const SEARCH_QUERY_MAX = 80;

/** Milliseconds of no typing before a search counts as "settled". */
export const SEARCH_SETTLE_MS = 800;

export const SEARCH_EVENT_TYPES = [
  "search_query",
  "search_no_results",
  "search_result_click",
] as const;

export type SearchEventType = (typeof SEARCH_EVENT_TYPES)[number];

export function isSearchEventType(value: unknown): value is SearchEventType {
  return (SEARCH_EVENT_TYPES as readonly unknown[]).includes(value);
}

const CONTROL_CHARS = /[\u0000-\u001f\u007f-\u009f]/g;
const EMAIL_LIKE = /[^\s@]+@[^\s@]+/g;
const LONG_NUMBER = /\+?\d(?:[\s\-.()]?\d){6,}/g;

/** The stored form of a typed query, or null when nothing searchable is left. */
export function normalizeSearchQuery(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const normalized = raw
    .normalize("NFKC")
    .replace(CONTROL_CHARS, " ")
    .toLowerCase()
    .replace(EMAIL_LIKE, "[email]")
    .replace(LONG_NUMBER, "[number]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, SEARCH_QUERY_MAX)
    .trim();
  return normalized === "" ? null : normalized;
}
