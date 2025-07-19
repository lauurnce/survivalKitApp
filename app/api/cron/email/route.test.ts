import { describe, it, expect, vi, beforeEach } from "vitest";

const drainMock = vi.fn();
const enqueueMock = vi.fn();
vi.mock("@/lib/email/outbox", () => ({
  drain: (...a: unknown[]) => drainMock(...a),
  enqueue: (...a: unknown[]) => enqueueMock(...a),
}));

// Each scan issues: from("subscriptions").select(...).eq("status","active")
//   .gte("current_period_end", lo).lte("current_period_end", hi)
// and, per candidate, a renewal lookup ending in .gt("current_period_end", end).
// Scans are answered from a queue so the warning scan and the win-back scan
// can return different rows within a single request; renewal lookups are
// answered from laterAccess, keyed by user id.
let scanResults: Record<string, unknown>[][] = [];
const scanRanges: Array<{ lo: string; hi: string }> = [];
let laterAccess: Record<string, Array<{ id: string; subject_id: string | null }>> = {};
let laterAccessError: { message: string } | null = null;
let userEmail: string | null = "payer@example.com";

function subscriptionsQuery() {
  const filters: Record<string, string> = {};
  let lo = "", hi = "";
  const q = {
    select: () => q,
    eq: (col: string, val: string) => { filters[col] = val; return q; },
    gte: (_c: string, v: string) => { lo = v; return q; },
    lte: (_c: string, v: string) => {
      hi = v;
      scanRanges.push({ lo, hi });
      return Promise.resolve({ data: scanResults.shift() ?? [], error: null });
    },
    gt: () => {
      return Promise.resolve(
        laterAccessError
          ? { data: null, error: laterAccessError }
          : { data: laterAccess[filters.user_id] ?? [], error: null }
      );
    },
  };
  return q;
}

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: () => subscriptionsQuery(),
    auth: {
      admin: {
        getUserById: () =>
          Promise.resolve({ data: { user: userEmail ? { email: userEmail } : null } }),
      },
    },
  }),
}));

import { GET } from "./route";
import { SCAN_SLACK_MS } from "@/lib/email/expiryScan";

const DAY = 24 * 60 * 60 * 1000;

function authed() {
  return new Request("http://x/api/cron/email", {
    headers: { authorization: "Bearer s3cret" },
  });
}

beforeEach(() => {
  drainMock.mockReset().mockResolvedValue({ sent: 0, failed: 0 });
  enqueueMock.mockReset().mockResolvedValue({ enqueued: true, deduped: false });
  scanResults = [];
  scanRanges.length = 0;
  laterAccess = {};
  laterAccessError = null;
  userEmail = "payer@example.com";
  vi.stubEnv("CRON_SECRET", "s3cret");
});

describe("GET /api/cron/email auth", () => {
  it("rejects a caller with no authorization header", async () => {
    const res = await GET(new Request("http://x/api/cron/email"));
    expect(res.status).toBe(401);
    expect(drainMock).not.toHaveBeenCalled();
  });

  it("rejects a caller with the wrong secret", async () => {
    const res = await GET(
      new Request("http://x/api/cron/email", { headers: { authorization: "Bearer nope" } })
    );
    expect(res.status).toBe(401);
    expect(drainMock).not.toHaveBeenCalled();
  });

  // Fail closed. An unset secret must never let "Bearer undefined" through, or
  // a misconfigured deploy would expose the whole mail queue to the internet.
  it("rejects every caller when CRON_SECRET is unset", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await GET(authed())).status).toBe(401);
    expect(
      (await GET(new Request("http://x/api/cron/email", {
        headers: { authorization: "Bearer undefined" },
      }))).status
    ).toBe(401);
    expect(drainMock).not.toHaveBeenCalled();
  });
});

