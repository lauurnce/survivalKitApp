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

  it("returns true when active subscription exists", async () => {
    const mockEq3 = vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: "sub-1" }, error: null }),
      }),
    });
    const mockEq2 = vi.fn().mockReturnValue({
      eq: mockEq3,
    });
    const mockEq1 = vi.fn().mockReturnValue({
      eq: mockEq2,
    });
    const mockSelect = vi.fn().mockReturnValue({
      eq: mockEq1,
    });
    vi.mocked(createServerClient).mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as never);

    const result = await isSubscribed("device-1", "year-1");
    expect(result).toBe(true);
  });

  it("returns false when no active subscription", async () => {
    const mockEq3 = vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });
    const mockEq2 = vi.fn().mockReturnValue({
      eq: mockEq3,
    });
    const mockEq1 = vi.fn().mockReturnValue({
      eq: mockEq2,
    });
    const mockSelect = vi.fn().mockReturnValue({
      eq: mockEq1,
    });
    vi.mocked(createServerClient).mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as never);

    const result = await isSubscribed("device-1", "year-1");
    expect(result).toBe(false);
  });
});
