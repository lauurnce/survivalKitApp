import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  TERM_SCHEDULE,
  SCHEDULE_RUNWAY_DAYS,
  termForPurchase,
  semesterAccessEndFor,
  scheduleHorizon,
  daysUntilScheduleEnds,
  scheduleProblems,
  shortPhDate,
  longPhDate,
  semesterUntilLabel,
  type Term,
} from "./terms";

const ph = (date: string, time = "00:00:00") => new Date(`${date}T${time}+08:00`);

describe("TERM_SCHEDULE", () => {
  it("is structurally sound", () => {
    expect(scheduleProblems()).toEqual([]);
  });

  // ── The rollover tripwire. ──────────────────────────────────────────────────
  // Uses the real clock on purpose: this is the test that goes red on its own
  // once the last scheduled term is within SCHEDULE_RUNWAY_DAYS of ending, so
  // CI blocks every PR until the next term is added. Without it, purchases
  // after the last term would silently fall back to a 31-day pass.
  it(`schedules the next term at least ${SCHEDULE_RUNWAY_DAYS} days before the last one ends`, () => {
    const days = daysUntilScheduleEnds(new Date());
    const last = TERM_SCHEDULE[TERM_SCHEDULE.length - 1];
    expect(
      days,
      `TERM_SCHEDULE runs out in ${days} days (${last.id} ends ${last.accessEndsAt}). ` +
        `Add the next term to lib/terms.ts — see docs/runbooks/semester-rollover.md.`
    ).toBeGreaterThan(SCHEDULE_RUNWAY_DAYS);
  });

  it("keeps AY 2026-27 1st sem ending Jan 31, 2027 23:59 PH (past PUP's mid-January finals)", () => {
    expect(TERM_SCHEDULE[0].accessEndsAt).toBe("2027-01-31T15:59:59Z");
  });

  it("ends AY 2026-27 2nd sem after PUP's ~Jun 15-21 finals", () => {
    const sem2 = TERM_SCHEDULE.find((t) => t.id === "ay2026-27-sem2")!;
    expect(new Date(sem2.accessEndsAt).getTime()).toBeGreaterThan(ph("2027-06-21", "23:59:59").getTime());
    expect(sem2.accessEndsAt).toBe("2027-06-30T15:59:59Z");
  });
});

describe("termForPurchase", () => {
  it.each([
    ["2026-08-10", "ay2026-27-sem1"],
    ["2026-12-31", "ay2026-27-sem1"],
    ["2027-01-01", "ay2026-27-sem2"], // rolls over at PH midnight
    ["2027-01-28", "ay2026-27-sem2"], // renewal from the expiry warning
    ["2027-02-09", "ay2026-27-sem2"], // PUP 2nd sem start
    ["2027-05-31", "ay2026-27-sem2"],
    ["2027-06-01", "ay2026-27-midyear"],
    ["2027-07-15", "ay2026-27-midyear"],
  ])("a purchase on %s (PH) belongs to %s", (date, id) => {
    expect(termForPurchase(ph(date))?.id).toBe(id);
  });

  it("rolls over at PH midnight, not UTC midnight", () => {
    expect(termForPurchase(ph("2026-12-31", "23:59:59"))?.id).toBe("ay2026-27-sem1");
    expect(termForPurchase(new Date("2026-12-31T16:00:00Z"))?.id).toBe("ay2026-27-sem2");
  });

  it("returns null before the schedule starts and after it runs out", () => {
    expect(termForPurchase(ph("2026-05-01"))).toBeNull();
    expect(termForPurchase(new Date("2027-07-31T15:59:59Z"))).toBeNull();
    expect(termForPurchase(ph("2027-09-01"))).toBeNull();
  });

  it("maps a purchase to its term's access end", () => {
    expect(semesterAccessEndFor(ph("2026-11-01"))?.toISOString()).toBe("2027-01-31T15:59:59.000Z");
    expect(semesterAccessEndFor(ph("2027-01-05"))?.toISOString()).toBe("2027-06-30T15:59:59.000Z");
    expect(semesterAccessEndFor(ph("2027-09-01"))).toBeNull();
  });
});

describe("scheduleProblems", () => {
  const base: Term = {
    id: "a",
    label: "A",
    purchasableFrom: "2030-01-01T00:00:00+08:00",
    accessEndsAt: "2030-06-30T15:59:59Z",
    why: "",
  };

  it("flags a purchase gap between terms", () => {
    const gap: Term = { ...base, id: "b", purchasableFrom: "2030-08-01T00:00:00+08:00", accessEndsAt: "2030-12-31T15:59:59Z" };
    expect(scheduleProblems([base, gap]).join()).toMatch(/purchase gap/);
  });

  it("flags an end that is not 23:59:59 PH", () => {
    expect(scheduleProblems([{ ...base, accessEndsAt: "2030-06-30T23:59:59Z" }]).join()).toMatch(/23:59:59 PH/);
  });

  it("flags out-of-order and duplicate terms", () => {
    const earlier: Term = { ...base, id: "a", purchasableFrom: "2029-12-01T00:00:00+08:00" };
    const problems = scheduleProblems([base, earlier]).join();
    expect(problems).toMatch(/duplicate id/);
    expect(problems).toMatch(/out of order/);
  });

  it("reports the horizon as the last access end", () => {
    expect(scheduleHorizon([base]).toISOString()).toBe("2030-06-30T15:59:59.000Z");
    expect(daysUntilScheduleEnds(new Date("2030-06-20T15:59:59Z"), [base])).toBe(10);
  });
});

describe("PH date labels", () => {
  it("formats in PH time regardless of the host timezone", () => {
    expect(shortPhDate(new Date("2027-01-31T15:59:59Z"))).toBe("Jan 31");
    expect(longPhDate(new Date("2027-06-30T15:59:59Z"))).toBe("June 30, 2027");
    // 16:30Z is already the next day in Manila.
    expect(shortPhDate(new Date("2027-01-31T16:30:00Z"))).toBe("Feb 1");
  });

  it("quotes the end the webhook would grant right now", () => {
    expect(semesterUntilLabel(ph("2026-11-15"))).toBe("Jan 31");
    expect(semesterUntilLabel(ph("2027-01-02"))).toBe("Jun 30");
    expect(semesterUntilLabel(ph("2027-06-02"))).toBe("Jul 31");
    expect(semesterUntilLabel(ph("2027-09-01"))).toBe("the end of the semester");
  });
});

// ── Single source: no surface may hand-type a term end. ─────────────────────
// The old SEMESTER_END needed a matching "until Jan 31" typed into two plan
// components and a reminder comment to change them together. These surfaces
// now read semesterUntilLabel; a hand-typed date coming back is drift.
describe("plan copy derives the access end from the schedule", () => {
  const SURFACES = ["components/SubscribeGate.tsx", "components/account/SubscribeModals.tsx"];
  const HAND_TYPED = /until (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d/;

  it.each(SURFACES)("%s quotes semesterUntilLabel, not a typed date", (path) => {
    const text = readFileSync(join(process.cwd(), path), "utf8");
    expect(text).toMatch(/semesterUntilLabel\(/);
    expect(text).not.toMatch(HAND_TYPED);
  });

  it("leaves no SEMESTER_END constant behind in the payment path", () => {
    for (const path of ["lib/paymongo.ts", "app/api/webhooks/paymongo/route.ts", "app/api/subscribe/route.ts"]) {
      expect(readFileSync(join(process.cwd(), path), "utf8"), path).not.toMatch(/\bSEMESTER_END\b/);
    }
  });
});
