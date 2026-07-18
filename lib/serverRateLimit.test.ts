import { describe, it, expect, vi, beforeEach } from "vitest";

const rpcMock = vi.fn();
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ rpc: rpcMock })),
}));

import { isServerRateLimited } from "./serverRateLimit";

describe("isServerRateLimited", () => {
  beforeEach(() => rpcMock.mockReset());

  it("returns true when the RPC reports the key is over its limit", async () => {
    rpcMock.mockResolvedValue({ data: true, error: null });
    expect(await isServerRateLimited("t:1", { max: 5, windowSeconds: 60 })).toBe(true);
    expect(rpcMock).toHaveBeenCalledWith("check_rate_limit", {
      p_key: "t:1",
      p_max: 5,
      p_window_seconds: 60,
    });
  });

  it("returns false when under the limit", async () => {
    rpcMock.mockResolvedValue({ data: false, error: null });
    expect(await isServerRateLimited("t:1", { max: 5, windowSeconds: 60 })).toBe(false);
  });

  it("fails open when the RPC errors", async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: "boom" } });
    expect(await isServerRateLimited("t:1", { max: 5, windowSeconds: 60 })).toBe(false);
  });
});
