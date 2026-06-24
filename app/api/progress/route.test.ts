import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Captured upsert payloads ────────────────────────────────────────────────
type UpsertPayload = Record<string, unknown>;
const upserts: UpsertPayload[] = [];

// ── Mock @/lib/supabase/server ───────────────────────────────────────────────
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: (_table: string) => ({
      select: (_cols: string) => ({
        eq: (_c1: string, _v1: string) => ({
          eq: (_c2: string, _v2: string) => ({
            maybeSingle: () => Promise.resolve({ data: null }),
          }),
        }),
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
import { POST } from "./route";

// ── Minimal NextRequest stub ─────────────────────────────────────────────────
function makeReq(body: Record<string, unknown>) {
  return {
    json: () => Promise.resolve(body),
    headers: { get: (_h: string) => "127.0.0.1" },
  } as unknown as import("next/server").NextRequest;
}

const DEVICE = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const MODULE = "mod-101";
const USER   = "11111111-1111-1111-1111-111111111111";

beforeEach(() => {
  upserts.length = 0;
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
