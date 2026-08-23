import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildSchema } from "./migrationSchema";
import {
  assessRls,
  isUnconstrained,
  renderRlsTable,
  rlsSummaryLine,
  TABLE_DATA_CLASS,
  type TablePosture,
} from "./rlsPosture";
import type { PolicyRecord, TableRecord } from "./migrationSchema";

const policy = (overrides: Partial<PolicyRecord> = {}): PolicyRecord => ({
  name: "p",
  table: "widgets",
  command: "SELECT",
  roles: ["anon"],
  using: "true",
  withCheck: null,
  migration: "a.sql",
  ...overrides,
});

const tableRecord = (overrides: Partial<TableRecord> = {}): TableRecord => ({
  name: "widgets",
  createdIn: "a.sql",
  columns: ["id"],
  rlsEnabledIn: "a.sql",
  policies: [],
  ...overrides,
});

// Synthetic classes so these tests never encode the real registry.
const classes = {
  widgets: "PUBLIC_REFERENCE",
  orders: "USER_DATA",
  ledger: "SERVER_ONLY",
} as const;

describe("isUnconstrained", () => {
  it("treats true as unconstrained in any casing or spacing", () => {
    expect(isUnconstrained("true")).toBe(true);
    expect(isUnconstrained("TRUE")).toBe(true);
    expect(isUnconstrained(" true ")).toBe(true);
    expect(isUnconstrained("(true)")).toBe(true);
  });

  it("treats an absent predicate as unconstrained", () => {
    expect(isUnconstrained(null)).toBe(true);
  });

  it("treats a real predicate as constrained", () => {
    expect(isUnconstrained("device_id = current_setting('app.device_id', true)")).toBe(false);
  });

  it("does not mistake a predicate that merely contains the word true", () => {
    expect(isUnconstrained("current_setting('app.device_id', true) = device_id")).toBe(false);
  });

  it("treats 1 = 1 as unconstrained", () => {
    expect(isUnconstrained("1 = 1")).toBe(true);
  });
});

describe("assessRls", () => {
  it("rates a table with RLS off as a gap whatever its class", () => {
    const [posture] = assessRls([tableRecord({ rlsEnabledIn: null })], classes);
    expect(posture.rlsEnabled).toBe(false);
    expect(posture.verdict).toBe("gap");
    expect(posture.reasons).toContain("RLS not enabled");
  });

  it("rates an unconstrained anon select on public reference data as ok", () => {
    const [posture] = assessRls(
      [tableRecord({ policies: [policy({ command: "SELECT", using: "true" })] })],
      classes
    );
    expect(posture.verdict).toBe("ok");
  });

  it("rates an unconstrained anon select on user data as a gap", () => {
    const [posture] = assessRls(
      [
        tableRecord({
          name: "orders",
          policies: [policy({ table: "orders", command: "SELECT", using: "true" })],
        }),
      ],
      classes
    );
    expect(posture.verdict).toBe("gap");
    expect(posture.reasons.join(" ")).toContain("SELECT");
  });

  it("rates an unconstrained anon insert on user data as review, not a gap", () => {
    const [posture] = assessRls(
      [
        tableRecord({
          name: "orders",
          policies: [
            policy({ table: "orders", command: "INSERT", using: null, withCheck: "true" }),
          ],
        }),
      ],
      classes
    );
    expect(posture.verdict).toBe("review");
  });

  it("rates a constrained anon policy on user data as ok", () => {
    const [posture] = assessRls(
      [
        tableRecord({
          name: "orders",
          policies: [
            policy({ table: "orders", command: "SELECT", using: "device_id = current_setting('x', true)" }),
          ],
        }),
      ],
      classes
    );
    expect(posture.verdict).toBe("ok");
  });

  it("rates a server-only table with no anon policy as ok", () => {
    const [posture] = assessRls([tableRecord({ name: "ledger", policies: [] })], classes);
    expect(posture.verdict).toBe("ok");
  });

  it("rates any anon policy on a server-only table as review", () => {
    const [posture] = assessRls(
      [tableRecord({ name: "ledger", policies: [policy({ table: "ledger" })] })],
      classes
    );
    expect(posture.verdict).toBe("review");
  });

  it("rates an unregistered table as review even when it looks clean", () => {
    const [posture] = assessRls([tableRecord({ name: "brandnew", policies: [] })], classes);
    expect(posture.dataClass).toBe("UNREGISTERED");
    expect(posture.verdict).toBe("review");
    expect(posture.reasons).toContain("table not in TABLE_DATA_CLASS");
  });

  it("ignores policies granted only to authenticated or service roles", () => {
    const [posture] = assessRls(
      [
        tableRecord({
          name: "orders",
          policies: [policy({ table: "orders", roles: ["authenticated"], using: "true" })],
        }),
      ],
      classes
    );
    expect(posture.anonPolicies).toHaveLength(0);
    expect(posture.verdict).toBe("ok");
  });

  it("counts a public-role policy as anon-reachable", () => {
    const [posture] = assessRls(
      [
        tableRecord({
          name: "orders",
          policies: [policy({ table: "orders", roles: ["public"], using: "true" })],
        }),
      ],
      classes
    );
    expect(posture.anonPolicies).toHaveLength(1);
    expect(posture.verdict).toBe("gap");
  });

  it("treats an ALL-command policy as covering select", () => {
    const [posture] = assessRls(
      [
        tableRecord({
          name: "orders",
          policies: [policy({ table: "orders", command: "ALL", using: "true" })],
        }),
      ],
      classes
    );
    expect(posture.verdict).toBe("gap");
  });

  it("preserves table order from the input", () => {
    const postures = assessRls(
      [tableRecord({ name: "orders" }), tableRecord({ name: "widgets" })],
      classes
    );
    expect(postures.map((p) => p.table)).toEqual(["orders", "widgets"]);
  });
});

