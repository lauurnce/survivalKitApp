// lib/email/outbox.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const sendEmail = vi.fn();
vi.mock("@/lib/email/client", () => ({ sendEmail: (...a: unknown[]) => sendEmail(...a) }));
const templateArgs: Record<string, unknown>[] = [];
vi.mock("@/lib/email/templates", () => ({
  receiptEmail: (i: Record<string, unknown>) => {
    templateArgs.push(i);
    return { subject: "r", html: "<p>r</p>", text: "r" };
  },
  welcomeEmail: () => ({ subject: "w", html: "<p>w</p>", text: "w" }),
  expiryWarningEmail: (i: Record<string, unknown>) => {
    templateArgs.push(i);
    return { subject: "e", html: "<p>e</p>", text: "e" };
  },
  winbackEmail: (i: Record<string, unknown>) => {
    templateArgs.push(i);
    return { subject: "b", html: "<p>b</p>", text: "b" };
  },
  reactivationEmail: (i: Record<string, unknown>) => {
    templateArgs.push(i);
    return { subject: "f", html: "<p>f</p>", text: "f" };
  },
}));

let inserted: Record<string, unknown>[] = [];
let insertError: { code?: string; message: string } | null = null;
let pendingRows: Record<string, unknown>[] = [];
const drainQueries: Array<{ kinds: string[]; limit: number }> = [];
const updates: Record<string, unknown>[] = [];

let unsubscribed: Set<string> = new Set();
let unsubLookupError: { message: string } | null = null;

function mockSupabase() {
  return {
    from: (table: string) => table === "email_unsubscribes" ? ({
      select: () => ({
        eq: (_c: string, userId: string) => ({
          maybeSingle: () => Promise.resolve({
            data: unsubscribed.has(userId) ? { user_id: userId } : null,
            error: unsubLookupError,
          }),
        }),
      }),
    }) : ({
      insert: (row: Record<string, unknown>) => {
        if (!insertError) inserted.push(row);
        return Promise.resolve({ error: insertError });
      },
      // drain(): select().eq(status).in(kind, kinds).lte(send_after).order().limit(n)
      select: () => ({
        eq: () => ({
          in: (_c: string, kinds: string[]) => ({
            lte: () => ({
              order: () => ({
                limit: (n: number) => {
                  drainQueries.push({ kinds, limit: n });
                  const hit = pendingRows.filter((r) => kinds.includes(String(r.kind))).slice(0, n);
                  return Promise.resolve({ data: hit, error: null });
                },
              }),
            }),
          }),
        }),
      }),
      update: (patch: Record<string, unknown>) => ({
        eq: (_c: string, id: string) => { updates.push({ id, ...patch }); return Promise.resolve({ error: null }); },
      }),
    }),
  } as never;
}

beforeEach(() => {
  inserted = []; insertError = null; pendingRows = []; updates.length = 0; drainQueries.length = 0; templateArgs.length = 0; sendEmail.mockReset();
  unsubscribed = new Set(); unsubLookupError = null;
  process.env.EMAIL_UNSUBSCRIBE_SECRET = "test-unsubscribe-secret-at-least-32-chars";
});

describe("enqueue", () => {
  it("writes a pending row carrying the scope key", async () => {
    const { enqueue } = await import("./outbox");
    const r = await enqueue(mockSupabase(), {
      kind: "receipt", userId: "u1", toEmail: "a@b.test", payload: { planLabel: "P" }, scopeKey: "pay_1",
    });
    expect(r).toEqual({ enqueued: true, deduped: false });
    expect(inserted[0]).toMatchObject({ kind: "receipt", user_id: "u1", to_email: "a@b.test", status: "pending" });
    expect((inserted[0].payload as Record<string, unknown>).scope_key).toBe("pay_1");
  });

  it("treats a unique violation as a dedup, not an error", async () => {
    insertError = { code: "23505", message: "duplicate key" };
    const { enqueue } = await import("./outbox");
    expect(await enqueue(mockSupabase(), {
      kind: "receipt", userId: "u1", toEmail: "a@b.test", payload: {}, scopeKey: "pay_1",
    })).toEqual({ enqueued: false, deduped: true });
  });
});

