// lib/email/outbox.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const sendEmail = vi.fn();
vi.mock("@/lib/email/client", () => ({ sendEmail: (...a: unknown[]) => sendEmail(...a) }));
vi.mock("@/lib/email/templates", () => ({
  receiptEmail: () => ({ subject: "r", html: "<p>r</p>", text: "r" }),
  welcomeEmail: () => ({ subject: "w", html: "<p>w</p>", text: "w" }),
  expiryWarningEmail: () => ({ subject: "e", html: "<p>e</p>", text: "e" }),
  winbackEmail: () => ({ subject: "b", html: "<p>b</p>", text: "b" }),
}));

let inserted: Record<string, unknown>[] = [];
let insertError: { code?: string; message: string } | null = null;
let pendingRows: Record<string, unknown>[] = [];
const updates: Record<string, unknown>[] = [];

function mockSupabase() {
  return {
    from: () => ({
      insert: (row: Record<string, unknown>) => {
        if (!insertError) inserted.push(row);
        return Promise.resolve({ error: insertError });
      },
      select: () => ({
        eq: () => ({
          lte: () => ({ order: () => ({ limit: () => Promise.resolve({ data: pendingRows, error: null }) }) }),
        }),
      }),
      update: (patch: Record<string, unknown>) => ({
        eq: (_c: string, id: string) => { updates.push({ id, ...patch }); return Promise.resolve({ error: null }); },
      }),
    }),
  } as never;
}

beforeEach(() => {
  inserted = []; insertError = null; pendingRows = []; updates.length = 0; sendEmail.mockReset();
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

  it("gives up permanently at 5 attempts", async () => {
    pendingRows = [{ id: "e1", kind: "receipt", to_email: "a@b.test", attempts: 4, payload: {} }];
    sendEmail.mockResolvedValue({ ok: false, error: "still down" });
    const { drain } = await import("./outbox");
    await drain(mockSupabase());
    expect(updates[0]).toMatchObject({ id: "e1", status: "failed", attempts: 5 });
  });
});
