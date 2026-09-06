# PayMongo Reconciliation: Support Checkout Sessions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make admin payment reconciliation (`findUnreflectedPayments` / `/api/admin/reconcile`) correctly discover and manually grant PayMongo **Checkout Sessions** purchases, not just the discontinued Links API purchases it already handles.

**Architecture:** `GET /v1/payments` (the list endpoint `listRecentPaidLinks` already calls) returns each payment's `metadata` inline — confirmed empirically against a real paid test-mode transaction (see Task 1). A Checkout-Sessions-era payment therefore needs **zero extra PayMongo calls** to resolve: read `metadata.remarks` straight off the listed row and key the resulting `PaidLink.linkId` on the payment's own id (`pay_xxx`), because `GET /v1/payments` can only ever surface a payment by that id, never by its checkout session's id. The legacy Links-era path (`external_reference_number` + `getLinkByReference`) is untouched and still runs for any pre-2026-09-03 payment. The single-item admin "Grant access" action gets a matching new `getPaymentById` lookup for the same reason PR #77's webhook needed one: PayMongo's own truth must be re-derived server-side, never trusted from the client.

**Tech Stack:** TypeScript, Next.js App Router API routes, Vitest, the existing `lib/paymongo.ts` fetch-based PayMongo client (no SDK).

**Spec:** GitHub issue #78 on `lauurnce/survivalKitApp` — "Admin reconcile-by-reference doesn't cover Checkout Sessions purchases." This plan resolves the issue's open design question (verified in Task 1, not assumed).

## Global Constraints

- Never trust a client-supplied amount/status/remarks for granting access — every grant path must re-derive from PayMongo's own API response, matching the existing `getLinkByReference`/webhook pattern.
- `PaidLink.linkId` must never be an empty string — it's used as a React list key and Supabase `paymongo_link_id` join key; an empty value causes silent collisions.
- Keep the legacy Links-era resolution path (`getLinkByReference`, `external_reference_number`) completely unmodified — pre-migration payments must keep resolving exactly as they do today.
- Full suite (`npx vitest run`), `npx tsc --noEmit`, and `npm run lint` must all pass before any commit that isn't a "write the failing test" step.
- Work happens in the worktree `~/projects/survivalKitApp-reconcile` (branch `fix/reconcile-checkout-sessions`), already created and symlinked (`.env.local`, `node_modules`) as siblings of the main checkout — never touch the main checkout's working tree for this plan's files.

---

## Task 1: `lib/paymongo.ts` — `getPaymentById` and a fixed `listRecentPaidLinks`

**Files:**
- Modify: `lib/paymongo.ts:257-376` (the `PaymentRow` interface, `getLinkByReference`'s neighboring comment block, and `listRecentPaidLinks`)
- Test: `lib/paymongo.test.ts`

**Interfaces:**
- Produces: `getPaymentById(paymentId: string): Promise<{ remarks: string; amount: number; status: string } | null>` — new exported function, used by Task 2.
- Produces: `listRecentPaidLinks(maxPages?: number): Promise<PaidLink[]>` — same exported signature and `PaidLink` shape as today (`{ linkId, amount, description, reference, paidAt, remarks, yearId, subjectId, deviceId, userId, plan }`, from the existing `PaidLink` interface at `lib/paymongo.ts:198-208`) — no consumer of this function needs to change.

- [ ] **Step 1: Write the failing tests for `getPaymentById`**

Add to `lib/paymongo.test.ts`, after the existing `describe("getLinkByReference", ...)` block:

```typescript
describe("getPaymentById", () => {
  beforeEach(() => {
    process.env.PAYMONGO_SECRET_KEY = FAKE_SECRET;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.PAYMONGO_SECRET_KEY;
  });

  it("fetches the payment by id and extracts remarks, amount, and status", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: "pay_abc123",
          attributes: {
            metadata: { remarks: "year:y device:d plan:year_sem" },
            amount: 29900,
            status: "paid",
          },
        },
      }),
    } as Response);

    const result = await getPaymentById("pay_abc123");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.paymongo.com/v1/payments/pay_abc123",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: expect.stringContaining("Basic") }),
      })
    );
    expect(result).toEqual({
      remarks: "year:y device:d plan:year_sem",
      amount: 29900,
      status: "paid",
    });
  });

  it("returns empty remarks when the payment has no metadata", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { id: "pay_nometa", attributes: { amount: 4900, status: "paid" } },
      }),
    } as Response);

    const result = await getPaymentById("pay_nometa");
    expect(result).toEqual({ remarks: "", amount: 4900, status: "paid" });
  });

  it("returns null when PayMongo has no such payment", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ errors: [{ code: "not_found" }] }),
    } as Response);

    expect(await getPaymentById("pay_nope")).toBeNull();
  });

  it("throws if PAYMONGO_SECRET_KEY is missing", async () => {
    delete process.env.PAYMONGO_SECRET_KEY;
    await expect(getPaymentById("pay_abc123")).rejects.toThrow("PAYMONGO_SECRET_KEY");
  });
});
```

Add `getPaymentById` to the existing import block at the top of `lib/paymongo.test.ts` (alongside `getLinkByReference`).

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd ~/projects/survivalKitApp-reconcile && npx vitest run lib/paymongo.test.ts -t "getPaymentById"`
Expected: FAIL — `getPaymentById is not a function` / not exported.

- [ ] **Step 3: Implement `getPaymentById`**

In `lib/paymongo.ts`, add directly after `getLinkByReference` (after line 290, before the `listRecentPaidLinks` comment block at line 292):

```typescript
// Resolve a single Payment by its own id (pay_xxx) — the only supported
// lookup for a Checkout-Sessions-era purchase. Unlike Links, a Payment has
// no reference_number lookup at all; the admin manual-grant action instead
// takes the payment id straight from a findUnreflectedPayments row.
export async function getPaymentById(
  paymentId: string
): Promise<{ remarks: string; amount: number; status: string } | null> {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) throw new Error("PAYMONGO_SECRET_KEY is not set");
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");

  const res = await fetch(
    `https://api.paymongo.com/v1/payments/${encodeURIComponent(paymentId)}`,
    { headers: { Authorization: `Basic ${encoded}` } }
  );
  if (!res.ok) return null;
  const json = await res.json();
  const attrs = json?.data?.attributes;
  if (!attrs) return null;

  return {
    remarks: typeof attrs.metadata?.remarks === "string" ? attrs.metadata.remarks : "",
    amount: typeof attrs.amount === "number" ? attrs.amount : 0,
    status: (attrs.status ?? "") as string,
  };
}
```

- [ ] **Step 4: Run tests to verify `getPaymentById` passes**

Run: `cd ~/projects/survivalKitApp-reconcile && npx vitest run lib/paymongo.test.ts -t "getPaymentById"`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
cd ~/projects/survivalKitApp-reconcile
git add lib/paymongo.ts lib/paymongo.test.ts
git commit -m "feat(payments): add getPaymentById for Checkout Sessions reconciliation"
```

