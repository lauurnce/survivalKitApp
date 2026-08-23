import { describe, it, expect } from "vitest";
import {
  assessDetection,
  detectionSummaryLine,
  DETECTION_MATRIX,
  renderDetectionTable,
  type DetectionEntry,
} from "./detectionCoverage";

const entry = (overrides: Partial<DetectionEntry> = {}): DetectionEntry => ({
  id: "T1",
  escalation: "a bad thing happens",
  wouldShow: "an error is logged",
  probes: [{ label: "logs", pattern: /console\.error/, file: "lib/thing.ts" }],
  ...overrides,
});

describe("assessDetection", () => {
  it("rates an entry with every probe holding as covered", () => {
    const [result] = assessDetection({ "lib/thing.ts": "console.error('x')" }, [entry()]);
    expect(result.coverage).toBe("covered");
  });

  it("rates an entry with no probe holding as BLIND", () => {
    const [result] = assessDetection({ "lib/thing.ts": "silent()" }, [entry()]);
    expect(result.coverage).toBe("BLIND");
  });

  it("rates an entry with some probes holding as partial", () => {
    const two = entry({
      probes: [
        { label: "a", pattern: /console\.error/, file: "lib/thing.ts" },
        { label: "b", pattern: /alerting/, file: "lib/thing.ts" },
      ],
    });
    const [result] = assessDetection({ "lib/thing.ts": "console.error('x')" }, [two]);
    expect(result.coverage).toBe("partial");
    expect(result.missingProbes).toEqual(["b"]);
  });

  it("rates an entry as unknown when a probe's file could not be read", () => {
    expect(assessDetection({ "lib/thing.ts": null }, [entry()])[0].coverage).toBe("unknown");
  });

  it("rates an entry as unknown when a probe's file is absent entirely", () => {
    expect(assessDetection({}, [entry()])[0].coverage).toBe("unknown");
  });

  it("rates a recorded blind spot as BLIND regardless of sources", () => {
    const blind = entry({ probes: [], blindReason: "nothing watches this" });
    expect(assessDetection({ "lib/thing.ts": "console.error('x')" }, [blind])[0].coverage).toBe(
      "BLIND"
    );
  });

  it("preserves matrix order so the table reads the same every run", () => {
    const results = assessDetection({ "lib/thing.ts": "console.error('x')" }, [
      entry({ id: "B" }),
      entry({ id: "A" }),
    ]);
    expect(results.map((r) => r.entry.id)).toEqual(["B", "A"]);
  });
});

describe("DETECTION_MATRIX", () => {
  it("has one row per P0 in the charter's escalation list", () => {
    expect(DETECTION_MATRIX).toHaveLength(6);
  });

  it("gives every row a unique id", () => {
    const ids = DETECTION_MATRIX.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every row an escalation and a signal", () => {
    for (const row of DETECTION_MATRIX) {
      expect(row.escalation.trim(), row.id).not.toBe("");
      expect(row.wouldShow.trim(), row.id).not.toBe("");
    }
  });

  it("gives a probe-less row an explicit blindReason", () => {
    // A row with neither probes nor a recorded reason is an unanswered
    // question wearing the costume of an answer.
    for (const row of DETECTION_MATRIX) {
      if (row.probes.length === 0) expect(row.blindReason?.trim(), row.id).toBeTruthy();
    }
  });

  it("names a file for every probe", () => {
    for (const row of DETECTION_MATRIX) {
      for (const probe of row.probes) expect(probe.file.trim(), `${row.id}/${probe.label}`).not.toBe("");
    }
  });
});

describe("renderDetectionTable", () => {
  const results = assessDetection({ "lib/thing.ts": "console.error('x')" }, [
    entry({ id: "T1" }),
    entry({ id: "T2", probes: [], blindReason: "nothing watches this" }),
  ]);

  it("has a header naming the columns", () => {
    const [header] = renderDetectionTable(results).split("\n");
    expect(header).toContain("ESCALATION");
    expect(header).toContain("WOULD SHOW");
    expect(header).toContain("COVERAGE");
  });

  it("marks a blind row distinctly", () => {
    expect(renderDetectionTable(results)).toContain("BLIND");
  });

  it("renders a rule as wide as a body row", () => {
    const [, rule, body] = renderDetectionTable(results).split("\n");
    expect(rule.length).toBe(body.length);
  });
});

describe("detectionSummaryLine", () => {
  it("reports full coverage when every escalation has a signal", () => {
    const results = assessDetection({ "lib/thing.ts": "console.error('x')" }, [entry()]);
    expect(detectionSummaryLine(results)).toBe("DETECTION     1/1 escalations covered · 0 blind");
  });

  it("counts blind and partial rows", () => {
    const results = assessDetection({ "lib/thing.ts": "console.error('x')" }, [
      entry({ id: "A" }),
      entry({ id: "B", probes: [], blindReason: "nothing watches this" }),
      entry({
        id: "C",
        probes: [
          { label: "a", pattern: /console\.error/, file: "lib/thing.ts" },
          { label: "b", pattern: /alerting/, file: "lib/thing.ts" },
        ],
      }),
    ]);
    const line = detectionSummaryLine(results);
    expect(line).toContain("1 blind");
    expect(line).toContain("1 partial");
  });
});
