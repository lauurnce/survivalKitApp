import { describe, it, expect, vi, beforeEach } from "vitest";

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
    const result = await isSubscribed("device-1", "year-1");
    expect(result).toBe(true);
  });

  // Chainable query-builder mock: supports all chained methods including .is()
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

  it("returns true when a year-level active subscription exists", async () => {
    mockSupabase({ id: "sub-1" });
    expect(await isSubscribed("device-1", "year-1")).toBe(true);
  });

  it("returns true when a subject-level active subscription exists", async () => {
    // First query (year plan) returns null, second (subject plan) returns a row
    const builder: Record<string, unknown> = {};
    for (const m of ["select", "eq", "is", "gt", "limit"]) {
      builder[m] = vi.fn().mockReturnValue(builder);
    }
    let call = 0;
    builder.maybeSingle = vi.fn().mockImplementation(() => {
      call++;
      return Promise.resolve({ data: call === 1 ? null : { id: "sub-2" }, error: null });
    });
    vi.mocked(createServerClient).mockReturnValue({
      from: vi.fn().mockReturnValue(builder),
    } as never);
    expect(await isSubscribed("device-1", "year-1", "subject-1")).toBe(true);
  });

  it("returns false when no matching subscription", async () => {
    mockSupabase(null);
    expect(await isSubscribed("device-1", "year-1", "subject-1")).toBe(false);
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

  it("queries by user_id when a valid userId is supplied", async () => {
    const builder = mockSupabase({ id: "sub-1" });
    await isSubscribed(
      "device-1",
      "11111111-1111-1111-1111-111111111111",
      undefined,
      "33333333-3333-3333-3333-333333333333"
    );
    const eqCalls = (builder.eq as ReturnType<typeof vi.fn>).mock.calls as Array<[string, string]>;
    expect(eqCalls.some(([c]) => c === "user_id")).toBe(true);
    expect(eqCalls.some(([c]) => c === "device_id")).toBe(false);
  });
});

describe("isSubscribed - class membership branch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.UNLOCK_ALL;
  });

  // subscriptions table always misses (no direct plan); class_members table
  // is the one under test here. Dispatch per-table like payments.test.ts does.
  function mockSupabaseWithClassMembership(membershipData: unknown) {
    const subsBuilder: Record<string, unknown> = {};
    for (const m of ["select", "eq", "is", "gt", "limit"]) {
      subsBuilder[m] = vi.fn().mockReturnValue(subsBuilder);
    }
    subsBuilder.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

    const classMembersBuilder: Record<string, unknown> = {};
    for (const m of ["select", "eq", "gt", "limit"]) {
      classMembersBuilder[m] = vi.fn().mockReturnValue(classMembersBuilder);
    }
    classMembersBuilder.maybeSingle = vi
      .fn()
      .mockResolvedValue({ data: membershipData, error: null });

    vi.mocked(createServerClient).mockReturnValue({
      from: vi.fn((table: string) =>
        table === "class_members" ? classMembersBuilder : subsBuilder
      ),
    } as never);

    return { subsBuilder, classMembersBuilder };
  }

  it("returns true when device joined an active class for that subject", async () => {
    const { classMembersBuilder } = mockSupabaseWithClassMembership({
      class_id: "class-1",
    });

    const result = await isSubscribed("device-1", "year-1", "subject-1");

    expect(result).toBe(true);
    expect(classMembersBuilder.eq).toHaveBeenCalledWith("device_id", "device-1");
    expect(classMembersBuilder.eq).toHaveBeenCalledWith("classes.subject_id", "subject-1");
    expect(classMembersBuilder.eq).toHaveBeenCalledWith("classes.year_id", "year-1");
    expect(classMembersBuilder.eq).toHaveBeenCalledWith("classes.status", "active");
  });

  it("returns false when the joined class has expired", async () => {
    // current_period_end in the past: the .gt() filter excludes it at the
    // query level, so the mock returns no row for this case.
    mockSupabaseWithClassMembership(null);

    const result = await isSubscribed("device-1", "year-1", "subject-1");

    expect(result).toBe(false);
  });

  it("does not check class membership when no subjectId is supplied", async () => {
    const { classMembersBuilder } = mockSupabaseWithClassMembership({
      class_id: "class-1",
    });

    const result = await isSubscribed("device-1", "year-1");

    expect(result).toBe(false);
    expect(classMembersBuilder.select).not.toHaveBeenCalled();
  });
});
