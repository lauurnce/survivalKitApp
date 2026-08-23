import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  erasureResidue,
  extractDeletionTargets,
  inventoryIdentityTables,
  privacySummaryLine,
  renderPrivacyTable,
  RETENTION_REGISTER,
  type IdentityTable,
} from "./privacyPosture";
import { buildSchema } from "./migrationSchema";
import type { TableRecord } from "./migrationSchema";

const tableRecord = (name: string, columns: string[]): TableRecord => ({
  name,
  createdIn: "a.sql",
  columns,
  rlsEnabledIn: "a.sql",
  policies: [],
});

describe("inventoryIdentityTables", () => {
  it("finds a table with a user_id column", () => {
    const inventory = inventoryIdentityTables([tableRecord("orders", ["id", "user_id"])]);
    expect(inventory).toEqual([{ table: "orders", identityColumns: ["user_id"] }]);
  });

  it("finds device, email and ip columns", () => {
    const inventory = inventoryIdentityTables([
      tableRecord("orders", ["id", "device_id", "email", "client_ip"]),
    ]);
    expect(inventory[0].identityColumns).toEqual(["device_id", "email", "client_ip"]);
  });

  it("finds a prefixed device column such as rep_device_id", () => {
    const inventory = inventoryIdentityTables([tableRecord("classes", ["rep_device_id"])]);
    expect(inventory[0].identityColumns).toEqual(["rep_device_id"]);
  });

  it("omits a table with no identity column", () => {
    expect(inventoryIdentityTables([tableRecord("modules", ["id", "title"])])).toEqual([]);
  });

  it("does not match a column that merely contains id", () => {
    expect(inventoryIdentityTables([tableRecord("modules", ["id", "subject_id"])])).toEqual([]);
  });

  it("sorts by table name so the output is stable", () => {
    const inventory = inventoryIdentityTables([
      tableRecord("zebra", ["user_id"]),
      tableRecord("apple", ["user_id"]),
    ]);
    expect(inventory.map((row) => row.table)).toEqual(["apple", "zebra"]);
  });
});

describe("extractDeletionTargets", () => {
  it("finds tables passed to a from() call", () => {
    const source = `
      const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
    `;
    expect(extractDeletionTargets(source)).toEqual(["profiles"]);
  });

  it("finds tables passed to a helper call by string literal", () => {
    const source = `
      await unlink("subscriptions");
      await unlink("payments");
    `;
    expect(extractDeletionTargets(source)).toEqual(["payments", "subscriptions"]);
  });

  it("deduplicates and sorts", () => {
    const source = `unlink("orders"); supabase.from("orders"); unlink("apple");`;
    expect(extractDeletionTargets(source)).toEqual(["apple", "orders"]);
  });

  it("accepts single quotes", () => {
    expect(extractDeletionTargets(`unlink('orders')`)).toEqual(["orders"]);
  });

  it("ignores strings that are not plausible table names", () => {
    const source = `unlink("user_id: not a table"); supabase.from("orders");`;
    expect(extractDeletionTargets(source)).toEqual(["orders"]);
  });

  it("returns an empty array for source that touches nothing", () => {
    expect(extractDeletionTargets("export const x = 1;")).toEqual([]);
  });
});

describe("erasureResidue", () => {
  const inventory: IdentityTable[] = [
    { table: "orders", identityColumns: ["user_id"] },
    { table: "receipts", identityColumns: ["user_id"] },
    { table: "signups", identityColumns: ["email"] },
  ];

  it("returns tables holding identity that deletion never touches", () => {
    const residue = erasureResidue(inventory, ["orders"], {});
    expect(residue.map((row) => row.table)).toEqual(["receipts", "signups"]);
  });

  it("excludes a table listed in the retention register", () => {
    const residue = erasureResidue(inventory, ["orders"], {
      receipts: { reason: "dispute resolution", policySection: "Section 7" },
    });
    expect(residue.map((row) => row.table)).toEqual(["signups"]);
  });

  it("returns an empty array when deletion covers everything", () => {
    expect(erasureResidue(inventory, ["orders", "receipts", "signups"], {})).toEqual([]);
  });

  it("carries the identity columns through so the report can name them", () => {
    const residue = erasureResidue(inventory, [], {});
    expect(residue[0].identityColumns).toEqual(["user_id"]);
  });
});

describe("RETENTION_REGISTER", () => {
  it("gives every entry a reason and a policy section", () => {
    for (const [table, entry] of Object.entries(RETENTION_REGISTER)) {
      expect(entry.reason.trim(), `${table} reason`).not.toBe("");
      expect(entry.policySection.trim(), `${table} policySection`).not.toBe("");
    }
  });
});

describe("renderPrivacyTable", () => {
  const inventory: IdentityTable[] = [
    { table: "orders", identityColumns: ["user_id"] },
    { table: "signups", identityColumns: ["email", "device_id"] },
  ];

  it("names the columns", () => {
    const [header] = renderPrivacyTable(inventory, ["orders"], RETENTION_REGISTER).split("\n");
    expect(header).toContain("TABLE");
    expect(header).toContain("IDENTITY");
    expect(header).toContain("ERASURE");
  });

  it("marks a covered table and an uncovered one differently", () => {
    const rendered = renderPrivacyTable(inventory, ["orders"], {});
    expect(rendered).toContain("deleted");
    expect(rendered).toContain("RESIDUE");
  });

  it("marks a retained table as retained rather than residue", () => {
    const rendered = renderPrivacyTable(inventory, [], {
      signups: { reason: "legal", policySection: "Section 7" },
    });
    expect(rendered).toContain("retained");
  });

  it("renders a rule as wide as a body row", () => {
    const [, rule, body] = renderPrivacyTable(inventory, [], {}).split("\n");
    expect(rule.length).toBe(body.length);
  });
});

describe("privacySummaryLine", () => {
  it("reports all clear with no residue", () => {
    expect(privacySummaryLine([{ table: "orders", identityColumns: ["user_id"] }], [])).toBe(
      "PRIVACY       1 identity table · erasure complete"
    );
  });

  it("counts residue tables without naming them", () => {
    const line = privacySummaryLine(
      [
        { table: "orders", identityColumns: ["user_id"] },
        { table: "signups", identityColumns: ["email"] },
      ],
      [{ table: "signups", identityColumns: ["email"] }]
    );
    expect(line).toContain("2 identity tables");
    expect(line).toContain("1 not reached by erasure");
    expect(line).not.toContain("signups");
  });
});

describe("standing assertion: deletion targets still resolve", () => {
  it("finds at least one real table in lib/deleteAccount.ts", () => {
    const repo = join(__dirname, "..", "..");
    const migrationsDir = join(repo, "supabase", "migrations");
    const files = readdirSync(migrationsDir)
      .filter((name) => name.endsWith(".sql"))
      .sort()
      .map((name) => ({ name, sql: readFileSync(join(migrationsDir, name), "utf8") }));

    const known = new Set(buildSchema(files).map((table) => table.name));
    const targets = extractDeletionTargets(
      readFileSync(join(repo, "lib", "deleteAccount.ts"), "utf8")
    ).filter((name) => known.has(name));

    // Asserts the extractor still works, never which tables it covers.
    //
    // extractDeletionTargets over-matches on purpose, which is safe: an extra
    // name produces a missed residue rather than a false one. The failure it
    // cannot survive is the opposite — a rename in lib/deleteAccount.ts that
    // makes it match nothing, after which the residue silently becomes every
    // identity table and the report describes a catastrophe that is really a
    // parser regression. One resolved table is enough to prove it still reads.
    expect(targets.length).toBeGreaterThan(0);
  });
});
