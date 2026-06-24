import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./supabase/server", () => ({
  createServerClient: vi.fn(),
}));

import { createServerClient } from "./supabase/server";
import { isUnlocked } from "./unlocks";

describe("isUnlocked", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.UNLOCK_ALL;
  });

  // Chainable query-builder mock matching the subscriptions test style
  function mockSupabase(data: unknown) {
    const builder: Record<string, unknown> = {};
    for (const m of ["select", "eq", "is", "gt", "limit"]) {
      builder[m] = vi.fn().mockReturnValue(builder);
    }
    builder.maybeSingle = vi.fn().mockResolvedValue({ data, error: null });
    vi.mocked(createServerClient).mockReturnValue({
      from: vi.fn().mockReturnValue(builder),
    } as never);
    return builder;
  }

  it("returns true when UNLOCK_ALL=true in non-production", async () => {
    process.env.UNLOCK_ALL = "true";
    const result = await isUnlocked("device-1", "module-1");
    expect(result).toBe(true);
  });

  it("queries by user_id when a valid userId is supplied", async () => {
    const builder = mockSupabase({ id: "unlock-1" });
    const result = await isUnlocked(
      "device-1",
      "module-1",
      "33333333-3333-3333-3333-333333333333"
    );
    expect(result).toBe(true);
    const eqCalls = (builder.eq as ReturnType<typeof vi.fn>).mock.calls as Array<[string, string]>;
    expect(eqCalls.some(([c]) => c === "user_id")).toBe(true);
    expect(eqCalls.some(([c]) => c === "device_id")).toBe(false);
  });

  it("queries by device_id when userId is absent", async () => {
    const builder = mockSupabase({ id: "unlock-1" });
    const result = await isUnlocked("device-1", "module-1");
    expect(result).toBe(true);
    const eqCalls = (builder.eq as ReturnType<typeof vi.fn>).mock.calls as Array<[string, string]>;
    expect(eqCalls.some(([c]) => c === "device_id")).toBe(true);
    expect(eqCalls.some(([c]) => c === "user_id")).toBe(false);
  });

  it("returns false when no matching unlock row", async () => {
    mockSupabase(null);
    const result = await isUnlocked("device-1", "module-1");
    expect(result).toBe(false);
  });
});