describe("drain", () => {
  it("marks a row sent when the send succeeds", async () => {
    pendingRows = [{ id: "e1", kind: "receipt", to_email: "a@b.test", attempts: 0, payload: {} }];
    sendEmail.mockResolvedValue({ ok: true, id: "abc" });
    const { drain } = await import("./outbox");
    expect(await drain(mockSupabase())).toEqual({ sent: 1, failed: 0 });
    expect(updates[0]).toMatchObject({ id: "e1", status: "sent" });
  });

  it("records the error and increments attempts on failure", async () => {
    pendingRows = [{ id: "e1", kind: "receipt", to_email: "a@b.test", attempts: 1, payload: {} }];
    sendEmail.mockResolvedValue({ ok: false, error: "rate limited" });
    const { drain } = await import("./outbox");
    expect(await drain(mockSupabase())).toEqual({ sent: 0, failed: 1 });
    expect(updates[0]).toMatchObject({ id: "e1", status: "pending", attempts: 2, last_error: "rate limited" });
  });

  it("UTM-tags the lifecycle CTA with the email kind as the campaign", async () => {
    pendingRows = [{
      id: "e1", kind: "receipt", to_email: "a@b.test", attempts: 0,
      payload: { url: "https://tryi2i.com/account" },
    }];
    sendEmail.mockResolvedValue({ ok: true, id: "abc" });
    const { drain } = await import("./outbox");
    await drain(mockSupabase());
    const url = new URL(String(templateArgs[0].returnUrl));
    expect(url.pathname).toBe("/account");
    expect(url.searchParams.get("utm_source")).toBe("lifecycle");
    expect(url.searchParams.get("utm_medium")).toBe("email");
    expect(url.searchParams.get("utm_campaign")).toBe("receipt");
  });

  it("sends a malformed stored URL untagged rather than failing the row", async () => {
    pendingRows = [{ id: "e1", kind: "receipt", to_email: "a@b.test", attempts: 0, payload: { url: "not a url" } }];
    sendEmail.mockResolvedValue({ ok: true, id: "abc" });
    const { drain } = await import("./outbox");
    expect(await drain(mockSupabase())).toEqual({ sent: 1, failed: 0 });
    expect(templateArgs[0].returnUrl).toBe("not a url");
  });

  it("gives up permanently at 5 attempts", async () => {
    pendingRows = [{ id: "e1", kind: "receipt", to_email: "a@b.test", attempts: 4, payload: {} }];
    sendEmail.mockResolvedValue({ ok: false, error: "still down" });
    const { drain } = await import("./outbox");
    await drain(mockSupabase());
    expect(updates[0]).toMatchObject({ id: "e1", status: "failed", attempts: 5 });
  });
});

describe("drain — priority and renewal", () => {
  const reactivation = (i: number) => ({
    id: `r${i}`, kind: "reactivation", user_id: "11111111-2222-4333-8444-555555555555",
    to_email: "a@b.test", attempts: 0, payload: { scope_key: "finals-dec-2026" },
  });

  // A reactivation backlog older than the warning must not push the warning
  // past the daily cap.
  it("sends transactional mail before an older marketing backlog", async () => {
    pendingRows = [
      ...Array.from({ length: 60 }, (_, i) => reactivation(i)),
      { id: "w1", kind: "expiry_warning", user_id: "u1", to_email: "a@b.test", attempts: 0, payload: {} },
    ];
    sendEmail.mockResolvedValue({ ok: true, id: "abc" });
    const { drain } = await import("./outbox");
    expect(await drain(mockSupabase(), 50)).toEqual({ sent: 50, failed: 0 });
    expect(updates[0]).toMatchObject({ id: "w1", status: "sent" });
    expect(drainQueries).toEqual([
      { kinds: ["receipt", "welcome", "expiry_warning", "winback"], limit: 50 },
      { kinds: ["reactivation"], limit: 49 },
    ]);
  });

  it("skips the marketing query when transactional mail fills the cap", async () => {
    pendingRows = [
      { id: "e1", kind: "receipt", to_email: "a@b.test", attempts: 0, payload: {} },
      { id: "e2", kind: "receipt", to_email: "a@b.test", attempts: 0, payload: {} },
      reactivation(1),
    ];
    sendEmail.mockResolvedValue({ ok: true, id: "abc" });
    const { drain } = await import("./outbox");
    expect(await drain(mockSupabase(), 2)).toEqual({ sent: 2, failed: 0 });
    expect(drainQueries).toHaveLength(1);
  });

  it("tells an expiring 1st-sem payer what a renewal now buys: the 2nd semester", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2027-01-28T01:00:00Z")); // the Jan 28 cron run
    try {
      pendingRows = [{
        id: "w1", kind: "expiry_warning", user_id: "u1", to_email: "a@b.test", attempts: 0,
        payload: { planLabel: "All subjects", accessEndsAt: "2027-01-31T15:59:59.000Z" },
      }];
      sendEmail.mockResolvedValue({ ok: true, id: "abc" });
      const { drain } = await import("./outbox");
      await drain(mockSupabase());
    } finally {
      vi.useRealTimers();
    }
    expect((templateArgs[0].accessEndsAt as Date).toISOString()).toBe("2027-01-31T15:59:59.000Z");
    expect((templateArgs[0].renewalEndsAt as Date).toISOString()).toBe("2027-06-30T15:59:59.000Z");
  });

  it("quotes the 2nd-semester end in the win-back too", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2027-02-04T01:00:00Z"));
    try {
      pendingRows = [{ id: "b1", kind: "winback", user_id: "u1", to_email: "a@b.test", attempts: 0, payload: {} }];
      sendEmail.mockResolvedValue({ ok: true, id: "abc" });
      const { drain } = await import("./outbox");
      await drain(mockSupabase());
    } finally {
      vi.useRealTimers();
    }
    expect((templateArgs[0].renewalEndsAt as Date).toISOString()).toBe("2027-06-30T15:59:59.000Z");
  });
});

