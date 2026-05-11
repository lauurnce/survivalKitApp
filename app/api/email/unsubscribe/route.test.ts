import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const upserts: Record<string, unknown>[] = [];
let upsertError: { message: string } | null = null;
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: () => ({
      upsert: (row: Record<string, unknown>) => {
        if (!upsertError) upserts.push(row);
        return Promise.resolve({ error: upsertError });
      },
    }),
  }),
}));

import { GET, POST } from "./route";
import { signUnsubscribeToken, unsubscribeUrl } from "@/lib/email/unsubscribe";

const USER = "11111111-2222-4333-8444-555555555555";

beforeEach(() => {
  process.env.EMAIL_UNSUBSCRIBE_SECRET = "test-unsubscribe-secret-at-least-32-chars";
  upserts.length = 0;
  upsertError = null;
});
afterEach(() => {
  delete process.env.EMAIL_UNSUBSCRIBE_SECRET;
});

describe("GET /api/email/unsubscribe", () => {
  it("shows a confirm page and records nothing (link scanners must not unsubscribe)", async () => {
    const res = await GET(new Request(unsubscribeUrl(USER)));
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('method="post"');
    expect(upserts).toHaveLength(0);
  });

  it("rejects a forged token", async () => {
    const res = await GET(new Request(`https://tryi2i.com/api/email/unsubscribe?u=${USER}&t=forged`));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/email/unsubscribe", () => {
  it("records a one-click unsubscribe from the List-Unsubscribe-Post header", async () => {
    const res = await POST(new Request(unsubscribeUrl(USER), {
      method: "POST",
      body: "List-Unsubscribe=One-Click",
      headers: { "content-type": "application/x-www-form-urlencoded" },
    }));
    expect(res.status).toBe(200);
    expect(upserts).toEqual([{ user_id: USER, source: "one_click" }]);
  });

  it("records a form-button unsubscribe as source link", async () => {
    const res = await POST(new Request(unsubscribeUrl(USER), { method: "POST" }));
    expect(res.status).toBe(200);
    expect(upserts[0]).toMatchObject({ source: "link" });
  });

  it("refuses a token signed for a different user", async () => {
    const other = "99999999-2222-4333-8444-555555555555";
    const res = await POST(new Request(
      `https://tryi2i.com/api/email/unsubscribe?u=${USER}&t=${signUnsubscribeToken(other)}`,
      { method: "POST" }
    ));
    expect(res.status).toBe(400);
    expect(upserts).toHaveLength(0);
  });

  it("reports a storage failure instead of claiming success", async () => {
    upsertError = { message: "db down" };
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await POST(new Request(unsubscribeUrl(USER), { method: "POST" }));
    expect(res.status).toBe(500);
  });
});
