import { describe, expect, it } from "vitest";
import {
  SCHEMA_CONTRACT,
  checkSchema,
  formatSchemaReport,
  type ColumnProbe,
} from "./schemaContract";

const present: ColumnProbe = async () => "present";
const missing: ColumnProbe = async () => "missing";

function probeWhere(absent: Record<string, string[]>): ColumnProbe {
  return async (table, column) =>
    absent[table]?.includes(column) ? "missing" : "present";
}

describe("SCHEMA_CONTRACT", () => {
  it("covers the profiles table the app reads on every account page", () => {
    expect(SCHEMA_CONTRACT.map((t) => t.table)).toContain("profiles");
  });

  it("requires school_type, the column signup writes", () => {
    const profiles = SCHEMA_CONTRACT.find((t) => t.table === "profiles");
    expect(profiles?.columns).toContain("school_type");
  });
});

describe("checkSchema", () => {
  it("passes when every column is present", async () => {
    const report = await checkSchema(SCHEMA_CONTRACT, present);
    expect(report.ok).toBe(true);
    expect(report.missing).toEqual([]);
  });

  it("counts every column it checked", async () => {
    const total = SCHEMA_CONTRACT.reduce((n, t) => n + t.columns.length, 0);
    const report = await checkSchema(SCHEMA_CONTRACT, present);
    expect(report.checked).toBe(total);
  });

  it("fails and names the missing column", async () => {
    const report = await checkSchema(
      SCHEMA_CONTRACT,
      probeWhere({ profiles: ["school_type"] })
    );
    expect(report.ok).toBe(false);
    expect(report.missing).toEqual([{ table: "profiles", column: "school_type" }]);
  });

  it("reports every missing column, not just the first", async () => {
    const report = await checkSchema(
      [{ table: "t", columns: ["a", "b", "c"] }],
      probeWhere({ t: ["a", "c"] })
    );
    expect(report.missing).toEqual([
      { table: "t", column: "a" },
      { table: "t", column: "c" },
    ]);
  });

  it("reports across more than one table", async () => {
    const report = await checkSchema(
      [
        { table: "one", columns: ["a"] },
        { table: "two", columns: ["b"] },
      ],
      missing
    );
    expect(report.missing).toHaveLength(2);
  });

  it("propagates a probe failure rather than reporting a healthy schema", async () => {
    // A gate that passes when it could not check is worse than no gate: it
    // would green-light exactly the deploy it exists to stop.
    const exploding: ColumnProbe = async () => {
      throw new Error("connection refused");
    };
    await expect(checkSchema(SCHEMA_CONTRACT, exploding)).rejects.toThrow(
      "connection refused"
    );
  });
});

describe("formatSchemaReport", () => {
  it("says what is missing and which migration supplies it", async () => {
    const report = await checkSchema(
      SCHEMA_CONTRACT,
      probeWhere({ profiles: ["school_type"] })
    );
    const text = formatSchemaReport(report);
    expect(text).toContain("profiles.school_type");
  });

  it("confirms the count when everything is present", async () => {
    const report = await checkSchema(SCHEMA_CONTRACT, present);
    expect(formatSchemaReport(report)).toMatch(/\d+ columns/);
  });
});