describe("drain — reactivation", () => {
  const row = () => ({
    id: "r1", kind: "reactivation", user_id: "11111111-2222-4333-8444-555555555555",
    to_email: "a@b.test", attempts: 0, payload: { scope_key: "finals-dec-2026" },
  });

  it("sends with a UTM-tagged CTA, a signed unsubscribe link, and one-click headers", async () => {
    pendingRows = [row()];
    sendEmail.mockResolvedValue({ ok: true, id: "abc" });
    const { drain } = await import("./outbox");
    expect(await drain(mockSupabase())).toEqual({ sent: 1, failed: 0 });

    const cta = new URL(String(templateArgs[0].ctaUrl));
    expect(cta.pathname).toBe("/");
    expect(cta.searchParams.get("utm_source")).toBe("reactivation");
    expect(cta.searchParams.get("utm_medium")).toBe("email");
    expect(cta.searchParams.get("utm_campaign")).toBe("finals-dec-2026");

    const unsub = String(templateArgs[0].unsubscribeUrl);
    expect(unsub).toContain("/api/email/unsubscribe?u=11111111-2222-4333-8444-555555555555&t=");
    const [, email, opts] = sendEmail.mock.calls[0] as [string, { headers: Record<string, string> }, { idempotencyKey: string }];
    expect(email.headers["List-Unsubscribe"]).toBe(`<${unsub}>`);
    expect(email.headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
    expect(opts.idempotencyKey).toBe("email-outbox/r1");
  });

  it("skips someone who unsubscribed after being queued, without sending", async () => {
    pendingRows = [row()];
    unsubscribed.add("11111111-2222-4333-8444-555555555555");
    const { drain } = await import("./outbox");
    expect(await drain(mockSupabase())).toEqual({ sent: 0, failed: 0 });
    expect(sendEmail).not.toHaveBeenCalled();
    expect(updates[0]).toMatchObject({ id: "r1", status: "failed", last_error: "skipped: unsubscribed" });
  });

  it("fails closed when the opt-out lookup errors", async () => {
    pendingRows = [row()];
    unsubLookupError = { message: "db down" };
    const { drain } = await import("./outbox");
    expect(await drain(mockSupabase())).toEqual({ sent: 0, failed: 1 });
    expect(sendEmail).not.toHaveBeenCalled();
    expect(updates[0]).toMatchObject({ id: "r1", status: "pending", last_error: "db down" });
  });

  it("never sends marketing mail without a working unsubscribe link, and keeps draining", async () => {
    delete process.env.EMAIL_UNSUBSCRIBE_SECRET;
    pendingRows = [row(), { id: "e1", kind: "receipt", to_email: "a@b.test", attempts: 0, payload: {} }];
    sendEmail.mockResolvedValue({ ok: true, id: "abc" });
    const { drain } = await import("./outbox");
    expect(await drain(mockSupabase())).toEqual({ sent: 1, failed: 1 });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(updates.find((u) => u.id === "r1")).toMatchObject({ status: "pending", last_error: expect.stringMatching(/EMAIL_UNSUBSCRIBE_SECRET/) });
  });

  it("does not consult the opt-out list for transactional mail", async () => {
    pendingRows = [{ id: "e1", kind: "receipt", user_id: "11111111-2222-4333-8444-555555555555", to_email: "a@b.test", attempts: 0, payload: {} }];
    unsubscribed.add("11111111-2222-4333-8444-555555555555");
    sendEmail.mockResolvedValue({ ok: true, id: "abc" });
    const { drain } = await import("./outbox");
    expect(await drain(mockSupabase())).toEqual({ sent: 1, failed: 0 });
  });
});