describe("renderRlsTable", () => {
  const postures: TablePosture[] = assessRls(
    [
      tableRecord({ name: "widgets", policies: [policy({ using: "true" })] }),
      tableRecord({ name: "orders", rlsEnabledIn: null }),
    ],
    classes
  );

  it("has a header naming the columns", () => {
    const [header] = renderRlsTable(postures).split("\n");
    expect(header).toContain("TABLE");
    expect(header).toContain("CLASS");
    expect(header).toContain("RLS");
    expect(header).toContain("VERDICT");
  });

  it("renders a rule as wide as a body row", () => {
    const [, rule, body] = renderRlsTable(postures).split("\n");
    expect(rule.length).toBe(body.length);
  });

  it("names every table passed to it", () => {
    const rendered = renderRlsTable(postures);
    expect(rendered).toContain("widgets");
    expect(rendered).toContain("orders");
  });
});

describe("rlsSummaryLine", () => {
  it("reports all clear when nothing needs attention", () => {
    const postures = assessRls([tableRecord({ policies: [] })], classes);
    expect(rlsSummaryLine(postures)).toBe("RLS           1/1 tables clean · no gaps, no review items");
  });

  it("counts gaps and review items separately", () => {
    const postures = assessRls(
      [
        tableRecord({ name: "widgets" }),
        tableRecord({ name: "orders", rlsEnabledIn: null }),
        tableRecord({ name: "brandnew" }),
      ],
      classes
    );
    expect(rlsSummaryLine(postures)).toContain("1 gap");
    expect(rlsSummaryLine(postures)).toContain("1 review");
  });
});

describe("standing assertion: the registry covers the real schema", () => {
  it("classifies every table declared in supabase/migrations", () => {
    const dir = join(__dirname, "..", "..", "supabase", "migrations");
    const files = readdirSync(dir)
      .filter((name) => name.endsWith(".sql"))
      .sort()
      .map((name) => ({ name, sql: readFileSync(join(dir, name), "utf8") }));

    const unregistered = buildSchema(files)
      .map((table) => table.name)
      .filter((name) => !(name in TABLE_DATA_CLASS));

    // A new table must be classified before it can be reported on. Failing
    // here is the intended outcome of shipping one without a class — add it
    // to TABLE_DATA_CLASS with the class its contents actually warrant.
    expect(unregistered).toEqual([]);
  });

  it("has no gap-rated table in the live schema", () => {
    const dir = join(__dirname, "..", "..", "supabase", "migrations");
    const files = readdirSync(dir)
      .filter((name) => name.endsWith(".sql"))
      .sort()
      .map((name) => ({ name, sql: readFileSync(join(dir, name), "utf8") }));

    // Asserts absence, so a passing run publishes nothing. A failing run
    // prints locally and is a finding for the private report, never a commit.
    const gaps = assessRls(buildSchema(files), TABLE_DATA_CLASS)
      .filter((posture) => posture.verdict === "gap")
      .map((posture) => posture.table);

    expect(gaps).toEqual([]);
  });
});
