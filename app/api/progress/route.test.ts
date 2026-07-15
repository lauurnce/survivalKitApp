import { describe, it, expect, vi, beforeEach } from "vitest";

// Controllable per-test: set to a signed cookie value to simulate a returning
// visitor, or leave undefined to simulate a first-time visitor whose
// fire-and-forget /api/device sync hasn't landed yet.
let mockCookieValue: string | undefined;
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: () => (mockCookieValue ? { value: mockCookieValue } : undefined) }),
}));

// ── Captured upsert payloads / GET device_id filters ─────────────────────────
type UpsertPayload = Record<string, unknown>;
const upserts: UpsertPayload[] = [];
const selectDeviceIdFilters: string[] = [];

// ── Mock @/lib/supabase/server ───────────────────────────────────────────────
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: (_table: string) => ({
      select: (_cols: string) => ({
        eq: (col: string, value: string) => {
          if (col === "device_id") selectDeviceIdFilters.push(value);
          return {
            eq: (_c2: string, _v2: string) => ({
              maybeSingle: () => Promise.resolve({ data: null }),
            }),
            in: () => Promise.resolve({ data: [] }),
          };
        },
      }),
      upsert: (payload: UpsertPayload, _opts: unknown) => {
        upserts.push(payload);
        return Promise.resolve({ error: null });
      },
      delete: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      }),
    }),
  }),
}));

// ── Mock @/lib/auth/currentUser ──────────────────────────────────────────────
const mockGetCurrentUserId = vi.fn(() => Promise.resolve(null as string | null));
vi.mock("@/lib/auth/currentUser", () => ({
  getCurrentUserId: () => mockGetCurrentUserId(),
}));

// ── Import handler AFTER mocks ───────────────────────────────────────────────
import { GET, POST } from "./route";
import { signDeviceCookie } from "@/lib/auth/deviceCookie";

// ── Minimal NextRequest stub ─────────────────────────────────────────────────
function makeReq(body: Record<string, unknown>) {
  return {
    json: () => Promise.resolve(body),
    headers: { get: (_h: string) => "127.0.0.1" },
  } as unknown as import("next/server").NextRequest;
}

function makeGetReq(query: string) {
  return {
    url: `http://localhost:3000/api/progress${query}`,
  } as unknown as import("next/server").NextRequest;
}

const DEVICE = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const VICTIM_DEVICE = "ffffffff-ffff-4fff-8fff-ffffffffffff";
const MODULE = "mod-101";
const USER   = "11111111-1111-1111-1111-111111111111";

beforeEach(() => {
  upserts.length = 0;
  selectDeviceIdFilters.length = 0;
  mockCookieValue = undefined;
  process.env.DEVICE_COOKIE_SECRET = "test-device-secret";
});

describe("POST /api/progress — user_id stamping", () => {
  it("includes user_id in the upsert payload when a session exists", async () => {
    mockGetCurrentUserId.mockResolvedValue(USER);

    const res = await POST(makeReq({ device_id: DEVICE, module_id: MODULE, completed: true }));
    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(upserts).toHaveLength(1);
    expect(upserts[0]).toMatchObject({ device_id: DEVICE, module_id: MODULE, user_id: USER });
  });

  it("omits user_id from the upsert payload for anonymous users", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);

    const res = await POST(makeReq({ device_id: DEVICE, module_id: MODULE, completed: true }));
    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(upserts).toHaveLength(1);
    expect(upserts[0]).not.toHaveProperty("user_id");
  });
});

describe("device_id trust (IDOR regression)", () => {
  it("POST ignores a spoofed body device_id and writes to the signed cookie's device instead", async () => {
    mockCookieValue = signDeviceCookie(DEVICE);
    const res = await POST(
      makeReq({ device_id: VICTIM_DEVICE, module_id: MODULE, completed: true })
    );
    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(upserts).toHaveLength(1);
    expect(upserts[0].device_id).toBe(DEVICE);
    expect(upserts[0].device_id).not.toBe(VICTIM_DEVICE);
  });

  it("GET ignores a spoofed query device_id and reads the signed cookie's device instead", async () => {
    mockCookieValue = signDeviceCookie(DEVICE);
    await GET(makeGetReq(`?device_id=${VICTIM_DEVICE}`));

    expect(selectDeviceIdFilters).toContain(DEVICE);
    expect(selectDeviceIdFilters).not.toContain(VICTIM_DEVICE);
  });

  it("falls back to the client-supplied device_id only when no cookie exists yet", async () => {
    mockCookieValue = undefined;
    const res = await POST(makeReq({ device_id: DEVICE, module_id: MODULE, completed: true }));
    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(upserts[0].device_id).toBe(DEVICE);
  });

  it("rejects a forged/tampered cookie and falls back to the body device_id", async () => {
    mockCookieValue = `${VICTIM_DEVICE}.not-a-real-signature`;
    const res = await POST(makeReq({ device_id: DEVICE, module_id: MODULE, completed: true }));
    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(upserts[0].device_id).toBe(DEVICE);
    expect(upserts[0].device_id).not.toBe(VICTIM_DEVICE);
  });
});
