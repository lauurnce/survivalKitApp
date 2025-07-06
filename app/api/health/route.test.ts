import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

type QueryResult = { error: { message: string } | null };
let behaviour: "ok" | "error" | "hang" | "throw" = "ok";
let configured = true;
const queries: string[] = [];

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => {
    if (!configured) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
    return {
      from: (table: string) => ({
        select: () => ({
          limit: () => ({
            abortSignal: (signal: AbortSignal) => {
              queries.push(table);
              if (behaviour === "throw") return Promise.reject(new Error("network down"));
              if (behaviour === "hang") {
                return new Promise<QueryResult>((resolve) => {
                  signal.addEventListener("abort", () => resolve({ error: { message: "AbortError" } }));
                });
              }
              return Promise.resolve<QueryResult>({
                error: behaviour === "error" ? { message: "relation does not exist" } : null,
              });
            },
          }),
        }),
      }),
    };
  },
}));

import { GET } from "./route";

// The route caches a reading for 10s per instance; each test starts on a
// fresh window by moving the clock well past it.
let clock = Date.parse("2026-11-01T00:00:00Z");

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
  clock += 60_000;
  vi.setSystemTime(clock);
  behaviour = "ok";
  configured = true;
  queries.length = 0;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("GET /api/health", () => {
  it("returns 200 { ok: true, db: 'ok' } with no-store when the database answers", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toEqual({ ok: true, db: "ok" });
    expect(queries).toEqual(["years"]);
  });

  it("returns 503 db 'error' and leaks no error text", async () => {
    behaviour = "error";
    const res = await GET();
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body).toEqual({ ok: false, db: "error" });
    expect(JSON.stringify(body)).not.toContain("relation");
  });

  it("returns db 'error' when the client throws", async () => {
    behaviour = "throw";
    const res = await GET();
    expect(await res.json()).toEqual({ ok: false, db: "error" });
  });

  it("returns db 'timeout' when the database does not answer within 2s", async () => {
    behaviour = "hang";
    const pending = GET();
    await vi.advanceTimersByTimeAsync(2000);
    const res = await pending;
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ ok: false, db: "timeout" });
  });

  it("returns db 'unconfigured' when Supabase env is missing", async () => {
    configured = false;
    const res = await GET();
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ ok: false, db: "unconfigured" });
  });

  it("answers repeat calls within 10s from the cached reading", async () => {
    await GET();
    vi.setSystemTime(clock + 9_000);
    await GET();
    expect(queries).toHaveLength(1);

    vi.setSystemTime(clock + 10_000);
    await GET();
    expect(queries).toHaveLength(2);
  });
});