- [ ] **Step 6: Write the failing tests for the fixed `listRecentPaidLinks`**

Add a new `describe("listRecentPaidLinks", ...)` block to `lib/paymongo.test.ts`, after the new `getPaymentById` block:

```typescript
describe("listRecentPaidLinks", () => {
  beforeEach(() => {
    process.env.PAYMONGO_SECRET_KEY = FAKE_SECRET;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.PAYMONGO_SECRET_KEY;
  });

  function paymentsListPage(rows: unknown[]) {
    return { ok: true, json: async () => ({ data: rows }) } as Response;
  }

  it("resolves a Checkout-Sessions-era payment from its inline metadata, with no extra fetch", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      paymentsListPage([
        {
          id: "pay_cs1",
          attributes: {
            status: "paid",
            amount: 29900,
            description: "BSIT Survival Kit",
            paid_at: 1788664145,
            external_reference_number: null,
            metadata: { remarks: "year:y device:d plan:year_sem" },
          },
        },
      ])
    );

    const result = await listRecentPaidLinks();

    // Exactly one fetch call — the list page itself. No per-item resolution.
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      {
        linkId: "pay_cs1",
        amount: 29900,
        description: "BSIT Survival Kit",
        reference: "",
        paidAt: new Date(1788664145 * 1000),
        remarks: "year:y device:d plan:year_sem",
        yearId: "y",
        subjectId: null,
        deviceId: "d",
        userId: null,
        plan: "year_sem",
      },
    ]);
  });

  it("still resolves a legacy Links-era payment by reference, unchanged", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        paymentsListPage([
          {
            id: "pay_legacy1",
            attributes: {
              status: "paid",
              amount: 4900,
              description: "BSIT Survival Kit",
              paid_at: 1788664000,
              external_reference_number: "REF123",
            },
          },
        ])
      )
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: "link_legacy1",
            attributes: { remarks: "year:y device:d", amount: 4900, status: "paid" },
          },
        }),
      } as Response);

    const result = await listRecentPaidLinks();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "https://api.paymongo.com/v1/links/REF123",
      expect.anything()
    );
    expect(result[0]).toMatchObject({ linkId: "link_legacy1", reference: "REF123" });
  });

  it("resolves a mixed batch of legacy and Checkout-Sessions payments in one call", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        paymentsListPage([
          {
            id: "pay_legacy2",
            attributes: {
              status: "paid",
              amount: 4900,
              description: "d",
              paid_at: 1,
              external_reference_number: "REF456",
            },
          },
          {
            id: "pay_cs2",
            attributes: {
              status: "paid",
              amount: 9900,
              description: "d",
              paid_at: 2,
              metadata: { remarks: "year:y2 device:d2 plan:subject_sem" },
            },
          },
        ])
      )
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { id: "link_legacy2", attributes: { remarks: "year:y1 device:d1", amount: 4900, status: "paid" } },
        }),
      } as Response);

    const result = await listRecentPaidLinks();

    expect(result).toHaveLength(2);
    expect(result.find((r) => r.linkId === "link_legacy2")).toBeTruthy();
    expect(result.find((r) => r.linkId === "pay_cs2")).toMatchObject({ yearId: "y2", deviceId: "d2" });
  });

  it("never leaves linkId empty when a payment has neither metadata nor a resolvable reference", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      paymentsListPage([
        {
          id: "pay_orphan",
          attributes: { status: "paid", amount: 100, description: "d", paid_at: 1 },
        },
      ])
    );

    const result = await listRecentPaidLinks();
    expect(result[0].linkId).toBe("pay_orphan");
    expect(result[0].remarks).toBe("");
  });

  it("falls back to the payment's own id when a legacy reference fails to resolve at PayMongo", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        paymentsListPage([
          {
            id: "pay_deadref",
            attributes: {
              status: "paid",
              amount: 100,
              description: "d",
              paid_at: 1,
              external_reference_number: "GONE",
            },
          },
        ])
      )
      .mockResolvedValueOnce({ ok: false, json: async () => ({ errors: [] }) } as Response);

    const result = await listRecentPaidLinks();
    expect(result[0].linkId).toBe("pay_deadref");
  });

  it("ignores unpaid payments", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      paymentsListPage([{ id: "pay_failed", attributes: { status: "failed", amount: 100, description: "d" } }])
    );
    expect(await listRecentPaidLinks()).toEqual([]);
  });
});
```

