import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Captured insert payloads + controllable insert result ───────────────────
type InsertPayload = Record<string, unknown>;
const inserts: InsertPayload[] = [];
let insertResult: { error: { message: string } | null } = { error: null };

// ── Mock @/lib/supabase/server ───────────────────────────────────────────────
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: (_table: string) => ({
      insert: (payload: InsertPayload) => {
        inserts.push(payload);
        return Promise.resolve(insertResult);
      },
    }),
    rpc: () => Promise.resolve({ error: null }),
  }),
}));

// ── Import handler AFTER mocks ───────────────────────────────────────────────
import { POST } from "./route";

// ── Minimal NextRequest stub ─────────────────────────────────────────────────
let reqCounter = 0;
function makeReq(body: Record<string, unknown>) {
  // Unique IP per request so the in-process rate limiter never trips in tests
  const ip = `10.0.${Math.floor(reqCounter / 250)}.${reqCounter++ % 250}`;
  return {
    json: () => Promise.resolve(body),
    headers: { get: (_h: string) => ip },
  } as unknown as import("next/server").NextRequest;
}

const DEVICE = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

beforeEach(() => {
  inserts.length = 0;
  insertResult = { error: null };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/events — attribution capture", () => {
  it("includes sanitized referrer and utm fields in the insert payload", async () => {
    const res = await POST(
      makeReq({
        device_id: DEVICE,
        event_type: "enter",
        referrer: "https://www.facebook.com/",
        utm_source: "fb_group",
        utm_medium: "social",
        utm_campaign: "prelim_launch",
      })
    );
    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(inserts).toHaveLength(1);
    expect(inserts[0]).toMatchObject({
      device_id: DEVICE,
      event_type: "enter",
      referrer: "https://www.facebook.com/",
      utm_source: "fb_group",
      utm_medium: "social",
      utm_campaign: "prelim_launch",
    });
  });

  it("stores null attribution when fields are absent", async () => {
    const res = await POST(makeReq({ device_id: DEVICE, event_type: "enter" }));
    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(inserts[0]).toMatchObject({
      referrer: null,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
    });
  });

  it("truncates oversized values and nulls non-string values", async () => {
    const res = await POST(
      makeReq({
        device_id: DEVICE,
        event_type: "enter",
        referrer: "r".repeat(1000),
        utm_source: "s".repeat(500),
        utm_medium: { evil: true },
        utm_campaign: 42,
      })
    );
    const json = await res.json();

    expect(json.ok).toBe(true);
    expect((inserts[0].referrer as string).length).toBe(500);
    expect((inserts[0].utm_source as string).length).toBe(120);
    expect(inserts[0].utm_medium).toBeNull();
    expect(inserts[0].utm_campaign).toBeNull();
  });
});

describe("POST /api/events — insert error visibility", () => {
  it("logs a console.error when the insert is rejected by the database", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    insertResult = { error: { message: 'violates check constraint "events_event_type_check"' } };

    await POST(makeReq({ device_id: DEVICE, event_type: "paywall_teaser_view" }));

    expect(errorSpy).toHaveBeenCalled();
    const logged = errorSpy.mock.calls.flat().map(String).join(" ");
    expect(logged).toContain("events_event_type_check");
  });
});
