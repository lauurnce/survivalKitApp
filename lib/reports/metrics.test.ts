import { describe, it, expect } from "vitest";
import { diffMetrics, renderMetricsTable, type Metric } from "./metrics";

describe("diffMetrics", () => {
  it("marks every row as baseline when there is no previous run", () => {
    const current: Metric[] = [{ label: "Live URL /", value: 200 }];
    const rows = diffMetrics(current, null);
    expect(rows).toEqual([
      {
        label: "Live URL /",
        now: "200",
        previous: "—",
        delta: "—",
        direction: "unknown",
      },
    ]);
  });

  it("computes a numeric delta with an absolute change", () => {
    const rows = diffMetrics(
      [{ label: "Error clusters", value: 2 }],
      [{ label: "Error clusters", value: 1 }]
    );
    expect(rows[0].delta).toBe("+1");
    expect(rows[0].direction).toBe("up");
  });

  it("reports a decrease with direction down", () => {
    const rows = diffMetrics(
      [{ label: "5xx", value: 0 }],
      [{ label: "5xx", value: 4 }]
    );
    expect(rows[0].delta).toBe("-4");
    expect(rows[0].direction).toBe("down");
  });

  it("reports no change as flat with an em dash", () => {
    const rows = diffMetrics(
      [{ label: "5xx", value: 0 }],
      [{ label: "5xx", value: 0 }]
    );
    expect(rows[0].delta).toBe("—");
    expect(rows[0].direction).toBe("flat");
  });

  it("renders a null value as 'not read' and never computes a delta for it", () => {
    const rows = diffMetrics(
      [{ label: "Active CPU", value: null }],
      [{ label: "Active CPU", value: 72 }]
    );
    expect(rows[0].now).toBe("not read");
    expect(rows[0].delta).toBe("—");
    expect(rows[0].direction).toBe("unknown");
  });

  it("does not compute a delta when the previous value was not read", () => {
    const rows = diffMetrics(
      [{ label: "Active CPU", value: 72 }],
      [{ label: "Active CPU", value: null }]
    );
    expect(rows[0].previous).toBe("not read");
    expect(rows[0].delta).toBe("—");
    expect(rows[0].direction).toBe("unknown");
  });

  it("compares string values for equality without arithmetic", () => {
    const changed = diffMetrics(
      [{ label: "Page cache", value: "MISS" }],
      [{ label: "Page cache", value: "HIT" }]
    );
    expect(changed[0].delta).toBe("changed");
    expect(changed[0].direction).toBe("up");

    const same = diffMetrics(
      [{ label: "Page cache", value: "HIT" }],
      [{ label: "Page cache", value: "HIT" }]
    );
    expect(same[0].delta).toBe("—");
    expect(same[0].direction).toBe("flat");
  });

  it("appends a unit to the rendered value", () => {
    const rows = diffMetrics([{ label: "Build", value: 42, unit: "s" }], null);
    expect(rows[0].now).toBe("42s");
  });

  it("keeps a current row whose label is absent from the previous run", () => {
    const rows = diffMetrics(
      [{ label: "Tests", value: 579 }],
      [{ label: "5xx", value: 0 }]
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].label).toBe("Tests");
    expect(rows[0].previous).toBe("—");
  });

  it("preserves the order of the current metrics", () => {
    const rows = diffMetrics(
      [
        { label: "B", value: 1 },
        { label: "A", value: 2 },
      ],
      null
    );
    expect(rows.map((r) => r.label)).toEqual(["B", "A"]);
  });
});

describe("renderMetricsTable", () => {
  it("renders aligned columns under the heading", () => {
    const table = renderMetricsTable(
      diffMetrics(
        [
          { label: "Live URL /", value: 200 },
          { label: "5xx", value: 0 },
        ],
        [
          { label: "Live URL /", value: 200 },
          { label: "5xx", value: 3 },
        ]
      ),
      "HEALTH"
    );
    const lines = table.split("\n");
    expect(lines[0]).toContain("HEALTH");
    expect(lines[0]).toContain("NOW");
    expect(lines[0]).toContain("LAST RUN");
    expect(lines[1]).toMatch(/^─+$/);
    expect(table).toContain("Live URL /");
    expect(table).toContain("-3");
  });

  it("returns a heading and rule even with no rows", () => {
    const table = renderMetricsTable([], "HEALTH");
    expect(table).toContain("HEALTH");
    expect(table.split("\n")).toHaveLength(2);
  });

  it("defaults the column labels to NOW and LAST RUN", () => {
    const table = renderMetricsTable([], "HEALTH");
    const [header] = table.split("\n");
    expect(header).toContain("NOW");
    expect(header).toContain("LAST RUN");
  });

  it("uses custom column labels in the header when passed", () => {
    const table = renderMetricsTable([], "HEALTH", { now: "TODAY", previous: "YESTERDAY" });
    const [header] = table.split("\n");
    expect(header).toContain("TODAY");
    expect(header).toContain("YESTERDAY");
    expect(header).not.toContain("LAST RUN");
  });

  it("renders a separator rule exactly as wide as a body row", () => {
    const table = renderMetricsTable(
      diffMetrics([{ label: "Live URL /", value: 200 }], null),
      "HEALTH"
    );
    const [, rule, body] = table.split("\n");
    expect(rule.length).toBe(body.length);
  });
});
