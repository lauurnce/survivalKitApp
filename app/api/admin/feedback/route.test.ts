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

  // Second call for stats. The route pages through every row with .range(),
  // and this mock enforces PostgREST's 1000-row max per request.
  const statsRangeMock = vi.fn((from: number, to: number) =>
    Promise.resolve({
      data: statsData.slice(from, Math.min(to + 1, from + 1000)),
      error: null,
    }),
  );
  const statsSelectMock = vi.fn().mockReturnValue({
    order: vi.fn().mockReturnValue({ range: statsRangeMock }),
  });

  const statsQueryChain = {
    select: statsSelectMock,
  };

  // Override from() to return different chains for different calls
  let callCount = 0;
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

  return { supabase, selectMock, orderMock, rangeMock, statsSelectMock, statsRangeMock };
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

  describe("sort allow-list", () => {
    it.each([
      ["created_at", "created_at"],
      ["app_rating", "app_rating"],
      ["module_rating", "module_rating"],
      // Ordering the parent rows by a to-one embed uses PostgREST's
      // `order=modules(title)`; `order=modules` is a 42703 error.
      ["module", "modules(title)"],
    ])("sort=%s orders by %s", async (sort, column) => {
      const mock = makeSupabase({});
      mockSupabase = mock.supabase;

      const res = await GET(makeReq(`/api/admin/feedback?sort=${sort}&order=asc`) as any);

      expect(res.status).toBe(200);
      expect(mock.orderMock).toHaveBeenCalledWith(column, { ascending: true });
    });

    it.each(["modules", "feedback_text", "user_id;drop", "modules(title)"])(
      "rejects unknown sort %s with 400 before querying",
      async (sort) => {
        const mock = makeSupabase({});
        mockSupabase = mock.supabase;

        const res = await GET(makeReq(`/api/admin/feedback?sort=${encodeURIComponent(sort)}`) as any);
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.error).toMatch(/sort/i);
        expect(mock.supabase.from).not.toHaveBeenCalled();
      }
    );

    it("rejects an unknown order direction with 400", async () => {
      const res = await GET(makeReq("/api/admin/feedback?order=sideways") as any);
      expect(res.status).toBe(400);
    });
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

describe("user column (GT-07)", () => {
  beforeEach(() => {
    mockAuthed = true;
  });

  it("returns the registered user's email and name, looked up server-side", async () => {
    const mock = makeSupabase({});
    const getUserById = vi.fn(async (id: string) => ({
      data: { user: { id, email: `${id}@example.com` } },
      error: null,
    }));
    const profilesIn = vi.fn().mockResolvedValue({
      data: [{ user_id: "user-1", first_name: "Juan", last_name: "Dela Cruz" }],
      error: null,
    });
    const baseFrom = mock.supabase.from;
    (mock.supabase as any).from = vi.fn((table: string) =>
      table === "profiles" ? { select: () => ({ in: profilesIn }) } : baseFrom(table),
    );
    (mock.supabase as any).auth = { admin: { getUserById } };
    mockSupabase = mock.supabase;

    const json = await (await GET(makeReq("/api/admin/feedback") as any)).json();

    expect(json.data[0].user_email).toBe("user-1@example.com");
    expect(json.data[0].user_name).toBe("Juan Dela Cruz");
    // Anonymous rows are never looked up.
    expect(getUserById).toHaveBeenCalledTimes(1);
    expect(json.data[1].user_email).toBeNull();
  });

  it("still answers when the lookup fails, leaving the id for the table to show", async () => {
    const mock = makeSupabase({});
    (mock.supabase as any).auth = {
      admin: { getUserById: vi.fn().mockRejectedValue(new Error("auth down")) },
    };
    mockSupabase = mock.supabase;
    vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await GET(makeReq("/api/admin/feedback") as any);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data[0].user_email).toBeNull();
    expect(json.data[0].user_id).toBe("user-1");
  });
});

describe("stats past the 1000-row cap (GT-15)", () => {
  beforeEach(() => {
    mockAuthed = true;
  });

  it("counts every feedback row, not just the first 1000", async () => {
    const rows = Array.from({ length: 1500 }, (_, i) => ({
      app_rating: i < 1000 ? 5 : 1,
      module_rating: 4,
      is_quality_approved: true,
      coupon_code: null,
      redeemed_at: null,
    }));
    const mock = makeSupabase({ statsData: rows });
    mockSupabase = mock.supabase;

    const json = await (await GET(makeReq("/api/admin/feedback") as any)).json();
    expect(json.stats.total_feedback).toBe(1500);
    // (1000 * 5 + 500 * 1) / 1500
    expect(json.stats.avg_app_rating).toBeCloseTo(3.67, 2);
    expect(mock.statsRangeMock).toHaveBeenCalledTimes(2);
  });
});
