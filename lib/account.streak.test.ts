import { describe, it, expect } from "vitest";
import { activityWindowStartUtc, buildActivityData } from "./account";

// A "day" is a Manila (Asia/Manila, UTC+8, no DST) calendar day.
// events.created_at is timestamptz and comes back from PostgREST as an ISO
// string in UTC, so each event's day is the UTC instant shifted by +8h.
//
// NOW is 2026-10-31 14:00 Manila = 06:00Z, so "today" is 2026-10-31.
const NOW = new Date("2026-10-31T06:00:00Z");
const DAY_MS = 24 * 60 * 60 * 1000;

/** Noon Manila (04:00Z) on the day `n` days before today. */
function daysAgoNoonPH(n: number): string {
  return new Date(Date.parse("2026-10-31T04:00:00Z") - n * DAY_MS).toISOString();
}

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

describe("buildActivityData streaks (Manila calendar days)", () => {
  const cases: {
    name: string;
    daysAgo: number[];
    current: number;
    longest: number;
    total: number;
  }[] = [
    { name: "no activity", daysAgo: [], current: 0, longest: 0, total: 0 },
    { name: "today only", daysAgo: [0], current: 1, longest: 1, total: 1 },
    { name: "yesterday plus today", daysAgo: [0, 1], current: 2, longest: 2, total: 2 },
    { name: "10 consecutive days ending today", daysAgo: range(0, 9), current: 10, longest: 10, total: 10 },
    {
      // Active today and yesterday, gap three days ago, then six days before that.
      name: "a gap breaks both streaks",
      daysAgo: [0, 1, ...range(3, 8)],
      current: 2,
      longest: 6,
      total: 8,
    },
    {
      // Today has no activity yet; the streak is still alive until the day ends.
      name: "streak ending yesterday stays current",
      daysAgo: range(1, 4),
      current: 4,
      longest: 4,
      total: 4,
    },
    {
      name: "last activity two days ago means no current streak",
      daysAgo: range(2, 5),
      current: 0,
      longest: 4,
      total: 4,
    },
    {
      name: "many events on one day count as one active day",
      daysAgo: [0, 0, 0, 1],
      current: 2,
      longest: 2,
      total: 2,
    },
    { name: "every day of the 56-day window", daysAgo: range(0, 55), current: 56, longest: 56, total: 56 },
    { name: "events older than the window are ignored", daysAgo: [56, 57], current: 0, longest: 0, total: 0 },
  ];

  it.each(cases)("$name", ({ daysAgo, current, longest, total }) => {
    const data = buildActivityData(daysAgo.map(daysAgoNoonPH), NOW);
    expect(data.currentStreak).toBe(current);
    expect(data.longestStreak).toBe(longest);
    expect(data.totalActiveDays).toBe(total);
  });
});

describe("buildActivityData day boundaries (Asia/Manila, not UTC)", () => {
  const cases: { name: string; createdAt: string; day: string }[] = [
    // 00:30 Manila on Oct 31 is still Oct 30 in UTC — it must count as Oct 31.
    { name: "just after Manila midnight", createdAt: "2026-10-30T16:30:00Z", day: "2026-10-31" },
    { name: "exactly Manila midnight", createdAt: "2026-10-30T16:00:00Z", day: "2026-10-31" },
    { name: "one second before Manila midnight", createdAt: "2026-10-30T15:59:59Z", day: "2026-10-30" },
    { name: "07:59 Manila", createdAt: "2026-10-30T23:59:00Z", day: "2026-10-31" },
    { name: "Postgres +00:00 offset form", createdAt: "2026-10-30T17:00:00.123456+00:00", day: "2026-10-31" },
  ];

  it.each(cases)("$name lands on $day", ({ createdAt, day }) => {
    const data = buildActivityData([createdAt], NOW);
    const active = data.weeks.flatMap((w) => w.days).filter((d) => d.isActive);
    expect(active.map((d) => d.date)).toEqual([day]);
  });

  it("today is the last day of the 56-day window, even late on a Manila evening", () => {
    // 23:30 Manila on Oct 31 = 15:30Z, same UTC date; and 00:30 Manila Nov 1 = 16:30Z Oct 31.
    for (const [now, today] of [
      ["2026-10-31T15:30:00Z", "2026-10-31"],
      ["2026-10-31T16:30:00Z", "2026-11-01"],
      ["2026-10-30T16:00:00Z", "2026-10-31"],
    ] as const) {
      const days = buildActivityData([], new Date(now)).weeks.flatMap((w) => w.days);
      expect(days).toHaveLength(56);
      expect(days[days.length - 1].date).toBe(today);
    }
  });

  it("a session spanning Manila midnight is a two-day streak", () => {
    const data = buildActivityData(
      ["2026-10-30T15:50:00Z", "2026-10-30T16:10:00Z"], // 23:50 Oct 30 and 00:10 Oct 31 Manila
      NOW
    );
    expect(data.currentStreak).toBe(2);
  });

  it("weeks start on a Manila Monday and cover 56 days in order", () => {
    const data = buildActivityData([], NOW);
    const days = data.weeks.flatMap((w) => w.days.map((d) => d.date));
    expect(days[0]).toBe("2026-09-06");
    expect(new Set(days).size).toBe(56);
    // The first week may be partial; every later week starts on a Monday.
    for (const w of data.weeks.slice(1)) {
      expect(new Date(`${w.weekStart}T00:00:00Z`).getUTCDay()).toBe(1);
    }
  });
});

describe("activityWindowStartUtc", () => {
  it("is Manila midnight 55 days before today, as a UTC instant", () => {
    // Today (Manila) 2026-10-31 → window starts 2026-09-06 00:00 Manila = 2026-09-05T16:00Z.
    expect(activityWindowStartUtc(NOW).toISOString()).toBe("2026-09-05T16:00:00.000Z");
  });
});
