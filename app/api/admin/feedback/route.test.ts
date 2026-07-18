import { describe, it, expect, vi, beforeEach } from "vitest";

// Controllable per-test: whether getAdminSession() resolves authenticated.
let mockAuthed = true;
vi.mock("@/lib/auth/adminSession", () => ({
  getAdminSession: () => Promise.resolve(mockAuthed),
}));

function makeSupabase(opts: {
  selectError?: { message: string } | null;
  selectData?: any;
  statsData?: any;
} = {}) {
  const selectError = opts.selectError ?? null;
  const selectData = opts.selectData ?? [
    {
      id: "feedback-1",
      created_at: "2026-07-18T10:00:00Z",
      module_id: "module-1",
      modules: { name: "Introduction to Programming" },
      app_rating: 5,
      module_rating: 4,
      feedback_text: "Great course!",
      user_id: "user-1",
      is_anonymous: false,
      is_quality_approved: true,
      coupon_code: "FEEDBACK-ABC123",
      coupon_expires_at: "2026-08-18T10:00:00Z",
    },
    {
      id: "feedback-2",
      created_at: "2026-07-17T10:00:00Z",
      module_id: "module-2",
      modules: { name: "Data Structures" },
      app_rating: 4,
      module_rating: 3,
      feedback_text: "Good but could be clearer",
      user_id: null,
      is_anonymous: true,
      is_quality_approved: false,
      coupon_code: null,
      coupon_expires_at: null,
    },
  ];

  const statsData = opts.statsData ?? selectData;

  let orderCalled = false;
  let rangeCalled = false;

  const rangeMock = vi.fn().mockResolvedValue({
    data: selectData,
    error: selectError,
    count: selectData.length,
  });

  const orderMock = vi.fn().mockReturnValue({ range: rangeMock });

  const queryChain = {
    eq: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: orderMock,
  };

  const selectMock = vi.fn().mockReturnValue(queryChain);

  const supabase = {
    from: vi.fn((table: string) => {
      if (table === "user_feedback") {
        return {
          select: selectMock,
        };
      }
      return null;
    }),
  };

  // Second call for stats
  const statsSelectMock = vi.fn().mockResolvedValue({
    data: statsData,
    error: null,
  });

  const statsQueryChain = {
    select: statsSelectMock,
  };

  // Override from() to return different chains for different calls
  let callCount = 0;
  const originalFrom = supabase.from;
  supabase.from = vi.fn((table: string) => {
    callCount++;
    if (table === "user_feedback") {
      if (callCount === 1) {
        // First call: main query
        return {
          select: selectMock,
        };
      } else {
        // Second call: stats query
        return statsQueryChain;
      }
    }
    return null;
  });

  return { supabase, selectMock, orderMock, rangeMock, statsSelectMock };
}

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => mockSupabase,
}));

// Populated per-test before importing/calling GET.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockSupabase: any;

import { GET } from "./route";

function makeReq(url: string) {
  return new Request(`http://localhost:3000${url}`, {
    method: "GET",
  });
}

describe("GET /api/admin/feedback", () => {
  beforeEach(() => {
    mockAuthed = true;
    mockSupabase = makeSupabase({}).supabase;
  });

  it("requires admin authentication", async () => {
    mockAuthed = false;
    const req = makeReq("/api/admin/feedback");
    const res = await GET(req as any);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Admin access required");
  });

  it("returns paginated feedback with default params", async () => {
    const req = makeReq("/api/admin/feedback");
    const res = await GET(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(2);
    expect(json.pagination).toEqual({
      page: 1,
      limit: 50,
      total: 2,
    });
    expect(json.stats).toBeDefined();
  });

  it("calculates stats correctly", async () => {
    const req = makeReq("/api/admin/feedback");
    const res = await GET(req as any);
    const json = await res.json();

    expect(json.stats).toEqual({
      total_feedback: 2,
      avg_app_rating: 4.5,
      avg_module_rating: 3.5,
      pct_approved: 50,
      total_codes_generated: 1,
      total_codes_redeemed: 0,
    });
  });

  it("applies pagination parameters", async () => {
    const req = makeReq("/api/admin/feedback?page=2&limit=10");
    const res = await GET(req as any);
    const json = await res.json();

    expect(json.pagination.page).toBe(2);
    expect(json.pagination.limit).toBe(10);
  });

  it("transforms feedback data with module names", async () => {
    const req = makeReq("/api/admin/feedback");
    const res = await GET(req as any);
    const json = await res.json();

    const first = json.data[0];
    expect(first.id).toBe("feedback-1");
    expect(first.module_name).toBe("Introduction to Programming");
    expect(first.app_rating).toBe(5);
    expect(first.module_rating).toBe(4);
  });

  it("handles database error gracefully", async () => {
    mockSupabase = makeSupabase({
      selectError: { message: "Database error" },
    }).supabase;

    const req = makeReq("/api/admin/feedback");
    const res = await GET(req as any);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe("Failed to fetch feedback");
  });

  it("handles empty result set", async () => {
    mockSupabase = makeSupabase({ selectData: [] }).supabase;

    const req = makeReq("/api/admin/feedback");
    const res = await GET(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toEqual([]);
    expect(json.stats.total_feedback).toBe(0);
    expect(json.stats.avg_app_rating).toBe(0);
  });
});
