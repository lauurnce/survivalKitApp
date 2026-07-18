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
      modules: { title: "Introduction to Programming" },
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
      modules: { title: "Data Structures" },
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

  // The route ends its chain with .returns<T>() (type override), so range()
  // yields one more chainable step before the awaited result.
  const rangeMock = vi.fn().mockReturnValue({
    returns: vi.fn().mockResolvedValue({
      data: selectData,
      error: selectError,
      count: selectData.length,
    }),
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

  it("counts redeemed coupons in stats", async () => {
    const rows = [
      {
        app_rating: 5,
        module_rating: 4,
        is_quality_approved: true,
        coupon_code: "FEEDBACK-AAA111",
        redeemed_at: "2026-07-18T12:00:00Z",
      },
      {
        app_rating: 4,
        module_rating: 3,
        is_quality_approved: true,
        coupon_code: "FEEDBACK-BBB222",
        redeemed_at: null,
      },
      {
        app_rating: 3,
        module_rating: 3,
        is_quality_approved: false,
        coupon_code: null,
        redeemed_at: null,
      },
    ];
    mockSupabase = makeSupabase({ statsData: rows }).supabase;

    const req = makeReq("/api/admin/feedback");
    const res = await GET(req as any);
    const json = await res.json();

    expect(json.stats.total_codes_generated).toBe(2);
    expect(json.stats.total_codes_redeemed).toBe(1);
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

  describe("PostgREST operator injection tests", () => {
    it("escapes comma operator in search", async () => {
      const { supabase, selectMock } = makeSupabase({});
      mockSupabase = supabase;

      // Create a mock that captures the .or() call
      let orCalledWith = "";
      selectMock.mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        or: vi.fn((filterStr: string) => {
          orCalledWith = filterStr;
          return {
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockReturnValue({
                returns: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                  count: 0,
                }),
              }),
            }),
          };
        }),
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockReturnValue({
            returns: vi.fn().mockResolvedValue({
              data: [],
              error: null,
              count: 0,
            }),
          }),
        }),
      });

      const req = makeReq("/api/admin/feedback?search=hello,world");
      const res = await GET(req as any);

      expect(res.status).toBe(200);
      // Verify comma was escaped
      expect(orCalledWith).toContain("\\,");
      expect(orCalledWith).not.toContain("hello,world");
    });

    it("escapes parentheses operators in search", async () => {
      const { supabase, selectMock } = makeSupabase({});
      mockSupabase = supabase;

      let orCalledWith = "";
      selectMock.mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        or: vi.fn((filterStr: string) => {
          orCalledWith = filterStr;
          return {
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockReturnValue({
                returns: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                  count: 0,
                }),
              }),
            }),
          };
        }),
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockReturnValue({
            returns: vi.fn().mockResolvedValue({
              data: [],
              error: null,
              count: 0,
            }),
          }),
        }),
      });

      const req = makeReq("/api/admin/feedback?search=hello(world)");
      const res = await GET(req as any);

      expect(res.status).toBe(200);
      // Verify parentheses were escaped
      expect(orCalledWith).toContain("\\(");
      expect(orCalledWith).toContain("\\)");
      expect(orCalledWith).not.toContain("hello(world)");
    });

    it("escapes colon operator in search", async () => {
      const { supabase, selectMock } = makeSupabase({});
      mockSupabase = supabase;

      let orCalledWith = "";
      selectMock.mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        or: vi.fn((filterStr: string) => {
          orCalledWith = filterStr;
          return {
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockReturnValue({
                returns: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                  count: 0,
                }),
              }),
            }),
          };
        }),
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockReturnValue({
            returns: vi.fn().mockResolvedValue({
              data: [],
              error: null,
              count: 0,
            }),
          }),
        }),
      });

      const req = makeReq("/api/admin/feedback?search=text:value");
      const res = await GET(req as any);

      expect(res.status).toBe(200);
      // Verify colon was escaped
      expect(orCalledWith).toContain("\\:");
      expect(orCalledWith).not.toContain("text:value");
    });

    it("escapes asterisk operator in search", async () => {
      const { supabase, selectMock } = makeSupabase({});
      mockSupabase = supabase;

      let orCalledWith = "";
      selectMock.mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        or: vi.fn((filterStr: string) => {
          orCalledWith = filterStr;
          return {
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockReturnValue({
                returns: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                  count: 0,
                }),
              }),
            }),
          };
        }),
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockReturnValue({
            returns: vi.fn().mockResolvedValue({
              data: [],
              error: null,
              count: 0,
            }),
          }),
        }),
      });

      const req = makeReq("/api/admin/feedback?search=text*value");
      const res = await GET(req as any);

      expect(res.status).toBe(200);
      // Verify asterisk was escaped
      expect(orCalledWith).toContain("\\*");
      expect(orCalledWith).not.toContain("text*value");
    });

    it("escapes multiple PostgREST operators in single search", async () => {
      const { supabase, selectMock } = makeSupabase({});
      mockSupabase = supabase;

      let orCalledWith = "";
      selectMock.mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        or: vi.fn((filterStr: string) => {
          orCalledWith = filterStr;
          return {
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockReturnValue({
                returns: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                  count: 0,
                }),
              }),
            }),
          };
        }),
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockReturnValue({
            returns: vi.fn().mockResolvedValue({
              data: [],
              error: null,
              count: 0,
            }),
          }),
        }),
      });

      const req = makeReq("/api/admin/feedback?search=test,data(query):value*");
      const res = await GET(req as any);

      expect(res.status).toBe(200);
      // Verify all operators were escaped
      expect(orCalledWith).toContain("\\,");
      expect(orCalledWith).toContain("\\(");
      expect(orCalledWith).toContain("\\)");
      expect(orCalledWith).toContain("\\:");
      expect(orCalledWith).toContain("\\*");
    });

    it("allows legitimate search strings without operators", async () => {
      const { supabase, selectMock } = makeSupabase({});
      mockSupabase = supabase;

      let orCalledWith = "";
      selectMock.mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        or: vi.fn((filterStr: string) => {
          orCalledWith = filterStr;
          return {
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockReturnValue({
                returns: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                  count: 0,
                }),
              }),
            }),
          };
        }),
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockReturnValue({
            returns: vi.fn().mockResolvedValue({
              data: [],
              error: null,
              count: 0,
            }),
          }),
        }),
      });

      const req = makeReq(
        "/api/admin/feedback?search=normal search string with spaces"
      );
      const res = await GET(req as any);

      expect(res.status).toBe(200);
      // Verify legitimate search term passes through
      expect(orCalledWith).toContain("normal search string with spaces");
    });
  });
});
