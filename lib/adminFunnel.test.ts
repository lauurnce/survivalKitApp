import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { ADMIN_FUNNEL_STEPS, DEAD_EVENT_TYPES } from "./adminFunnel";

const REPO_ROOT = join(__dirname, "..");
// "lib" is included alongside app/components because section_view is emitted
// through a debounced wrapper (lib/analytics.ts logSectionView) rather than a
// direct logEvent(...) call at the component call site — the wrapper is the
// actual emission point and scanning only app/components misses it, which
// would make this test permanently fail against correct code.
const SCAN_DIRS = ["app", "components", "lib"];

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...sourceFiles(full));
    } else if (/\.tsx?$/.test(name) && !name.includes(".test.")) {
      out.push(full);
    }
  }
  return out;
}

const allSource = SCAN_DIRS.flatMap((d) => sourceFiles(join(REPO_ROOT, d)))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

/**
 * An event type is "emitted" if some component either calls logEvent with it
 * or hands it to <PageTracker event="..." />. Those are the only two ways an
 * event reaches app/api/events/route.ts.
 */
function isEmitted(type: string): boolean {
  return (
    allSource.includes(`logEvent("${type}"`) ||
    allSource.includes(`event="${type}"`)
  );
}

describe("ADMIN_FUNNEL_STEPS", () => {
  it("contains no dead event type", () => {
    for (const dead of DEAD_EVENT_TYPES) {
      expect(ADMIN_FUNNEL_STEPS.map((s) => s.type)).not.toContain(dead);
    }
  });

  it("has every step actually emitted by application code", () => {
    // This is the regression test for the bug being fixed: unlock_click and
    // unlock_submitted sat in this list for months, emitted by nothing, showing
    // two counts that could never move.
    const notEmitted = ADMIN_FUNNEL_STEPS.map((s) => s.type).filter((t) => !isEmitted(t));
    expect(notEmitted).toEqual([]);
  });

  it("includes the live paywall steps the dashboard used to stop short of", () => {
    const types = ADMIN_FUNNEL_STEPS.map((s) => s.type);
    expect(types).toContain("paywall_teaser_view");
    expect(types).toContain("paywall_teaser_click");
    expect(types).toContain("subscribe_click");
  });

  it("starts at enter and ends at subscribe_click", () => {
    expect(ADMIN_FUNNEL_STEPS[0].type).toBe("enter");
    expect(ADMIN_FUNNEL_STEPS.at(-1)!.type).toBe("subscribe_click");
  });

  it("gives every step a label and a hint", () => {
    for (const step of ADMIN_FUNNEL_STEPS) {
      expect(step.label.trim().length).toBeGreaterThan(0);
      expect(step.hint.trim().length).toBeGreaterThan(0);
    }
  });

  it("has no duplicate step types", () => {
    const types = ADMIN_FUNNEL_STEPS.map((s) => s.type);
    expect(new Set(types).size).toBe(types.length);
  });
});

describe("DEAD_EVENT_TYPES", () => {
  it("names the two pre-pivot types", () => {
    expect([...DEAD_EVENT_TYPES].sort()).toEqual(["unlock_click", "unlock_submitted"]);
  });

  it("confirms nothing emits them, so the list stays honest", () => {
    for (const dead of DEAD_EVENT_TYPES) {
      expect(isEmitted(dead)).toBe(false);
    }
  });
});
