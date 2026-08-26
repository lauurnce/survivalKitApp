/**
 * Navigation utilities for context-aware back links.
 * Tracks when user navigated from Dashboard to show "Back to Dashboard" option.
 */

export function hasDashboardReferrer(searchParams: { get: (key: string) => string | null }): boolean {
  return searchParams.get("from") === "dashboard";
}

export function withDashboardReferrer(href: string): string {
  const url = new URL(href, "https://example.com");
  url.searchParams.set("from", "dashboard");
  return url.pathname + url.search;
}