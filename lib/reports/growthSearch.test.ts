import { describe, it, expect } from "vitest";
import {
  SEARCH_TOP_N,
  renderSearchTable,
  searchMetrics,
  searchTables,
  type SearchAgg,
} from "./growthSearch";

const agg: SearchAgg = {
  searches: 40,
  devices: 12,
  no_result_searches: 10,
  result_clicks: 25,
  top_queries: {
    rows: [
      { query: "sql join", searches: 9, devices: 5 },
      { query: "cp1", searches: 7, devices: 6 },
    ],
    total_groups: 18,
  },
  no_result_queries: {
    rows: [{ query: "kubernetes", searches: 3, devices: 2 }],
    total_groups: 1,
  },
};

describe("searchMetrics", () => {
  it("reports searches, devices, no-result share and clicks", () => {
    expect(searchMetrics(agg)).toEqual([
      { label: "Searches this week", value: 40 },
      { label: "Devices that searched", value: 12 },
      { label: "No-result search share", value: 25, unit: "%" },
      { label: "Search result clicks", value: 25 },
    ]);
  });

  it("reports every row as not read when the RPC failed", () => {
    for (const metric of searchMetrics(null)) expect(metric.value).toBeNull();
  });
});

describe("renderSearchTable", () => {
  it("renders aligned rows with an honest top-N-of-M footer", () => {
    const table = renderSearchTable("TOP SEARCHES (7d)", agg.top_queries);
    const lines = table.split("\n");
    expect(lines[0]).toMatch(/^TOP SEARCHES \(7d\)\s+SEARCHES\s+DEVICES$/);
    expect(lines[2]).toMatch(/^sql join\s+9\s+5$/);
    expect(lines[3]).toMatch(/^cp1\s+7\s+6$/);
    expect(lines.at(-1)).toBe("top 2 of 18");
    // Every row the same width, so the columns line up when pasted.
    expect(new Set([lines[0], lines[2], lines[3]].map((l) => l.length)).size).toBe(1);
  });

  it(`never shows more than ${SEARCH_TOP_N} rows`, () => {
    const rows = Array.from({ length: 30 }, (_, i) => ({ query: `q${i}`, searches: 30 - i, devices: 1 }));
    const table = renderSearchTable("T", { rows, total_groups: 30 });
    expect(table).toContain(`top ${SEARCH_TOP_N} of 30`);
    expect(table).not.toContain("q15");
  });

  it("truncates a long query so the columns stay aligned", () => {
    const table = renderSearchTable("T", {
      rows: [{ query: "x".repeat(80), searches: 1, devices: 1 }],
      total_groups: 1,
    });
    const [header, , row] = table.split("\n");
    expect(row).toContain("…");
    expect(row.length).toBe(header.length);
  });

  it("says when a week had no searches (json_agg returns null rows)", () => {
    expect(renderSearchTable("T", { rows: null, total_groups: 0 })).toContain("no searches this week");
  });

  it("says not read, not zero, when the aggregate is missing", () => {
    expect(renderSearchTable("T", null)).toContain("not read");
    expect(renderSearchTable("T", undefined)).toContain("not read");
  });
});

describe("searchTables", () => {
  it("renders the top and no-result tables", () => {
    const tables = searchTables(agg);
    expect(tables.topSearches).toContain("TOP SEARCHES (7d)");
    expect(tables.noResultSearches).toContain("NO-RESULT SEARCHES (7d)");
    expect(tables.noResultSearches).toContain("kubernetes");
    expect(tables.noResultSearches).toContain("top 1 of 1");
  });
});