- [ ] **Step 7: Run tests to verify they fail**

Run: `cd ~/projects/survivalKitApp-reconcile && npx vitest run lib/paymongo.test.ts -t "listRecentPaidLinks"`
Expected: FAIL — current implementation skips rows with no `external_reference_number`, so the Checkout-Sessions and mixed-batch tests fail; the "never leaves linkId empty" and "falls back" tests fail because current code can produce `linkId: ""`.

- [ ] **Step 8: Implement the fix**

Replace `lib/paymongo.ts:257-376` (the `PaymentRow` interface through the end of `listRecentPaidLinks`) with:

```typescript
interface PaymentRow {
  id: string;               // the payment's own id — always present, always unique
  reference: string;        // external_reference_number == the link's reference (legacy only)
  metadataRemarks: string | null; // Checkout-Sessions-era payments carry remarks here
  amount: number;           // centavos
  description: string;
  paidAt: Date | null;
}

// Resolve a single Link by its reference_number. Returns the link id + remarks,
// or null if PayMongo has no such link. The only supported way to read remarks
// for a pre-migration (Links API) purchase.
// PayMongo resolves references at GET /v1/links/{reference}; the query-param
// form (?reference_number=) is not a real route and 404s.
export async function getLinkByReference(
  reference: string
): Promise<{ linkId: string; remarks: string; amount: number; status: string } | null> {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) throw new Error("PAYMONGO_SECRET_KEY is not set");
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");

  const res = await fetch(
    `https://api.paymongo.com/v1/links/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Basic ${encoded}` } }
  );
  if (!res.ok) return null;
  const json = await res.json();
  // This endpoint returns an array under data even for a single reference.
  const row = Array.isArray(json?.data) ? json.data[0] : json?.data;
  if (!row?.id) return null;
  return {
    linkId: row.id as string,
    remarks: (row.attributes?.remarks ?? "") as string,
    amount: typeof row.attributes?.amount === "number" ? row.attributes.amount : 0,
    status: (row.attributes?.status ?? "") as string,
  };
}

// Resolve a single Payment by its own id (pay_xxx) — the only supported
// lookup for a Checkout-Sessions-era purchase. Unlike Links, a Payment has
// no reference_number lookup at all; the admin manual-grant action instead
// takes the payment id straight from a findUnreflectedPayments row.
export async function getPaymentById(
  paymentId: string
): Promise<{ remarks: string; amount: number; status: string } | null> {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) throw new Error("PAYMONGO_SECRET_KEY is not set");
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");

  const res = await fetch(
    `https://api.paymongo.com/v1/payments/${encodeURIComponent(paymentId)}`,
    { headers: { Authorization: `Basic ${encoded}` } }
  );
  if (!res.ok) return null;
  const json = await res.json();
  const attrs = json?.data?.attributes;
  if (!attrs) return null;

  return {
    remarks: typeof attrs.metadata?.remarks === "string" ? attrs.metadata.remarks : "",
    amount: typeof attrs.amount === "number" ? attrs.amount : 0,
    status: (attrs.status ?? "") as string,
  };
}

