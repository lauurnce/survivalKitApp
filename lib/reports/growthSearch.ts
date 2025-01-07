/**
 * Growth search sections: what students search for on /search, and what they
 * search for and do not find. Shapes growth_search_agg (migration
 * 20261101000700) into finished text tables the collector hands VANTAGE, so
 * no number in the report is the agent's own arithmetic.
 *
 * Aggregate counts only. Queries were normalized and redacted before they
 * were stored (lib/analyticsSearch.ts); nothing here ties a query to a device.
 */

import { pct } from "./funnel";
import type { Metric } from "./metrics";

export const SEARCH_TOP_N = 15;

export interface SearchQueryRow {
  query: string;
  searches: number;
  devices: number;
}

/** A capped distribution per the 2026-08-10 ruling. `rows` is null when empty. */
export interface CappedSearchRows {
  rows: SearchQueryRow[] | null;
  total_groups: number;
}

export interface SearchAgg {
  searches: number;
  devices: number;
  no_result_searches: number;
  result_clicks: number;
  top_queries: CappedSearchRows;
  no_result_queries: CappedSearchRows;
}

/** Headline search numbers for the audience table. `null` = not read. */
export function searchMetrics(agg: SearchAgg | null): Metric[] {
  return [
    { label: "Searches this week", value: agg?.searches ?? null },
    { label: "Devices that searched", value: agg?.devices ?? null },
    {
      label: "No-result search share",
      value: agg ? pct(agg.no_result_searches, agg.searches) : null,
      unit: "%",
    },
    {
      // A raw count, not a rate: one search can lead to several clicks.
      label: "Search result clicks",
      value: agg?.result_clicks ?? null,
    },
  ];
}

const QUERY_WIDTH = 44;
const COL_WIDTH = 10;

/**
 * Renders one capped query distribution as an aligned table with an honest
 * "top N of M" footer. `null` (RPC missing or failed) renders as not read,
 * never as an empty week.
 */
export function renderSearchTable(heading: string, capped: CappedSearchRows | null | undefined): string {
  const header =
    heading.padEnd(QUERY_WIDTH) + "SEARCHES".padStart(COL_WIDTH) + "DEVICES".padStart(COL_WIDTH);
  const rule = "─".repeat(QUERY_WIDTH + COL_WIDTH * 2);

  if (!capped) return [header, rule, "not read"].join("\n");

  const rows = (capped.rows ?? []).slice(0, SEARCH_TOP_N);
  if (rows.length === 0) return [header, rule, "no searches this week"].join("\n");

  const body = rows.map((row) => {
    const query = row.query.length > QUERY_WIDTH - 2 ? `${row.query.slice(0, QUERY_WIDTH - 3)}…` : row.query;
    return (
      query.padEnd(QUERY_WIDTH) +
      String(row.searches).padStart(COL_WIDTH) +
      String(row.devices).padStart(COL_WIDTH)
    );
  });

  const footer = `top ${rows.length} of ${capped.total_groups}`;
  return [header, rule, ...body, rule, footer].join("\n");
}

/** Both search tables, keyed the way the collector stores `tables`. */
export function searchTables(agg: SearchAgg | null): { topSearches: string; noResultSearches: string } {
  return {
    topSearches: renderSearchTable("TOP SEARCHES (7d)", agg?.top_queries),
    noResultSearches: renderSearchTable("NO-RESULT SEARCHES (7d)", agg?.no_result_queries),
  };
}
