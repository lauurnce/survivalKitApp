import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessExecutors,
  BASELINE_NOT_MECHANISED,
  BASELINE_TASK_COUNT,
  baselineSummaryLine,
  CONTROLS,
  controlsByGroup,
  evaluateControls,
  EXECUTOR_INVENTORY,
  renderControlTable,
  renderExecutorTable,
  staticRouteMatcherDrift,
  type Control,
} from "./securityBaseline";
import { STATIC_CSP_ROUTES, buildStaticCsp } from "../csp";

const control = (overrides: Partial<Control> = {}): Control => ({
  id: "TEST-01",
  group: "BASELINE",
  title: "a test control",
  file: "lib/thing.ts",
  signals: [{ label: "guard", pattern: /\bguardIt\s*\(/ }],
  absentMeans: "the guard would not run",
  ...overrides,
});

describe("evaluateControls", () => {
  it("reports a control whose signals are all present", () => {
    const [result] = evaluateControls({ "lib/thing.ts": "guardIt();" }, [control()]);
    expect(result.state).toBe("present");
    expect(result.missingSignals).toEqual([]);
  });

  it("reports a control with a missing signal and names which one", () => {
    const [result] = evaluateControls({ "lib/thing.ts": "nothing here" }, [control()]);
    expect(result.state).toBe("MISSING");
    expect(result.missingSignals).toEqual(["guard"]);
  });

  it("requires every signal, not merely one", () => {
    const two = control({
      signals: [
        { label: "a", pattern: /\baaa\b/ },
        { label: "b", pattern: /\bbbb\b/ },
      ],
    });
    const [result] = evaluateControls({ "lib/thing.ts": "aaa" }, [two]);
    expect(result.state).toBe("MISSING");
    expect(result.missingSignals).toEqual(["b"]);
  });

  it("reports unknown when the file could not be read", () => {
    const [result] = evaluateControls({ "lib/thing.ts": null }, [control()]);
    expect(result.state).toBe("unknown");
  });

  it("reports unknown when the file is absent from the source map entirely", () => {
    const [result] = evaluateControls({}, [control()]);
    expect(result.state).toBe("unknown");
  });

  it("never reports unknown as present, even with no signals left to check", () => {
    const [result] = evaluateControls({}, [control({ signals: [] })]);
    expect(result.state).toBe("unknown");
  });

  it("ignores a signal matched only inside a comment", () => {
    const [result] = evaluateControls({ "lib/thing.ts": "// guardIt() used to be here" }, [
      control(),
    ]);
    expect(result.state).toBe("MISSING");
  });

  it("preserves registry order so the table is stable across runs", () => {
    const results = evaluateControls({ "lib/thing.ts": "guardIt();" }, [
      control({ id: "B" }),
      control({ id: "A" }),
    ]);
    expect(results.map((r) => r.control.id)).toEqual(["B", "A"]);
  });
});

describe("evaluateControls with an absent signal", () => {
  const forbidden = control({
    signals: [{ label: "no unsafe-inline", pattern: /unsafe-inline/, absent: true }],
  });

  it("is present when the forbidden pattern is missing", () => {
    expect(evaluateControls({ "lib/thing.ts": "safe" }, [forbidden])[0].state).toBe("present");
  });

  it("is MISSING when the forbidden pattern reappears", () => {
    expect(evaluateControls({ "lib/thing.ts": "unsafe-inline" }, [forbidden])[0].state).toBe(
      "MISSING"
    );
  });
});

describe("evaluateControls across two files", () => {
  const spanning = control({
    signals: [
      { label: "node side", pattern: /nodeVerify/ },
      { label: "edge side", pattern: /edgeVerify/, file: "middleware.ts" },
    ],
  });

  it("is present when both files carry their signal", () => {
    const sources = { "lib/thing.ts": "nodeVerify()", "middleware.ts": "edgeVerify()" };
    expect(evaluateControls(sources, [spanning])[0].state).toBe("present");
  });

  it("is unknown when either file could not be read", () => {
    const sources = { "lib/thing.ts": "nodeVerify()", "middleware.ts": null };
    expect(evaluateControls(sources, [spanning])[0].state).toBe("unknown");
  });
});

describe("CONTROLS registry shape", () => {
  it("gives every control a unique id", () => {
    const ids = CONTROLS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every control at least one signal", () => {
    for (const c of CONTROLS) expect(c.signals.length, c.id).toBeGreaterThan(0);
  });

  it("gives every control an absentMeans describing a lost capability", () => {
    for (const c of CONTROLS) expect(c.absentMeans.trim(), c.id).not.toBe("");
  });

  it("never writes an exploit instruction into absentMeans", () => {
    // Disclosure discipline rule 2: absentMeans says what capability is lost,
    // never how to take it. This is a crude tripwire, not a proof — its job is
    // to make an implementer stop and think before adding a how-to.
    const INSTRUCTIONAL = /\b(curl|POST |payload|proof of concept|bypass by|simply send)\b/i;
    for (const c of CONTROLS) expect(INSTRUCTIONAL.test(c.absentMeans), c.id).toBe(false);
  });
});

describe("baseline provenance", () => {
  it("gives every BASELINE control a baselineTask number", () => {
    for (const c of controlsByGroup(CONTROLS, "BASELINE")) {
      expect(typeof c.baselineTask, c.id).toBe("number");
    }
  });

  it("accounts for every task in the June baseline plan", () => {
    const covered = new Set(
      controlsByGroup(CONTROLS, "BASELINE").map((c) => c.baselineTask as number)
    );
    const uncovered: number[] = [];
    for (let task = 1; task <= BASELINE_TASK_COUNT; task += 1) {
      if (!covered.has(task) && !(task in BASELINE_NOT_MECHANISED)) uncovered.push(task);
    }
    // A baseline task with neither a control nor a recorded reason has been
    // silently dropped, which is the one thing a baseline must not allow.
    expect(uncovered).toEqual([]);
  });

  it("gives every not-mechanised task a reason", () => {
    for (const [task, reason] of Object.entries(BASELINE_NOT_MECHANISED)) {
      expect(reason.trim(), `task ${task}`).not.toBe("");
    }
  });
});

describe("controlsByGroup", () => {
  it("returns only the requested group", () => {
    const mixed = [control({ id: "A" }), control({ id: "B", group: "PAYMENT" })];
    expect(controlsByGroup(mixed, "PAYMENT").map((c) => c.id)).toEqual(["B"]);
  });
});

describe("assessExecutors", () => {
  it("has an entry for every executor in the inventory", () => {
    const results = assessExecutors(evaluateControls({}, CONTROLS));
    expect(results).toHaveLength(EXECUTOR_INVENTORY.length);
  });

  it("references only control ids that exist", () => {
    const ids = new Set(CONTROLS.map((c) => c.id));
    for (const executor of EXECUTOR_INVENTORY) {
      for (const id of executor.boundBy) expect(ids.has(id), `${executor.id} → ${id}`).toBe(true);
    }
  });

  it("gives every executor at least one bound", () => {
    for (const executor of EXECUTOR_INVENTORY) {
      expect(executor.boundBy.length, executor.id).toBeGreaterThan(0);
    }
  });

  it("counts an executor's holding bounds separately from its total", () => {
    const results = assessExecutors([
      {
        control: control({ id: "EXEC-TEST" }),
        state: "present",
        missingSignals: [],
      },
    ], [{ id: "x", language: "Test", runtime: "test", boundBy: ["EXEC-TEST"] }]);
    expect(results[0].holding).toBe(1);
    expect(results[0].total).toBe(1);
  });
});

describe("renderControlTable", () => {
  const results = evaluateControls({ "lib/thing.ts": "guardIt();" }, [
    control({ id: "A-01" }),
    control({ id: "A-02", signals: [{ label: "absent thing", pattern: /nope/ }] }),
  ]);

  it("has a header naming the columns", () => {
    const [header] = renderControlTable(results).split("\n");
    expect(header).toContain("CONTROL");
    expect(header).toContain("GROUP");
    expect(header).toContain("STATE");
  });

  it("names every control it was given", () => {
    const rendered = renderControlTable(results);
    expect(rendered).toContain("A-01");
    expect(rendered).toContain("A-02");
  });

  it("renders a rule as wide as a body row", () => {
    const [, rule, body] = renderControlTable(results).split("\n");
    expect(rule.length).toBe(body.length);
  });
});

describe("renderExecutorTable", () => {
  it("names each executor and its bound count", () => {
    const rendered = renderExecutorTable(assessExecutors(evaluateControls({}, CONTROLS)));
    for (const executor of EXECUTOR_INVENTORY) expect(rendered).toContain(executor.language);
  });
});

describe("baselineSummaryLine", () => {
  it("reports all clear when every control holds", () => {
    const results = evaluateControls({ "lib/thing.ts": "guardIt();" }, [control()]);
    expect(baselineSummaryLine(results)).toBe("CONTROLS      1/1 holding · none missing, none unknown");
  });

  it("counts missing and unknown separately", () => {
    const results = evaluateControls({ "lib/thing.ts": "guardIt();", "lib/gone.ts": null }, [
      control({ id: "A" }),
      control({ id: "B", signals: [{ label: "x", pattern: /nope/ }] }),
      control({ id: "C", file: "lib/gone.ts" }),
    ]);
    expect(baselineSummaryLine(results)).toContain("1 missing");
    expect(baselineSummaryLine(results)).toContain("1 unknown");
  });
});

describe("standing assertion: the registry points at files that exist", () => {
  const REPO = join(__dirname, "..", "..");

  const filesFor = (c: Control): string[] => [
    c.file,
    ...c.signals.map((signal) => signal.file).filter((file): file is string => Boolean(file)),
  ];

  it("has no control naming a file that is not in the repository", () => {
    const missing: string[] = [];
    for (const c of CONTROLS) {
      for (const file of filesFor(c)) {
        if (!existsSync(join(REPO, file))) missing.push(`${c.id} → ${file}`);
      }
    }
    // A control pointing at a file that no longer exists is either a stale
    // registry entry or a control deleted along with its file. Those need a
    // human to tell apart, so the suite stops here rather than reporting
    // `unknown` every week forever.
    expect(missing).toEqual([]);
  });

  it("has no control in the MISSING state against the live repository", () => {
    const sources: Record<string, string | null> = {};
    for (const c of CONTROLS) {
      for (const file of filesFor(c)) {
        if (file in sources) continue;
        try {
          sources[file] = readFileSync(join(REPO, file), "utf8");
        } catch {
          sources[file] = null;
        }
      }
    }

    // Asserts absence, so a passing run publishes nothing. A failing run names
    // a control id locally and is a finding for the private report.
    const missing = evaluateControls(sources, CONTROLS)
      .filter((result) => result.state === "MISSING")
      .map((result) => result.control.id);

    expect(missing).toEqual([]);
  });
});

describe("evaluateControls with a verify check", () => {
  it("is present when the check returns no failures", () => {
    const [result] = evaluateControls({ "lib/thing.ts": "guardIt();" }, [control({ verify: () => [] })]);
    expect(result.state).toBe("present");
  });

  it("is MISSING and names the failures the check returns", () => {
    const [result] = evaluateControls({ "lib/thing.ts": "guardIt();" }, [
      control({ verify: () => ["drift A"] }),
    ]);
    expect(result).toMatchObject({ state: "MISSING", missingSignals: ["drift A"] });
  });

  it("is MISSING rather than crashing when the check throws", () => {
    const [result] = evaluateControls({ "lib/thing.ts": "guardIt();" }, [
      control({
        verify: () => {
          throw new Error("bad");
        },
      }),
    ]);
    expect(result.state).toBe("MISSING");
    expect(result.missingSignals).toEqual(["TEST-01 check could not run"]);
  });

  it("is unknown, and never runs the check, when the file could not be read", () => {
    let ran = false;
    const [result] = evaluateControls({ "lib/thing.ts": null }, [
      control({
        verify: () => {
          ran = true;
          return [];
        },
      }),
    ]);
    expect(result.state).toBe("unknown");
    expect(ran).toBe(false);
  });
});

describe("staticRouteMatcherDrift", () => {
  const routes = [
    { path: "/", prefix: false },
    { path: "/faq", prefix: false },
    { path: "/year", prefix: true },
  ];
  const proxyWith = (matcher: string) =>
    `export const config = {\n  matcher: [\n    ${JSON.stringify(matcher)},\n  ],\n};`;
  const GOOD = "/((?!_next/static|$|(?:faq|year)$|year/).*)";

  it("holds when the matcher skips exactly the static routes", () => {
    expect(staticRouteMatcherDrift(proxyWith(GOOD), routes)).toEqual([]);
  });

  it("flags a static route the proxy still runs on", () => {
    const drift = staticRouteMatcherDrift(proxyWith("/((?!_next/static|$|(?:year)$|year/).*)"), routes);
    expect(drift).toContain("proxy runs on static /faq");
  });

  it("flags a prefix route whose children still reach the proxy", () => {
    const drift = staticRouteMatcherDrift(proxyWith("/((?!_next/static|$|(?:faq|year)$).*)"), routes);
    expect(drift).toContain("proxy runs below static /year");
  });

  it("flags a matcher that excludes by prefix and so skips a non-static near-miss", () => {
    const drift = staticRouteMatcherDrift(proxyWith("/((?!_next/static|$|faq|year).*)"), routes);
    expect(drift).toEqual(
      expect.arrayContaining(["proxy skips non-static /faqx", "proxy skips non-static /faq/extra"])
    );
  });

  it("flags a matcher that skips a route the proxy must guard", () => {
    const drift = staticRouteMatcherDrift(proxyWith("/((?!_next/static|$|(?:faq|year|admin)$|year/|admin/).*)"), routes);
    expect(drift).toEqual(expect.arrayContaining(["proxy skips /admin", "proxy skips /admin/login"]));
  });

  it("reports a missing matcher instead of passing", () => {
    expect(staticRouteMatcherDrift("export const config = {};", routes)).toEqual([
      "matcher string not found",
    ]);
  });

  it("holds against the live proxy.ts and STATIC_CSP_ROUTES", () => {
    const source = readFileSync(join(__dirname, "..", "..", "proxy.ts"), "utf8");
    expect(staticRouteMatcherDrift(source, STATIC_CSP_ROUTES)).toEqual([]);
  });
});

describe("static-page CSP (the policy EXEC-07 guards)", () => {
  const directives = new Map(
    buildStaticCsp(false)
      .split(";")
      .map((d) => d.trim().split(/\s+/))
      .map(([name, ...values]) => [name, values.join(" ")] as const)
  );

  it.each([
    ["script-src-attr", "'none'"],
    ["object-src", "'none'"],
    ["frame-ancestors", "'none'"],
    ["base-uri", "'self'"],
    ["form-action", "'self'"],
  ])("keeps %s %s", (name, value) => {
    expect(directives.get(name)).toBe(value);
  });

  it("keeps script-src to self and named hosts, with no trust propagation", () => {
    const scriptSrc = directives.get("script-src") ?? "";
    expect(scriptSrc).not.toContain("'strict-dynamic'");
    expect(scriptSrc.split(" ")).not.toEqual(expect.arrayContaining(["*", "https:", "http:", "data:"]));
  });

  it("reports EXEC-07 MISSING when a hard edge is loosened", () => {
    const csp = readFileSync(join(__dirname, "..", "csp.ts"), "utf8");
    const config = readFileSync(join(__dirname, "..", "..", "next.config.ts"), "utf8");
    const exec07 = CONTROLS.filter((c) => c.id === "EXEC-07");
    const loosened = csp.replace(`"object-src 'none'"`, `"object-src 'self'"`);
    const [result] = evaluateControls({ "lib/csp.ts": loosened, "next.config.ts": config }, exec07);
    expect(result).toMatchObject({ state: "MISSING", missingSignals: ["plugins blocked"] });
  });
});
