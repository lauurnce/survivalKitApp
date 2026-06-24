import { describe, it, expect, vi, beforeEach } from "vitest";

const updates: Array<{ table: string; user_id: string; device_id: string; nullOnly: boolean }> = [];

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: (table: string) => ({
      update: (vals: { user_id: string }) => ({
        eq: (_c: string, device_id: string) => ({
          is: (_col: string, _v: null) => {
            updates.push({ table, user_id: vals.user_id, device_id, nullOnly: true });
            return Promise.resolve({ error: null });
          },
        }),
      }),
    }),
  }),
}));

import { claimDeviceRows } from "./claim";

beforeEach(() => { updates.length = 0; });

const U = "11111111-1111-1111-1111-111111111111";
const D = "22222222-2222-2222-2222-222222222222";

describe("claimDeviceRows", () => {
  it("updates all four tables, scoped to the device and user_id IS NULL", async () => {
    await claimDeviceRows(U, D);
    expect(updates.map((u) => u.table).sort()).toEqual(
      ["module_progress", "payments", "subscriptions", "unlocks"],
    );
    expect(updates.every((u) => u.user_id === U && u.device_id === D && u.nullOnly)).toBe(true);
  });

  it("no-ops on an invalid device id", async () => {
    await claimDeviceRows(U, "not-a-uuid");
    expect(updates).toHaveLength(0);
  });
});