// List recent PAID payments from PayMongo and resolve each one's remarks.
// A Checkout-Sessions-era payment (post-2026-09-03) carries metadata.remarks
// directly on the listed row — GET /v1/payments returns it inline, verified
// against a real paid test-mode transaction, so no extra fetch is needed. A
// legacy Links-era payment carries no metadata but an external_reference_
// number, resolved via getLinkByReference exactly as before. linkId is never
// left empty: it's the payment's own id unless a legacy reference resolves
// to a real Link id. Returns the same PaidLink shape the reconcile matcher
// expects. Bounded: lists up to `maxPages` pages of payments. Live secret
// key only — never expose this to the client.
export async function listRecentPaidLinks(maxPages = 3): Promise<PaidLink[]> {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) throw new Error("PAYMONGO_SECRET_KEY is not set");
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");

  // 1. Collect recent paid payments (real list endpoint).
  const paidPayments: PaymentRow[] = [];
  let after: string | null = null;

  for (let page = 0; page < maxPages; page++) {
    const url = new URL("https://api.paymongo.com/v1/payments");
    url.searchParams.set("limit", "100");
    if (after) url.searchParams.set("after", after);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Basic ${encoded}` },
    });
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      const detail = json?.errors?.[0]?.detail ?? `HTTP ${res.status}`;
      throw new Error(`PayMongo payments list error: ${detail}`);
    }
    const json = await res.json();
    const rows = (json?.data ?? []) as Array<{
      id: string;
      attributes: {
        status?: string;
        amount?: number;
        description?: string;
        paid_at?: number;
        external_reference_number?: string;
        metadata?: { remarks?: string };
      };
    }>;

    if (rows.length === 0) break;

    for (const row of rows) {
      const a = row.attributes;
      if (a.status !== "paid") continue;
      paidPayments.push({
        id: row.id,
        reference: a.external_reference_number ?? "",
        metadataRemarks: typeof a.metadata?.remarks === "string" ? a.metadata.remarks : null,
        amount: typeof a.amount === "number" ? a.amount : 0,
        description: a.description ?? "",
        paidAt: typeof a.paid_at === "number" ? new Date(a.paid_at * 1000) : null,
      });
    }

    after = rows[rows.length - 1]?.id ?? null;
    if (!after || rows.length < 100) break; // last page
  }

  // 2. Resolve each payment's remarks: Checkout-Sessions-era payments carry
  //    them inline already (no extra call); legacy Links-era payments need
  //    one getLinkByReference call per unique reference.
  const linkCache = new Map<string, Awaited<ReturnType<typeof getLinkByReference>>>();
  const paid: PaidLink[] = [];

  for (const p of paidPayments) {
    if (p.metadataRemarks !== null) {
      const parsed = parseLinkRemarks(p.metadataRemarks);
      paid.push({
        linkId: p.id,
        amount: p.amount,
        description: p.description,
        reference: p.reference,
        paidAt: p.paidAt,
        remarks: p.metadataRemarks,
        ...parsed,
      });
      continue;
    }

    if (p.reference) {
      if (!linkCache.has(p.reference)) {
        try {
          linkCache.set(p.reference, await getLinkByReference(p.reference));
        } catch {
          linkCache.set(p.reference, null); // network hiccup resolving one link shouldn't fail the batch
        }
      }
      const link = linkCache.get(p.reference) ?? null;
      const remarks = link?.remarks ?? "";
      const parsed = parseLinkRemarks(remarks);
      paid.push({
        linkId: link?.linkId ?? p.id,
        amount: p.amount || link?.amount || 0,
        description: p.description,
        reference: p.reference,
        paidAt: p.paidAt,
        remarks,
        ...parsed,
      });
      continue;
    }

    // Neither metadata nor a reference — unresolvable. Surface it with the
    // payment's own id rather than drop it silently; parseLinkRemarks("")
    // yields all-null fields, so the reconcile matcher flags it as
    // malformed_remarks rather than granting anything.
    paid.push({
      linkId: p.id,
      amount: p.amount,
      description: p.description,
      reference: p.reference,
      paidAt: p.paidAt,
      remarks: "",
      yearId: null,
      subjectId: null,
      deviceId: null,
      userId: null,
      plan: null,
    });
  }

  return paid;
}
```

Note: `parseLinkRemarks("")` already returns `{ yearId: null, subjectId: null, deviceId: null, userId: null, plan: null, coupon: null }` per its existing behavior (see `lib/paymongo.test.ts`'s `"returns all-null for empty or garbage remarks"` test) — the orphan branch above spreads that same shape manually to avoid an unnecessary function call on a known-empty string, but either form is equivalent; if you prefer, replace the manual object with `...parseLinkRemarks("")` for consistency with the other two branches.

- [ ] **Step 9: Run tests to verify they pass**

Run: `cd ~/projects/survivalKitApp-reconcile && npx vitest run lib/paymongo.test.ts`
Expected: PASS (all tests in the file, including the pre-existing ones — this must not regress `getLinkByReference`'s own tests or any `createPaymongoLink`/`createDynamicPaymongoLink` test)

- [ ] **Step 10: Run the full suite, typecheck, and lint**

Run:
```bash
cd ~/projects/survivalKitApp-reconcile
npx tsc --noEmit
npm run lint
npx vitest run
```
Expected: all three clean/passing — `lib/reconcile.test.ts` in particular must still pass unmodified, since `findUnreflectedPayments` only consumes the `PaidLink[]` shape and doesn't call `listRecentPaidLinks` directly (it's mocked there).

- [ ] **Step 11: Commit**

```bash
cd ~/projects/survivalKitApp-reconcile
git add lib/paymongo.ts lib/paymongo.test.ts
git commit -m "fix(payments): resolve Checkout-Sessions-era payments in listRecentPaidLinks

GET /v1/payments returns metadata.remarks inline for a Checkout-Sessions
purchase (verified against a real paid test-mode transaction), so
reconciliation can read it directly instead of the old reference-based
Link lookup, which only ever applied to the discontinued Links API.
linkId is keyed on the payment's own id for these — GET /v1/payments can
only ever surface a payment by that id, never by its checkout session's
id. The legacy reference + getLinkByReference path is unchanged."
```

---

## Task 2: `app/api/admin/reconcile/route.ts` — accept an `identifier`, not just a `reference`

**Files:**
- Modify: `app/api/admin/reconcile/route.ts` (whole file, 74 lines)
- Test: `app/api/admin/reconcile/route.test.ts` (new file — none exists today)

**Interfaces:**
- Consumes: `getLinkByReference` (existing), `getPaymentById` (from Task 1, `{ remarks: string; amount: number; status: string } | null`), `parseLinkRemarks`, `resolvePlan`, `periodEndFor`, `PLANS`, `recordPayment` — all already imported/used by this file except `getPaymentById`.
- Produces: `POST /api/admin/reconcile` now accepts `{ identifier: string }` in the request body (was `{ reference: string }`) — Task 3's UI change is the only caller.

- [ ] **Step 1: Write the failing tests**

Create `app/api/admin/reconcile/route.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

const getAdminSessionMock = vi.hoisted(() => vi.fn(async () => true));
vi.mock("@/lib/auth/adminSession", () => ({ getAdminSession: getAdminSessionMock }));

const getLinkByReferenceMock = vi.hoisted(() => vi.fn());
const getPaymentByIdMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/paymongo", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/paymongo")>();
  return {
    ...actual,
    getLinkByReference: getLinkByReferenceMock,
    getPaymentById: getPaymentByIdMock,
  };
});

const recordPaymentMock = vi.hoisted(() => vi.fn(async () => ({ recorded: true, deduped: false })));
vi.mock("@/lib/payments", () => ({ recordPayment: recordPaymentMock }));

vi.mock("@/lib/supabase/server", () => ({ createServerClient: () => ({}) }));

import { POST } from "./route";

const YEAR = "00000000-0000-0000-0000-000000000001";
const DEV = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

function req(body: unknown) {
  return { json: async () => body } as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  getAdminSessionMock.mockResolvedValue(true);
  getLinkByReferenceMock.mockReset();
  getPaymentByIdMock.mockReset();
  recordPaymentMock.mockClear();
  recordPaymentMock.mockResolvedValue({ recorded: true, deduped: false });
});

it("rejects when not authenticated as admin", async () => {
  getAdminSessionMock.mockResolvedValue(false);
  const res = await POST(req({ identifier: "anything" }));
  expect(res.status).toBe(401);
});

it("rejects a request with no identifier", async () => {
  const res = await POST(req({}));
  expect(res.status).toBe(400);
  expect(getLinkByReferenceMock).not.toHaveBeenCalled();
  expect(getPaymentByIdMock).not.toHaveBeenCalled();
});

describe("legacy reference identifier (Links API)", () => {
  it("resolves via getLinkByReference and grants", async () => {
    getLinkByReferenceMock.mockResolvedValue({
      linkId: "link_1",
      remarks: `year:${YEAR} device:${DEV} plan:year_sem`,
      amount: 29900,
      status: "paid",
    });

    const res = await POST(req({ identifier: "REF123" }));
    expect(res.status).toBe(200);
    expect(getLinkByReferenceMock).toHaveBeenCalledWith("REF123");
    expect(getPaymentByIdMock).not.toHaveBeenCalled();
    expect(recordPaymentMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ linkId: "link_1", deviceId: DEV, yearId: YEAR, amount: 29900 })
    );
  });

  it("404s when PayMongo has no such link", async () => {
    getLinkByReferenceMock.mockResolvedValue(null);
    const res = await POST(req({ identifier: "REF123" }));
    expect(res.status).toBe(404);
  });

  it("rejects when the link is not paid", async () => {
    getLinkByReferenceMock.mockResolvedValue({ linkId: "link_1", remarks: "", amount: 0, status: "unpaid" });
    const res = await POST(req({ identifier: "REF123" }));
    expect(res.status).toBe(400);
  });
});

describe("payment id identifier (Checkout Sessions)", () => {
  it("resolves via getPaymentById and grants", async () => {
    getPaymentByIdMock.mockResolvedValue({
      remarks: `year:${YEAR} device:${DEV} plan:subject_month`,
      amount: 4900,
      status: "paid",
    });

    const res = await POST(req({ identifier: "pay_abc123" }));
    expect(res.status).toBe(200);
    expect(getPaymentByIdMock).toHaveBeenCalledWith("pay_abc123");
    expect(getLinkByReferenceMock).not.toHaveBeenCalled();
    expect(recordPaymentMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ linkId: "pay_abc123", deviceId: DEV, yearId: YEAR, amount: 4900 })
    );
  });

  it("404s when PayMongo has no such payment", async () => {
    getPaymentByIdMock.mockResolvedValue(null);
    const res = await POST(req({ identifier: "pay_abc123" }));
    expect(res.status).toBe(404);
  });

  it("rejects when the payment is not paid", async () => {
    getPaymentByIdMock.mockResolvedValue({ remarks: "", amount: 0, status: "awaiting_payment_method" });
    const res = await POST(req({ identifier: "pay_abc123" }));
    expect(res.status).toBe(400);
  });

  it("rejects malformed remarks", async () => {
    getPaymentByIdMock.mockResolvedValue({ remarks: "garbage", amount: 4900, status: "paid" });
    const res = await POST(req({ identifier: "pay_abc123" }));
    expect(res.status).toBe(422);
  });

  it("rejects underpayment", async () => {
    getPaymentByIdMock.mockResolvedValue({
      remarks: `year:${YEAR} device:${DEV} plan:year_sem`,
      amount: 100,
      status: "paid",
    });
    const res = await POST(req({ identifier: "pay_abc123" }));
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd ~/projects/survivalKitApp-reconcile && npx vitest run app/api/admin/reconcile/route.test.ts`
Expected: FAIL — current route reads `body?.reference`, always calls `getLinkByReference`, never `getPaymentById`; several assertions (`getPaymentByIdMock` calls, `identifier`-based rejection) fail.

- [ ] **Step 3: Implement the route change**

Replace the full contents of `app/api/admin/reconcile/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { createServerClient } from "@/lib/supabase/server";
import {
  getLinkByReference,
  getPaymentById,
  parseLinkRemarks,
  resolvePlan,
  periodEndFor,
  PLANS,
} from "@/lib/paymongo";
import { recordPayment } from "@/lib/payments";
import { isUuid } from "@/lib/validation";

// Manually grant access for a paid PayMongo purchase that never reflected.
// The admin supplies only an identifier — either a legacy Link
// reference_number (pre-2026-09-03, Links API) or a Payment id ("pay_xxx",
// Checkout Sessions, PayMongo's replacement) — and we resolve it straight
// from PayMongo (the only supported lookup for either), so the grant is
// driven by PayMongo's truth (status=paid, real amount/remarks), never by
// client-supplied amounts. recordPayment is idempotent, so re-granting an
// already-recorded purchase is a safe no-op.
export async function POST(req: NextRequest) {
  const authed = await getAdminSession();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { identifier?: string } | null;
  const identifier = body?.identifier;
  if (!identifier || typeof identifier !== "string") {
    return NextResponse.json({ error: "identifier required" }, { status: 400 });
  }

  let resolved: { linkId: string; remarks: string; amount: number; status: string } | null;
  try {
    if (identifier.startsWith("pay_")) {
      const payment = await getPaymentById(identifier);
      resolved = payment && { linkId: identifier, ...payment };
    } else {
      const link = await getLinkByReference(identifier);
      resolved = link;
    }
  } catch (err) {
    console.error("reconcile lookup failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Could not reach PayMongo" }, { status: 502 });
  }
  if (!resolved) {
    return NextResponse.json({ error: "Payment not found at PayMongo" }, { status: 404 });
  }
  if (resolved.status !== "paid") {
    return NextResponse.json({ error: "Payment is not paid" }, { status: 400 });
  }

  const { yearId, subjectId, deviceId, userId, plan: planToken } = parseLinkRemarks(resolved.remarks);
  if (!yearId || !deviceId || !isUuid(yearId) || !isUuid(deviceId)) {
    return NextResponse.json({ error: "Remarks are malformed; cannot grant" }, { status: 422 });
  }
  if (subjectId !== null && !isUuid(subjectId)) {
    return NextResponse.json({ error: "Remarks are malformed; cannot grant" }, { status: 422 });
  }

  const paidAmount = resolved.amount;
  const plan = resolvePlan(planToken, subjectId);
  const expected = PLANS[plan].amount;
  if (paidAmount < expected) {
    return NextResponse.json(
      { error: `Underpaid: ${paidAmount} < ${expected}` },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  try {
    const { recorded, deduped } = await recordPayment(supabase, {
      linkId: resolved.linkId,
      deviceId,
      yearId,
      subjectId,
      amount: paidAmount,
      paidAt: new Date(),
      userId: userId && isUuid(userId) ? userId : null,
      periodEnd: periodEndFor(plan),
    });
    return NextResponse.json({ ok: true, recorded, deduped });
  } catch (err) {
    console.error("reconcile grant failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Grant failed" }, { status: 500 });
  }
}
```

Note the `resolved` assembly for the payment-id branch: `payment && { linkId: identifier, ...payment }` merges `getPaymentById`'s `{ remarks, amount, status }` with the identifier itself as `linkId`, producing the same `{ linkId, remarks, amount, status }` shape `getLinkByReference` already returns — the rest of the function is then branch-agnostic.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd ~/projects/survivalKitApp-reconcile && npx vitest run app/api/admin/reconcile/route.test.ts`
Expected: PASS (all tests)

- [ ] **Step 5: Run the full suite, typecheck, and lint**

Run:
```bash
cd ~/projects/survivalKitApp-reconcile
npx tsc --noEmit
npm run lint
npx vitest run
```
Expected: all clean/passing.

- [ ] **Step 6: Commit**

```bash
cd ~/projects/survivalKitApp-reconcile
git add app/api/admin/reconcile/route.ts app/api/admin/reconcile/route.test.ts
git commit -m "feat(admin): accept a Checkout Sessions payment id in manual reconcile grant

/api/admin/reconcile now takes {identifier} instead of {reference} —
either a legacy Link reference_number or a pay_ Payment id, resolved via
getLinkByReference or the new getPaymentById respectively. Both paths
converge on the same {linkId, remarks, amount, status} shape before the
existing remarks/amount validation and recordPayment call, unchanged."
```

---

## Task 3: `components/AdminDashboard.tsx` — key the grant action on `linkId`, not `reference`

**Files:**
- Modify: `components/AdminDashboard.tsx:498-627` (the `ReconcileSection` component)
- Test: `components/AdminDashboard.test.tsx`

**Interfaces:**
- Consumes: `UnreflectedPayment` (unchanged shape from `lib/reconcile.ts`) — `linkId` is already always populated and unique (Task 1 guarantees it's never empty); `reference` may now legitimately be `""` for every Checkout-Sessions-era row.
- Produces: `POST /api/admin/reconcile` body becomes `{ identifier: r.linkId }` (was `{ reference: r.reference }`) — matches Task 2's route contract.

**Why this task exists:** today, `ReconcileSection` keys its React list (`key={r.reference}`), its per-row `state`/`msg` maps, and the POST body all on `r.reference`. After Task 1, every Checkout-Sessions-era row has `reference: ""` — multiple such rows would collide on the same empty-string key (React would warn/misrender, and the `state`/`msg` records would conflate distinct rows), and the POST body would send `{ reference: "" }`, which the OLD route already 400s on (`!reference` check) and the NEW route (Task 2) would too (`!identifier`). `linkId` is the one field guaranteed present and unique for every row regardless of era, so it's the correct action/key identifier.

- [ ] **Step 1: Write the failing test**

`components/AdminDashboard.test.tsx` already imports `{ render, screen, fireEvent }` from `@testing-library/react` (no `userEvent` — this file exclusively uses `fireEvent`) and defines `makeDashboardProps(overrides)` (shown above at file lines 1-52) to build full `AdminDashboard` props with sensible defaults, overridable per test. It does not currently import `vi` or `waitFor` — add both to the existing `import { describe, it, expect } from "vitest";` and `import { render, screen, fireEvent } from "@testing-library/react";` lines respectively.

Add this test in a new `describe` block at the end of the file:

```typescript
describe("ReconcileSection grant action", () => {
  // Regression: a Checkout-Sessions-era row has reference: "" (PayMongo's
  // Checkout Sessions has no reference_number lookup, unlike Links). Two such
  // rows must not collide on an empty-string key/state, and the grant action
  // must post the row's linkId, not its (possibly empty) reference.
  it("posts each row's own linkId, even when two rows share an empty reference", async () => {
    const rows: DashboardProps["unreflectedPayments"] = [
      {
        linkId: "pay_aaa",
        reference: "",
        amount: 4900,
        description: "BSIT Survival Kit",
        paidAt: "2026-09-01T00:00:00.000Z",
        yearId: "y",
        subjectId: null,
        deviceId: "device-a",
        userId: null,
        reason: "no_subscription",
        hasLedgerRow: false,
      },
      {
        linkId: "pay_bbb",
        reference: "",
        amount: 9900,
        description: "BSIT Survival Kit",
        paidAt: "2026-09-02T00:00:00.000Z",
        yearId: "y",
        subjectId: null,
        deviceId: "device-b",
        userId: null,
        reason: "no_subscription",
        hasLedgerRow: false,
      },
    ];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, deduped: false }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminDashboard {...makeDashboardProps({ unreflectedPayments: rows })} />);

    const grantButtons = screen.getAllByRole("button", { name: /grant access/i });
    expect(grantButtons).toHaveLength(2);

    fireEvent.click(grantButtons[0]);
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/reconcile",
        expect.objectContaining({ body: JSON.stringify({ identifier: "pay_aaa" }) })
      )
    );

    fireEvent.click(grantButtons[1]);
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/reconcile",
        expect.objectContaining({ body: JSON.stringify({ identifier: "pay_bbb" }) })
      )
    );

    vi.unstubAllGlobals();
  });
});
```

`DashboardProps["unreflectedPayments"]` uses the same derived-from-the-component type as `makeDashboardProps` (line 11: `type DashboardProps = ComponentProps<typeof AdminDashboard>;`) — no separate import of `UnreflectedPayment` needed.

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd ~/projects/survivalKitApp-reconcile && npx vitest run components/AdminDashboard.test.tsx -t "posts each row's own linkId"`
Expected: FAIL — two buttons may render, but clicking posts `{ reference: "" }` for both, not distinct `identifier` values.

- [ ] **Step 3: Implement the fix**

In `components/AdminDashboard.tsx`, within `ReconcileSection` (lines 498-627):

1. Rename the `grant` function's parameter and body key:

```typescript
async function grant(identifier: string) {
  setState(s => ({ ...s, [identifier]: "granting" }));
  setMsg(m => ({ ...m, [identifier]: "" }));
  try {
    const res = await fetch("/api/admin/reconcile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      deduped?: boolean;
      error?: string;
    };
    if (!res.ok || !data.ok) {
      setState(s => ({ ...s, [identifier]: "error" }));
      setMsg(m => ({ ...m, [identifier]: data.error ?? "Grant failed" }));
      return;
    }
    setState(s => ({ ...s, [identifier]: "done" }));
    setMsg(m => ({
      ...m,
      [identifier]: data.deduped ? "Already recorded — access ensured" : "Access granted",
    }));
  } catch {
    setState(s => ({ ...s, [identifier]: "error" }));
    setMsg(m => ({ ...m, [identifier]: "Network error" }));
  }
}
```

2. In the `rows.map(r => ...)` body, replace every `r.reference` used for keying/state/the click handler with `r.linkId` (the visible "Reference" column's own display text, `{r.reference || r.linkId.slice(0, 12)}`, stays exactly as-is — only the *identifier* uses change):

```typescript
{rows.map(r => {
  const st = state[r.linkId] ?? "idle";
  return (
    <tr key={r.linkId} className="border-b border-ink-faint/15 hover:bg-ink-faint/5 transition-colors">
      <td className="py-3 pr-6 font-sans text-xs text-ink-muted">
        {r.paidAt
          ? new Date(r.paidAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
          : "—"}
      </td>
      <td className="py-3 pr-6 font-mono text-xs text-ink-muted">{r.reference || r.linkId.slice(0, 12)}</td>
      <td className="py-3 pr-6 font-sans text-xs text-ink-muted">{r.subjectId ? "Subject" : "Whole year"}</td>
      <td className="py-3 pr-6 font-mono text-xs text-ink">₱{(r.amount / 100).toFixed(2)}</td>
      <td className="py-3 pr-6 font-mono text-xs text-ink-faint">
        {r.deviceId ? `${r.deviceId.slice(0, 8)}…` : "—"}
      </td>
      <td className="py-3 pr-6 font-sans text-xs text-ink-faint">
        {r.reason === "malformed_remarks"
          ? "Bad remarks"
          : r.reason === "class_block_unfulfilled"
            ? "Class not created"
            : r.hasLedgerRow ? "Sub missing" : "Not reflected"}
      </td>
      <td className="py-3 pr-6">
        {st === "done" ? (
          <span className="font-mono text-xs text-green-600">{msg[r.linkId] ?? "Done"}</span>
        ) : r.reason === "malformed_remarks" ? (
          <span className="font-mono text-xs text-ink-faint">Manual — bad remarks</span>
        ) : r.reason === "class_block_unfulfilled" ? (
          <span className="font-mono text-xs text-ink-faint">Manual — create class</span>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => grant(r.linkId)}
              disabled={st === "granting"}
              className="font-mono text-xs border border-ink-faint/30 px-3 py-1 hover:text-ink hover:border-ink transition-colors duration-150 disabled:opacity-50"
            >
              {st === "granting" ? "Granting…" : "Grant access"}
            </button>
            {st === "error" && (
              <span className="font-mono text-xs text-red-500">{msg[r.linkId]}</span>
            )}
          </div>
        )}
      </td>
    </tr>
  );
})}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd ~/projects/survivalKitApp-reconcile && npx vitest run components/AdminDashboard.test.tsx`
Expected: PASS (the new test, plus every pre-existing test in the file unmodified)

- [ ] **Step 5: Run the full suite, typecheck, and lint**

Run:
```bash
cd ~/projects/survivalKitApp-reconcile
npx tsc --noEmit
npm run lint
npx vitest run
```
Expected: all clean/passing.

- [ ] **Step 6: Commit**

```bash
cd ~/projects/survivalKitApp-reconcile
git add components/AdminDashboard.tsx components/AdminDashboard.test.tsx
git commit -m "fix(admin): key the reconcile grant action on linkId, not reference

Every Checkout-Sessions-era row now has reference: \"\" (Checkout Sessions
has no reference_number lookup), so multiple such rows collided on the
same empty-string React key/state entry and always posted an empty
identifier. linkId is always present and unique regardless of era."
```

---

## Final Step: Push and open a PR

- [ ] **Push the branch**

```bash
cd ~/projects/survivalKitApp-reconcile
TOKEN=$(gh auth token)
git push "https://${TOKEN}@github.com/lauurnce/survivalKitApp.git" fix/reconcile-checkout-sessions
```

- [ ] **Open the PR** referencing issue #78, noting in the description:
  - This depends on PR #77 being merged first (PR #77 introduces `checkout_session.payment.paid` webhook handling that keys `paymongo_link_id` on the payment id — this plan's reconciliation fix assumes that key convention).
  - Summary of the empirical finding (metadata is inline on `GET /v1/payments`, confirmed against a real paid test-mode transaction) and the `linkId` collision bug fixed in Task 3.
  - Test plan: `tsc --noEmit`, `npm run lint`, full `vitest run` — all clean.

- [ ] **Do not merge.** Dispatch Sentry (or request a manual review) before merging, per this repo's PR review policy — same as PR #77.

- [ ] **After both PRs merge**, retire the worktree per `docs/WORKTREES.md` and remove this session's row from `~/projects/.survivalkit-claims.md`.
