import { describe, it, expect } from "vitest";
import {
  classifyInstallScripts,
  INSTALL_SCRIPT_REGISTER,
  lockfileIntegrity,
  newDirectDependencies,
  renderSupplyChainTable,
  summarizeAudit,
  supplyChainSummaryLine,
} from "./supplyChain";

const auditReport = JSON.stringify({
  auditReportVersion: 2,
  vulnerabilities: {
    "left-pad": { name: "left-pad", severity: "high", isDirect: true, fixAvailable: true },
    "deep-thing": { name: "deep-thing", severity: "low", isDirect: false, fixAvailable: false },
  },
  metadata: {
    vulnerabilities: { info: 0, low: 1, moderate: 0, high: 1, critical: 0, total: 2 },
    dependencies: { prod: 10, dev: 20, total: 30 },
  },
});

describe("summarizeAudit", () => {
  it("returns null counts when the audit did not run", () => {
    const summary = summarizeAudit(null);
    expect(summary.readable).toBe(false);
    expect(summary.counts).toBeNull();
  });

  it("returns null counts for empty output rather than zeroes", () => {
    // A zero here would render as "no known vulnerabilities" — a false
    // all-clear is worse than no reading at all.
    expect(summarizeAudit("").counts).toBeNull();
  });

  it("returns null counts for output that is not JSON", () => {
    expect(summarizeAudit("npm ERR! code ENETUNREACH").counts).toBeNull();
  });

  it("returns null counts when metadata is missing", () => {
    expect(summarizeAudit(JSON.stringify({ auditReportVersion: 2 })).counts).toBeNull();
  });

  it("reads the severity counts from a well-formed report", () => {
    const summary = summarizeAudit(auditReport);
    expect(summary.readable).toBe(true);
    expect(summary.counts).toEqual({ info: 0, low: 1, moderate: 0, high: 1, critical: 0, total: 2 });
  });

  it("names the direct dependencies carrying an advisory", () => {
    expect(summarizeAudit(auditReport).directAdvisories).toEqual(["left-pad"]);
  });

  it("counts how many advisories have a fix available", () => {
    expect(summarizeAudit(auditReport).fixAvailable).toBe(1);
  });
});

describe("classifyInstallScripts", () => {
  const queryOutput = JSON.stringify([
    { name: "esbuild", version: "0.28.1", dev: true },
    { name: "sneaky-pkg", version: "1.0.0", dev: false },
  ]);

  const register = {
    esbuild: { reason: "ships prebuilt binaries", approvedOn: "2026-08-08" },
  };

  it("reports unreadable when the query did not run", () => {
    const report = classifyInstallScripts(null, register);
    expect(report.readable).toBe(false);
    expect(report.approved).toEqual([]);
    expect(report.unapproved).toEqual([]);
  });

  it("reports unreadable for output that is not JSON", () => {
    expect(classifyInstallScripts("not json", register).readable).toBe(false);
  });

  it("puts a registered package in approved", () => {
    expect(classifyInstallScripts(queryOutput, register).approved.map((p) => p.name)).toEqual([
      "esbuild",
    ]);
  });

  it("puts an unregistered package in unapproved", () => {
    expect(classifyInstallScripts(queryOutput, register).unapproved.map((p) => p.name)).toEqual([
      "sneaky-pkg",
    ]);
  });

  it("carries the dev flag through so prod surface can be told apart", () => {
    const report = classifyInstallScripts(queryOutput, register);
    expect(report.unapproved[0].dev).toBe(false);
  });

  it("sorts by name so the output is stable across runs", () => {
    const unsorted = JSON.stringify([
      { name: "zebra", version: "1.0.0", dev: false },
      { name: "apple", version: "1.0.0", dev: false },
    ]);
    expect(classifyInstallScripts(unsorted, {}).unapproved.map((p) => p.name)).toEqual([
      "apple",
      "zebra",
    ]);
  });
});

