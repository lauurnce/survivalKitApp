import { describe, it, expect, vi, beforeEach } from "vitest";

// GT-26: the activity query must read newest first and page past PostgREST's
// 1000-row cap, so an active reader's most recent days are never the ones cut.

interface Call { order?: { column: string; ascending: boolean }; range?: [number, number]; gte?: string }
const calls: Call[] = [];
let rows: { created_at: string }[] = [];

function eventsQuery() {
  const call: Call = {};
  calls.push(call);
  const q = {
    select: () => q,
    eq: () => q,
    gte: (_c: string, v: string) => { call.gte = v; return q; },
    order: (column: string, opts: { ascending: boolean }) => { call.order = { column, ascending: opts.ascending }; return q; },
    range: (from: number, to: number) => {
      call.range = [from, to];
      // Mimic PostgREST's max-rows cap of 1000 per request.
      const sorted = [...rows].sort((a, b) =>
        call.order?.ascending === false ? b.created_at.localeCompare(a.created_at) : a.created_at.localeCompare(b.created_at),
      );
      return Promise.resolve({ data: sorted.slice(from, Math.min(to + 1, from + 1000)), error: null });
    },
  };
  return q;
}

vi.mock("./supabase/server", () => ({
  createServerClient: () => ({ from: () => eventsQuery() }),
}));

import { getActivityData } from "./account";

describe("getActivityData query", () => {
  beforeEach(() => {
    calls.length = 0;
    rows = [];
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-31T06:00:00Z")); // 14:00 Manila
  });

  it("orders newest first", async () => {
    rows = [{ created_at: "2026-10-31T04:00:00Z" }];
    await getActivityData("11111111-1111-4111-8111-111111111111");
    expect(calls[0].order).toEqual({ column: "created_at", ascending: false });
  });

  it("keeps today's activity when the window holds more than 1000 events", async () => {
    // 1500 events on an old day in the window, then one today.
    rows = Array.from({ length: 1500 }, () => ({ created_at: "2026-09-20T04:00:00Z" }));
    rows.push({ created_at: "2026-10-31T04:00:00Z" });
    const data = await getActivityData("11111111-1111-4111-8111-111111111111");
    expect(data.currentStreak).toBe(1);
    expect(data.totalActiveDays).toBe(2);
    expect(calls.length).toBe(2); // paged past the 1000-row cap
  });

  it("does not query without a device", async () => {
    const data = await getActivityData(null);
    expect(calls.length).toBe(0);
    expect(data.totalActiveDays).toBe(0);
  });
});
