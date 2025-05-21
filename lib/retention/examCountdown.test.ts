import { describe, expect, it } from "vitest";
import type { TermWindow } from "@/lib/reports/academicCalendar";
import { countdownDetail, countdownHeadline, nextExamWindow, shortDate } from "./examCountdown";

const CAL: TermWindow[] = [
  { phase: "classes", startPhDate: "2026-10-11", endPhDate: "2026-12-08" },
  { phase: "finals", startPhDate: "2026-12-09", endPhDate: "2026-12-19", note: "confirmed" },
  { phase: "break", startPhDate: "2026-12-20", endPhDate: "2027-01-04" },
  { phase: "midterms", startPhDate: "2027-03-01", endPhDate: "2027-03-06", note: "ESTIMATE: week 9" },
];

// 2026-10-31 10:00 in Manila.
const at = (iso: string) => new Date(`${iso}+08:00`);

describe("nextExamWindow", () => {
  it("counts PH calendar days to the next finals", () => {
    expect(nextExamWindow(at("2026-10-31T10:00:00"), CAL)).toMatchObject({
      phase: "finals",
      daysUntil: 39,
      inProgress: false,
      estimate: false,
    });
  });

  it("uses the Manila date, not UTC, near midnight", () => {
    // 00:30 Dec 8 in Manila is still Dec 7 in UTC.
    expect(nextExamWindow(at("2026-12-08T00:30:00"), CAL)?.daysUntil).toBe(1);
  });

  it("reports a running exam week", () => {
    expect(nextExamWindow(at("2026-12-12T09:00:00"), CAL)).toMatchObject({ inProgress: true, daysUntil: 0 });
  });

  it("stays quiet when the next exams are past the horizon", () => {
    expect(nextExamWindow(at("2026-12-25T09:00:00"), CAL)).toBeNull();
    expect(nextExamWindow(at("2026-10-31T10:00:00"), CAL, 30)).toBeNull();
  });

  it("marks estimated windows", () => {
    expect(nextExamWindow(at("2027-02-20T09:00:00"), CAL)).toMatchObject({ phase: "midterms", estimate: true });
  });

  it("is null after the calendar runs out", () => {
    expect(nextExamWindow(at("2028-01-01T09:00:00"), CAL)).toBeNull();
  });

  it("finds the real calendar's December finals", () => {
    expect(nextExamWindow(at("2026-11-24T09:00:00"))).toMatchObject({ phase: "finals", startPhDate: "2026-12-09", daysUntil: 15 });
  });
});

describe("copy", () => {
  const base = { phase: "finals" as const, startPhDate: "2026-12-09", endPhDate: "2026-12-19", estimate: false };

  it("words the headline by distance", () => {
    expect(countdownHeadline({ ...base, daysUntil: 39, inProgress: false })).toBe("Finals start in 39 days");
    expect(countdownHeadline({ ...base, daysUntil: 1, inProgress: false })).toBe("Finals start tomorrow");
    expect(countdownHeadline({ ...base, daysUntil: 0, inProgress: true })).toBe("Finals week");
  });

  it("hedges estimated dates", () => {
    expect(countdownDetail({ ...base, daysUntil: 3, inProgress: false })).toMatch(/^Dec 9–Dec 19 on the August school calendar \(UP, USTP\)/);
    expect(countdownDetail({ ...base, estimate: true, daysUntil: 3, inProgress: false })).toMatch(/^Around Dec 9–Dec 19/);
  });

  it("formats short dates", () => {
    expect(shortDate("2027-01-05")).toBe("Jan 5");
  });
});