describe("INSTALL_SCRIPT_REGISTER", () => {
  it("gives every entry a reason and an approval date", () => {
    for (const [name, entry] of Object.entries(INSTALL_SCRIPT_REGISTER)) {
      expect(entry.reason.trim(), `${name} reason`).not.toBe("");
      expect(entry.approvedOn, `${name} approvedOn`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("lockfileIntegrity", () => {
  const lockfile = JSON.stringify({
    lockfileVersion: 3,
    packages: {
      "": { name: "app", version: "0.1.0" },
      "node_modules/a": { version: "1.0.0", resolved: "https://registry.npmjs.org/a", integrity: "sha512-x" },
      "node_modules/b": { version: "2.0.0" },
      "node_modules/c": { version: "3.0.0", resolved: "https://github.com/x/c.git#abc", integrity: "sha512-y" },
      "packages/local": { link: true },
    },
  });

  it("reports unreadable when the lockfile could not be read", () => {
    const report = lockfileIntegrity(null);
    expect(report.readable).toBe(false);
    expect(report.hashed).toBeNull();
  });

  it("reads the lockfile version", () => {
    expect(lockfileIntegrity(lockfile).version).toBe(3);
  });

  it("counts only installable entries, excluding the root and links", () => {
    expect(lockfileIntegrity(lockfile).installable).toBe(3);
  });

  it("counts entries carrying an integrity hash", () => {
    expect(lockfileIntegrity(lockfile).hashed).toBe(2);
  });

  it("counts entries resolved from somewhere other than the public registry", () => {
    expect(lockfileIntegrity(lockfile).nonRegistry).toBe(1);
  });

  it("returns unreadable rather than zeroes when packages is missing", () => {
    expect(lockfileIntegrity(JSON.stringify({ lockfileVersion: 3 })).readable).toBe(false);
  });
});

describe("newDirectDependencies", () => {
  it("reports nothing on a baseline run", () => {
    expect(newDirectDependencies(["a", "b"], null)).toEqual([]);
  });

  it("names a dependency that was not there last run", () => {
    expect(newDirectDependencies(["a", "b"], ["a"])).toEqual(["b"]);
  });

  it("does not report a removed dependency as new", () => {
    expect(newDirectDependencies(["a"], ["a", "b"])).toEqual([]);
  });
});

describe("renderSupplyChainTable", () => {
  const rendered = renderSupplyChainTable(
    summarizeAudit(auditReport),
    classifyInstallScripts(
      JSON.stringify([{ name: "sneaky-pkg", version: "1.0.0", dev: false }]),
      {}
    ),
    lockfileIntegrity(JSON.stringify({ lockfileVersion: 3, packages: { "": {} } }))
  );

  it("has a header naming the columns", () => {
    const [header] = rendered.split("\n");
    expect(header).toContain("CHECK");
    expect(header).toContain("READING");
    expect(header).toContain("STATE");
  });

  it("renders an unreadable check as not read rather than as a zero", () => {
    const unread = renderSupplyChainTable(
      summarizeAudit(null),
      classifyInstallScripts(null, {}),
      lockfileIntegrity(null)
    );
    expect(unread).toContain("not read");
    expect(unread).not.toContain(" 0 ");
  });

  it("renders a rule as wide as a body row", () => {
    const [, rule, body] = rendered.split("\n");
    expect(rule.length).toBe(body.length);
  });
});

describe("supplyChainSummaryLine", () => {
  it("says not read when the audit failed", () => {
    const line = supplyChainSummaryLine(
      summarizeAudit(null),
      classifyInstallScripts(null, {})
    );
    expect(line).toContain("not read");
  });

  it("counts advisories and unapproved install scripts", () => {
    const line = supplyChainSummaryLine(
      summarizeAudit(auditReport),
      classifyInstallScripts(JSON.stringify([{ name: "sneaky-pkg", version: "1.0.0", dev: false }]), {})
    );
    expect(line).toContain("2 advisories");
    expect(line).toContain("1 unapproved install script");
  });
});
