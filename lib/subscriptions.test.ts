import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the supabase server client
vi.mock("./supabase/server", () => ({
  createServerClient: vi.fn(),
}));

import { createServerClient } from "./supabase/server";
import { isSubscribed } from "./subscriptions";

describe("isSubscribed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.UNLOCK_ALL;
  });

  it("returns true when UNLOCK_ALL=true in non-production", async () => {
    process.env.UNLOCK_ALL = "true";
    process.env.NODE_ENV = "test";
    const result = await isSubscribed("device-1", "year-1");
    expect(result).toBe(true);
  });

  // Chainable query-builder mock: select → eq → eq → eq → gt → limit → maybeSingle
  function mockSupabase(data: unknown) {
    const builder: Record<string, unknown> = {};
    for (const m of ["select", "eq", "gt", "limit"]) {
      builder[m] = vi.fn().mockReturnValue(builder);
    }
    builder.maybeSingle = vi.fn().mockResolvedValue({ data, error: null });
    vi.mocked(createServerClient).mockReturnValue({
      from: vi.fn().mockReturnValue(builder),
    } as never);
    return builder;
  }

  it("returns true when an active, unexpired subscription exists", async () => {
    mockSupabase({ id: "sub-1" });
    expect(await isSubscribed("device-1", "year-1")).toBe(true);
  });

  it("returns false when no matching subscription", async () => {
    // An expired subscription is filtered out by the current_period_end > now()
    // predicate, so the query returns no row — same as the unsubscribed case.
    mockSupabase(null);
    expect(await isSubscribed("device-1", "year-1")).toBe(false);
  });

  it("filters on status=active and current_period_end > now()", async () => {
    const builder = mockSupabase({ id: "sub-1" });
    await isSubscribed("device-1", "year-1");
    expect(builder.eq).toHaveBeenCalledWith("status", "active");
    expect(builder.gt).toHaveBeenCalledWith(
      "current_period_end",
      expect.any(String)
    );
  });
});
