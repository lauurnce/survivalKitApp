import { describe, it, expect, vi, beforeEach } from "vitest";

// Controllable per-test: whether getAdminSession() resolves authenticated.
let mockAuthed = true;
vi.mock("@/lib/auth/adminSession", () => ({
  getAdminSession: () => Promise.resolve(mockAuthed),
}));

// Chainable Supabase mock, dispatched per-table like lib/payments.test.ts:
// payments: insert() resolves directly (ledger row, no chaining needed).
// classes: insert().select().single() resolves the created row (or a 23505
// collision on the first N attempts, to exercise the retry loop).
function makeSupabase(opts: {
  paymentsInsertError?: { message: string; code?: string } | null;
  classesInsertErrors?: ({ message: string; code?: string } | null)[];
}) {
  const calls: string[] = [];

  const paymentsInsert = vi.fn().mockImplementation(() => {
    calls.push("payments.insert");
    return Promise.resolve({ error: opts.paymentsInsertError ?? null });
  });
  const paymentsBuilder = { insert: paymentsInsert };

  const classesInsertErrors = opts.classesInsertErrors ?? [null];
  let classesInsertCallIndex = 0;
  const classesSingle = vi.fn().mockImplementation(() => {
    const err = classesInsertErrors[classesInsertCallIndex] ?? null;
    classesInsertCallIndex++;
    if (err) return Promise.resolve({ data: null, error: err });
    return Promise.resolve({ data: { id: "class-1" }, error: null });
  });
  const classesSelect = vi.fn().mockReturnValue({ single: classesSingle });
  const classesInsert = vi.fn().mockImplementation(() => {
    calls.push("classes.insert");
    return { select: classesSelect };
  });
  const classesBuilder = { insert: classesInsert };

  const supabase = {
    from: vi.fn((table: string) => (table === "payments" ? paymentsBuilder : classesBuilder)),
  };
  return { supabase, calls, paymentsInsert, classesInsert, classesSingle };
}

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => mockSupabase,
}));

// Populated per-test before importing/calling POST.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockSupabase: any;

import { POST } from "./route";

const YEAR = "22222222-2222-2222-2222-222222222222";
const SUBJ = "33333333-3333-3333-3333-333333333333";
const REP_DEVICE = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

function makeReq(body: Record<string, unknown>) {
  return {
    json: () => Promise.resolve(body),
  } as unknown as import("next/server").NextRequest;
}

const validBody = {
  name: "BSIT 2A",
  subjectId: SUBJ,
  yearId: YEAR,
  repDeviceId: REP_DEVICE,
  amount: 15000,
  periodEnd: "2026-12-31T00:00:00.000Z",
};

describe("POST /api/admin/grant-class", () => {
  beforeEach(() => {
    mockAuthed = true;
    mockSupabase = makeSupabase({}).supabase;
  });

  it("rejects unauthenticated requests", async () => {
    mockAuthed = false;
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("rejects invalid subjectId", async () => {
    const res = await POST(makeReq({ ...validBody, subjectId: "not-a-uuid" }));
    expect(res.status).toBe(400);
  });

  it("rejects a missing/invalid amount", async () => {
    const res = await POST(makeReq({ ...validBody, amount: 0 }));
    expect(res.status).toBe(400);
    const res2 = await POST(makeReq({ ...validBody, amount: undefined }));
    expect(res2.status).toBe(400);
  });

  it("inserts a payments row before the classes row on success", async () => {
    const { supabase, calls } = makeSupabase({});
    mockSupabase = supabase;

    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.classId).toBe("class-1");
    expect(typeof json.code).toBe("string");
    expect(json.code).toHaveLength(6);

    expect(calls).toEqual(["payments.insert", "classes.insert"]);
  });

  it("does not attempt to create a class when the payment insert fails", async () => {
    const { supabase, calls } = makeSupabase({
      paymentsInsertError: { message: "db error" },
    });
    mockSupabase = supabase;

    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(500);
    expect(calls).toEqual(["payments.insert"]);
  });

  it("retries with a new code on a class-code collision (23505) then succeeds", async () => {
    const { supabase, classesInsert } = makeSupabase({
      classesInsertErrors: [{ message: "duplicate", code: "23505" }, null],
    });
    mockSupabase = supabase;

    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(200);
    expect(classesInsert).toHaveBeenCalledTimes(2);
  });

  it("uses the block-<uuid> paymongo_link_id convention for the ledger row", async () => {
    const { supabase, paymentsInsert } = makeSupabase({});
    mockSupabase = supabase;

    await POST(makeReq(validBody));
    const insertedArg = paymentsInsert.mock.calls[0][0];
    expect(insertedArg.paymongo_link_id).toMatch(
      /^block-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });
});
