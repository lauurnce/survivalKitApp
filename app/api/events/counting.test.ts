import { describe, it, expect, vi, beforeEach } from "vitest";

// Route-level guarantees for the public reader/read counters: which
// record_visit calls a request makes. Kept apart from route.test.ts, whose
// Supabase mock drops RPC calls on the floor.

let mockCookieValue: string | undefined;
vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({ get: () => (mockCookieValue ? { value: mockCookieValue } : undefined) }),
}));

vi.mock("@/lib/serverRateLimit", () => ({
  isServerRateLimited: vi.fn(async () => false),
}));

type RpcCall = { fn: string; args: Record<string, string> };
const rpcCalls: RpcCall[] = [];
const inserts: Record<string, unknown>[] = [];
let rpcResult: { error: { message: string } | null } = { error: null };

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: () => ({
      insert: (payload: Record<string, unknown>) => {
        inserts.push(payload);
        return Promise.resolve({ error: null });
      },
    }),
    rpc: (fn: string, args: Record<string, string>) => {
      rpcCalls.push({ fn, args });
      return Promise.resolve(rpcResult);
    },
  }),
}));

import { POST } from "./route";
import { signDeviceCookie } from "@/lib/auth/deviceCookie";

const BROWSER_UA =
  "Mozilla/5.0 (Linux; Android 14; SM-A146P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";
const DEVICE = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const COOKIE_DEVICE = "ffffffff-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const YEAR = "00000000-0000-0000-0000-000000000001";
const SUBJECT = "11111111-1111-4111-8111-111111111111";
const MODULE = "22222222-2222-4222-8222-222222222222";
const SECTION = "33333333-3333-4333-8333-333333333333";

let ipCounter = 0;
function makeReq(body: Record<string, unknown>, extraHeaders: Record<string, string> = {}) {
  const values: Record<string, string> = {
    "user-agent": BROWSER_UA,
    "x-forwarded-for": `10.1.0.${ipCounter++ % 250}`,
    ...Object.fromEntries(Object.entries(extraHeaders).map(([k, v]) => [k.toLowerCase(), v])),
  };
  return {
    json: () => Promise.resolve(body),
    headers: { get: (name: string) => values[name.toLowerCase()] ?? null },
  } as unknown as import("next/server").NextRequest;
}

const lessonOpen = {
  device_id: DEVICE,
  event_type: "module_open",
  year_id: YEAR,
  subject_id: SUBJECT,
  module_id: MODULE,
};

function visits() {
  return rpcCalls.map((c) => `${c.fn}:${c.args.p_resource_type}:${c.args.p_resource_id}:${c.args.p_device_id}`);
}

beforeEach(() => {
  rpcCalls.length = 0;
  inserts.length = 0;
  rpcResult = { error: null };
  mockCookieValue = undefined;
  process.env.DEVICE_COOKIE_SECRET = "test-device-secret-at-least-32-bytes";
});

describe("POST /api/events — reader/read counters", () => {
  it("counts a signed-out first visit with no device cookie yet (body device id)", async () => {
    const res = await POST(makeReq(lessonOpen));
    expect(res.status).toBe(200);
    expect(visits()).toEqual([
      `record_visit:module:${MODULE}:${DEVICE}`,
      `record_visit:year:${YEAR}:${DEVICE}`,
    ]);
  });

  it("counts a returning visitor against their signed cookie device", async () => {
    mockCookieValue = signDeviceCookie(COOKIE_DEVICE);
    await POST(makeReq(lessonOpen));
    expect(visits()).toEqual([
      `record_visit:module:${MODULE}:${COOKIE_DEVICE}`,
      `record_visit:year:${YEAR}:${COOKIE_DEVICE}`,
    ]);
  });

  it("counts a section read", async () => {
    await POST(makeReq({ device_id: DEVICE, event_type: "section_view", module_id: MODULE, section_id: SECTION }));
    expect(visits()).toEqual([`record_visit:section:${SECTION}:${DEVICE}`]);
  });

  it("counts the year reader from the subjects list page", async () => {
    await POST(makeReq({ device_id: DEVICE, event_type: "subject_open", year_id: YEAR }));
    expect(visits()).toEqual([`record_visit:year:${YEAR}:${DEVICE}`]);
  });

  it("does not count non-read events", async () => {
    await POST(makeReq({ device_id: DEVICE, event_type: "enter" }));
    await POST(makeReq({ device_id: DEVICE, event_type: "paywall_teaser_view", year_id: YEAR, subject_id: SUBJECT }));
    expect(visits()).toEqual([]);
  });

  it("logs a failed record_visit without failing the request", async () => {
    rpcResult = { error: { message: "boom" } };
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await POST(makeReq(lessonOpen));
    expect(res.status).toBe(200);
    await new Promise((r) => setTimeout(r, 0));
    expect(errorSpy).toHaveBeenCalledWith("record_visit failed (module):", "boom");
    errorSpy.mockRestore();
  });
});