describe("GET /api/cron/email work", () => {
  it("drains the outbox when authenticated", async () => {
    const res = await GET(authed());
    expect(res.status).toBe(200);
    expect(drainMock).toHaveBeenCalled();
  });

  it("queues an expiry warning for a subscription ending in 4 days", async () => {
    const end = new Date(Date.now() + 4 * DAY).toISOString();
    scanResults = [[{ id: "s1", user_id: "u1", subject_id: null, current_period_end: end }], []];
    await GET(authed());
    const warning = enqueueMock.mock.calls.find((c) => c[1].kind === "expiry_warning");
    expect(warning).toBeDefined();
    expect(warning![1].scopeKey).toBe("s1");
    expect(warning![1].toEmail).toBe("payer@example.com");
  });

  it("queues a win-back for a subscription that ended 3 days ago", async () => {
    const end = new Date(Date.now() - 3 * DAY).toISOString();
    scanResults = [[], [{ id: "s2", user_id: "u2", subject_id: "sub", current_period_end: end }]];
    await GET(authed());
    const winback = enqueueMock.mock.calls.find((c) => c[1].kind === "winback");
    expect(winback).toBeDefined();
    expect(winback![1].scopeKey).toBe("s2");
  });

  // A once-daily cron can fire hours off its nominal time, so each scan covers a
  // full day around the target, overhung on both sides so that two runs at
  // opposite ends of their scheduled hour still leave no gap between them.
  it("scans a one-day window around each target, with slack on both sides", async () => {
    await GET(authed());
    expect(scanRanges).toHaveLength(2);
    for (const r of scanRanges) {
      const span = new Date(r.hi).getTime() - new Date(r.lo).getTime();
      expect(span).toBe(DAY + 2 * SCAN_SLACK_MS);
    }
    // Warning window sits in the future, win-back window in the past.
    expect(new Date(scanRanges[0].lo).getTime()).toBeGreaterThan(Date.now());
    expect(new Date(scanRanges[1].hi).getTime()).toBeLessThan(Date.now());
  });

  it("skips a subscription whose account has no email address", async () => {
    userEmail = null;
    const end = new Date(Date.now() + 4 * DAY).toISOString();
    scanResults = [[{ id: "s1", user_id: "u1", subject_id: null, current_period_end: end }], []];
    await GET(authed());
    expect(enqueueMock).not.toHaveBeenCalled();
  });

  it("keeps going when one enqueue throws", async () => {
    const end = new Date(Date.now() + 4 * DAY).toISOString();
    scanResults = [
      [
        { id: "s1", user_id: "u1", subject_id: null, current_period_end: end },
        { id: "s2", user_id: "u2", subject_id: null, current_period_end: end },
      ],
      [],
    ];
    enqueueMock.mockRejectedValueOnce(new Error("db down"));
    const res = await GET(authed());
    expect(res.status).toBe(200);
    expect(enqueueMock).toHaveBeenCalledTimes(2);
  });

  it("skips a user who already renewed on another device", async () => {
    const end = new Date(Date.now() + 4 * DAY).toISOString();
    scanResults = [[{ id: "s1", user_id: "u1", year_id: "y1", subject_id: "sub", current_period_end: end }], []];
    laterAccess = { u1: [{ id: "s9", subject_id: "sub" }] };
    await GET(authed());
    expect(enqueueMock).not.toHaveBeenCalled();
  });

  it("skips a subject pass already covered by a later year pass", async () => {
    const end = new Date(Date.now() - 3 * DAY).toISOString();
    scanResults = [[], [{ id: "s2", user_id: "u2", year_id: "y1", subject_id: "sub", current_period_end: end }]];
    laterAccess = { u2: [{ id: "s9", subject_id: null }] };
    await GET(authed());
    expect(enqueueMock).not.toHaveBeenCalled();
  });

  it("still warns when the later access is for a different subject", async () => {
    const end = new Date(Date.now() + 4 * DAY).toISOString();
    scanResults = [[{ id: "s1", user_id: "u1", year_id: "y1", subject_id: "sub", current_period_end: end }], []];
    laterAccess = { u1: [{ id: "s9", subject_id: "other" }] };
    await GET(authed());
    expect(enqueueMock).toHaveBeenCalledTimes(1);
  });

  it("still warns when the renewal lookup fails", async () => {
    const end = new Date(Date.now() + 4 * DAY).toISOString();
    scanResults = [[{ id: "s1", user_id: "u1", year_id: "y1", subject_id: null, current_period_end: end }], []];
    laterAccessError = { message: "db down" };
    await GET(authed());
    expect(enqueueMock).toHaveBeenCalledTimes(1);
  });
});

// Every 1st-sem pass ends at 2027-01-31T15:59:59Z (lib/terms.ts). vercel.json
// runs the cron at 01:00 UTC (09:00 PH), anywhere inside that hour.
describe("GET /api/cron/email around the Jan 31, 2027 term end", () => {
  const TERM_END = new Date("2027-01-31T15:59:59Z").getTime();
  const covers = (r: { lo: string; hi: string }) =>
    new Date(r.lo).getTime() <= TERM_END && TERM_END <= new Date(r.hi).getTime();

  async function runAt(iso: string) {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(iso));
    scanRanges.length = 0;
    try {
      await GET(authed());
    } finally {
      vi.useRealTimers();
    }
    return { warning: scanRanges[0], winback: scanRanges[1] };
  }

  it.each(["01:00", "01:59"])("queues the expiry warning on the Jan 28 run (fired %s UTC), not earlier", async (t) => {
    expect(covers((await runAt(`2027-01-27T${t}:00Z`)).warning)).toBe(false);
    expect(covers((await runAt(`2027-01-28T${t}:00Z`)).warning)).toBe(true);
  });

  it.each(["01:00", "01:59"])("queues the win-back on the Feb 4 run (fired %s UTC), after access ended", async (t) => {
    expect(covers((await runAt(`2027-02-03T${t}:00Z`)).winback)).toBe(false);
    expect(covers((await runAt(`2027-02-04T${t}:00Z`)).winback)).toBe(true);
  });

  it("leaves no gap between runs at opposite ends of the cron hour", async () => {
    const early = (await runAt("2027-01-27T01:00:00Z")).warning;
    const late = (await runAt("2027-01-28T01:59:00Z")).warning;
    expect(new Date(late.lo).getTime()).toBeLessThanOrEqual(new Date(early.hi).getTime());
  });
});
