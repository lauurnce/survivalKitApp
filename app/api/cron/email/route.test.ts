import { describe, it, expect, vi, beforeEach } from "vitest";

const drainMock = vi.fn();
const enqueueMock = vi.fn();
vi.mock("@/lib/email/outbox", () => ({
  drain: (...a: unknown[]) => drainMock(...a),
  enqueue: (...a: unknown[]) => enqueueMock(...a),
}));

// Each scan issues: from("subscriptions").select(...).eq("status","active")
//   .gte("current_period_end", lo).lte("current_period_end", hi)
// Queries are answered from a queue so the warning scan and the win-back scan
// can return different rows within a single request.
let scanResults: Record<string, unknown>[][] = [];
const scanRanges: Array<{ lo: string; hi: string }> = [];
let userEmail: string | null = "payer@example.com";

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          gte: (_c: string, lo: string) => ({
            lte: (_c2: string, hi: string) => {
              scanRanges.push({ lo, hi });
              return Promise.resolve({ data: scanResults.shift() ?? [], error: null });
            },
          }),
        }),
      }),
    }),
    auth: {
      admin: {
        getUserById: () =>
          Promise.resolve({ data: { user: userEmail ? { email: userEmail } : null } }),
      },
    },
  }),
}));

import { GET } from "./route";

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
  // full day around the target rather than an instant.
  it("scans a one-day window around each target", async () => {
    await GET(authed());
    expect(scanRanges).toHaveLength(2);
    for (const r of scanRanges) {
      const span = new Date(r.hi).getTime() - new Date(r.lo).getTime();
      expect(span).toBe(DAY);
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
});
