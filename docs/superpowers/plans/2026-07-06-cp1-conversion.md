# CP1 Conversion Surgery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the 3-tier semester pricing ladder (₱49/subject/month, ₱99/subject/semester, ₱299/all-subjects/semester), reframe paid content as "reviewers with answer keys", and unlock the first activity per subject free with an inline upsell.

**Architecture:** Plans are defined once in `lib/paymongo.ts` (`PLANS` map + `SEMESTER_END` + `resolvePlan` + `periodEndFor`); the subscribe API, webhook, and admin reconcile all resolve a plan from the PayMongo link `remarks` `plan:` token (with legacy inference for old links) and pass a computed `periodEnd` to `recordPayment`. UI (SubscribeGate, PaywallTeaser, AccountSidebar, SectionRenderer) is copy + one new prop each. Free sample selection is a pure function fed by queries the reader page mostly already makes.

**Tech Stack:** Next.js App Router, Supabase (no schema change), PayMongo Links, vitest.

## Global Constraints

- Prices (centavos): `subject_month` = 4900, `subject_sem` = 9900, `year_sem` = 29900.
- `SEMESTER_END` = `2026-12-31T15:59:59Z` (Dec 31, 2026 23:59 PH).
- Semester plans grant `max(SEMESTER_END, from + 31 days)` — never less than a month.
- Legacy links (no `plan:` token): subject present → `subject_month`; no subject → `year_sem`.
- Underpayment-only rejection everywhere: `paidAmount < PLANS[plan].amount` rejects; equal-or-higher grants.
- Vocabulary in all user-facing copy: **"reviewers with answer keys"**, never "activities".
- Payment copy: no "Cancel anytime" anywhere; say "One-time payment via GCash, Maya, or card. No auto-renew — access simply ends with the semester." and "Instant unlock after payment."
- `lib/paymongo.ts` uses `node:crypto` — never import it from a client component. Price labels in client components stay hardcoded strings with a sync comment.
- Commits: no Co-Authored-By trailers (repo rule).
- TDD: every behavior change gets a failing test first. Run tests with `npx vitest run <file>`.

---

### Task 1: Plan model in `lib/paymongo.ts`

**Files:**
- Modify: `lib/paymongo.ts` (top of file, around lines 3-4 and `parseLinkRemarks` at lines 83-99)
- Test: `lib/paymongo.test.ts` (append new describe blocks)

**Interfaces:**
- Produces: `type PlanKey = "subject_month" | "subject_sem" | "year_sem"`; `PLANS: Record<PlanKey, { amount: number }>`; `SEMESTER_END: Date`; `resolvePlan(planToken: string | null, subjectId: string | null): PlanKey`; `periodEndFor(plan: PlanKey, from?: Date): Date`; `parseLinkRemarks` return type gains `plan: string | null`.
- Keeps: `SUBJECT_AMOUNT`/`YEAR_AMOUNT` exports DELETED — replaced by `PLANS` (Tasks 4 and 5 update the two importers).

- [ ] **Step 1: Write the failing tests** — append to `lib/paymongo.test.ts`:

```typescript
import {
  PLANS,
  SEMESTER_END,
  resolvePlan,
  periodEndFor,
  parseLinkRemarks,
} from "./paymongo";

describe("PLANS", () => {
  it("defines the three tiers with exact centavo amounts", () => {
    expect(PLANS.subject_month.amount).toBe(4900);
    expect(PLANS.subject_sem.amount).toBe(9900);
    expect(PLANS.year_sem.amount).toBe(29900);
  });
});

describe("resolvePlan", () => {
  const SUBJ = "10000000-0001-0001-0001-000000000001";

  it("returns the token's plan when scope matches", () => {
    expect(resolvePlan("subject_sem", SUBJ)).toBe("subject_sem");
    expect(resolvePlan("subject_month", SUBJ)).toBe("subject_month");
    expect(resolvePlan("year_sem", null)).toBe("year_sem");
  });

  it("falls back to legacy inference when token is missing", () => {
    expect(resolvePlan(null, SUBJ)).toBe("subject_month");
    expect(resolvePlan(null, null)).toBe("year_sem");
  });

  it("falls back to legacy inference when token contradicts scope or is unknown", () => {
    // year_sem with a subject attached / subject plan without a subject
    expect(resolvePlan("year_sem", SUBJ)).toBe("subject_month");
    expect(resolvePlan("subject_sem", null)).toBe("year_sem");
    expect(resolvePlan("premium_gold", SUBJ)).toBe("subject_month");
  });
});

describe("periodEndFor", () => {
  const DAY_MS = 24 * 60 * 60 * 1000;

  it("gives subject_month exactly 31 days from `from`", () => {
    const from = new Date("2026-07-10T00:00:00Z");
    expect(periodEndFor("subject_month", from).getTime()).toBe(from.getTime() + 31 * DAY_MS);
  });

  it("gives semester plans access until SEMESTER_END", () => {
    const from = new Date("2026-07-10T00:00:00Z");
    expect(periodEndFor("subject_sem", from).getTime()).toBe(SEMESTER_END.getTime());
    expect(periodEndFor("year_sem", from).getTime()).toBe(SEMESTER_END.getTime());
  });

  it("floors semester plans at 31 days when SEMESTER_END is stale", () => {
    const from = new Date("2026-12-25T00:00:00Z"); // < 31 days before SEMESTER_END
    expect(periodEndFor("subject_sem", from).getTime()).toBe(from.getTime() + 31 * DAY_MS);
  });
});

describe("parseLinkRemarks plan token", () => {
  it("extracts the plan token", () => {
    const r = parseLinkRemarks("year:y1 subject:s1 device:d1 plan:subject_sem");
    expect(r.plan).toBe("subject_sem");
  });

  it("returns null plan for legacy remarks", () => {
    const r = parseLinkRemarks("year:y1 device:d1");
    expect(r.plan).toBeNull();
  });
});
```

Note: `lib/paymongo.test.ts` already imports from `./paymongo` — merge the import list with the existing import statement instead of duplicating it.

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/paymongo.test.ts`
Expected: FAIL — `PLANS`, `resolvePlan`, `periodEndFor` are not exported; plan property missing.

- [ ] **Step 3: Implement** — in `lib/paymongo.ts`, replace lines 3-4 (`SUBJECT_AMOUNT` / `YEAR_AMOUNT`) with:

```typescript
// ── Plans ─────────────────────────────────────────────────────────────────────
// The single source of truth for what we sell. Display labels in
// SubscribeGate.tsx, PaywallTeaser.tsx, and account/AccountSidebar.tsx must be
// kept in sync with these amounts (client components can't import this file —
// it pulls in node:crypto).
export type PlanKey = "subject_month" | "subject_sem" | "year_sem";

export const PLANS: Record<PlanKey, { amount: number; description: string }> = {
  subject_month: { amount: 4900, description: "BSIT Survival Kit — Subject (1 month)" },
  subject_sem: { amount: 9900, description: "BSIT Survival Kit — Subject (semester)" },
  year_sem: { amount: 29900, description: "BSIT Survival Kit — All subjects (semester)" },
};

// End of 1st Semester AY 2026-27: Dec 31, 2026 23:59 PH (UTC+8).
// Bump once per semester when the selling window rolls over.
export const SEMESTER_END = new Date("2026-12-31T15:59:59Z");

const PERIOD_31_DAYS_MS = 31 * 24 * 60 * 60 * 1000;

// Resolve a plan from a link's `plan:` remarks token. Tokens that are unknown
// or contradict the link's scope (subject plans need a subject; year_sem must
// not have one) fall back to legacy inference so old links keep working.
export function resolvePlan(planToken: string | null, subjectId: string | null): PlanKey {
  if (planToken && planToken in PLANS) {
    const plan = planToken as PlanKey;
    const needsSubject = plan !== "year_sem";
    if (needsSubject === (subjectId !== null)) return plan;
  }
  return subjectId !== null ? "subject_month" : "year_sem";
}

// Access end for a plan. Semester plans are floored at 31 days so a stale
// SEMESTER_END constant can never grant less than a month.
export function periodEndFor(plan: PlanKey, from: Date = new Date()): Date {
  const monthEnd = new Date(from.getTime() + PERIOD_31_DAYS_MS);
  if (plan === "subject_month") return monthEnd;
  return SEMESTER_END.getTime() > monthEnd.getTime() ? SEMESTER_END : monthEnd;
}
```

In `parseLinkRemarks` (currently lines 83-99), add plan parsing — new return field and regex:

```typescript
export function parseLinkRemarks(remarks: string): {
  yearId: string | null;
  subjectId: string | null;
  deviceId: string | null;
  userId: string | null;
  plan: string | null;
} {
  const year = remarks.match(/year:([^\s]+)/);
  const subject = remarks.match(/subject:([^\s]+)/);
  const device = remarks.match(/device:([^\s]+)/);
  const user = remarks.match(/user:([^\s]+)/);
  const plan = remarks.match(/plan:([^\s]+)/);
  return {
    yearId: year ? year[1] : null,
    subjectId: subject ? subject[1] : null,
    deviceId: device ? device[1] : null,
    userId: user ? user[1] : null,
    plan: plan ? plan[1] : null,
  };
}
```

Do NOT fix the other `SUBJECT_AMOUNT`/`YEAR_AMOUNT` importers yet (`app/api/webhooks/paymongo/route.ts`, `app/api/admin/reconcile/route.ts`, `createPaymongoLink` internals) — Tasks 2, 4, 5. The build will be broken between commits of Tasks 1-5; tests are the gate, and Task 11 verifies the full build. To keep every commit green instead, keep temporary compat exports `export const SUBJECT_AMOUNT = PLANS.subject_month.amount; export const YEAR_AMOUNT = PLANS.year_sem.amount;` and delete them in Task 5.
**Choose the compat-exports path** — commits stay buildable.

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/paymongo.test.ts`
Expected: PASS (all existing + new tests).

- [ ] **Step 5: Commit**

```bash
git add lib/paymongo.ts lib/paymongo.test.ts
git commit -m "feat(payments): plan model — 3-tier ladder, semester end, legacy inference"
```

---

### Task 2: `createPaymongoLink` takes a plan

**Files:**
- Modify: `lib/paymongo.ts:6-62` (`createPaymongoLink`)
- Test: `lib/paymongo.test.ts`

**Interfaces:**
- Produces: `createPaymongoLink(yearId, deviceId, successUrl, subjectId?, userId?, plan?: PlanKey)` — `plan` defaults to `resolvePlan(null, subjectId)`. Amount and description come from `PLANS[plan]`; remarks gains ` plan:<key>`.
- Consumes: `PLANS`, `resolvePlan` from Task 1.

- [ ] **Step 1: Write the failing tests** — append to `lib/paymongo.test.ts` (this file already stubs global fetch and inspects `sentBody`; follow the existing pattern in the file — the test below assumes a helper that captures the POST body the same way the existing `createPaymongoLink` tests do):

```typescript
describe("createPaymongoLink plans", () => {
  it("charges 9900 and stamps plan:subject_sem in remarks for the semester subject plan", async () => {
    // arrange fetch stub exactly like the existing createPaymongoLink test
    await createPaymongoLink("year-1", "device-1", "https://x/ok", "subj-1", undefined, "subject_sem");
    expect(sentBody.data.attributes.amount).toBe(9900);
    expect(sentBody.data.attributes.remarks).toContain("plan:subject_sem");
    expect(sentBody.data.attributes.remarks).toContain("subject:subj-1");
  });

  it("defaults to legacy plans when plan is omitted", async () => {
    await createPaymongoLink("year-1", "device-1", "https://x/ok", "subj-1");
    expect(sentBody.data.attributes.amount).toBe(4900);
    expect(sentBody.data.attributes.remarks).toContain("plan:subject_month");

    await createPaymongoLink("year-1", "device-1", "https://x/ok", null);
    expect(sentBody.data.attributes.amount).toBe(29900);
    expect(sentBody.data.attributes.remarks).toContain("plan:year_sem");
  });

  it("includes the plan in the idempotency key so different tiers are distinct purchases", async () => {
    await createPaymongoLink("year-1", "device-1", "https://x/ok", "subj-1", undefined, "subject_month");
    const key1 = sentHeaders["Idempotency-Key"];
    await createPaymongoLink("year-1", "device-1", "https://x/ok", "subj-1", undefined, "subject_sem");
    const key2 = sentHeaders["Idempotency-Key"];
    expect(key1).not.toBe(key2);
  });
});
```

(If the existing stub doesn't capture headers, extend it to also record `sentHeaders` from the fetch init.)

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/paymongo.test.ts`
Expected: FAIL — amount still derived from `subjectId ? 4900 : 29900`, no `plan:` token, same idempotency key.

- [ ] **Step 3: Implement** — replace the body of `createPaymongoLink` (lines 6-31 area):

```typescript
export async function createPaymongoLink(
  yearId: string,
  deviceId: string,
  successUrl: string,
  subjectId: string | null = null,
  userId?: string,
  plan?: PlanKey
): Promise<{ checkoutUrl: string; linkId: string }> {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) throw new Error("PAYMONGO_SECRET_KEY is not set");

  const encoded = Buffer.from(`${secretKey}:`).toString("base64");

  const resolvedPlan: PlanKey = plan ?? resolvePlan(null, subjectId);
  const { amount, description } = PLANS[resolvedPlan];
  let remarks = subjectId
    ? `year:${yearId} subject:${subjectId} device:${deviceId}`
    : `year:${yearId} device:${deviceId}`;
  if (userId) remarks += ` user:${userId}`;
  remarks += ` plan:${resolvedPlan}`;

  // Idempotency key per (device, year, subject, plan) — prevents duplicate
  // charges on double-click while letting a user buy a different tier.
  const idempotencyKey = crypto
    .createHash("sha256")
    .update(`subscribe:${deviceId}:${yearId}:${subjectId ?? "year"}:${resolvedPlan}`)
    .digest("hex");
  // ... rest of the function (fetch call etc.) unchanged
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/paymongo.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/paymongo.ts lib/paymongo.test.ts
git commit -m "feat(payments): createPaymongoLink charges per plan and stamps plan token"
```

---

### Task 3: `recordPayment` accepts a caller-computed `periodEnd`

**Files:**
- Modify: `lib/payments.ts:7-16` (input type), `lib/payments.ts:56-58` (period computation)
- Test: `lib/payments.test.ts`

**Interfaces:**
- Produces: `RecordPaymentInput` gains `periodEnd?: Date`. When present, it is written as `current_period_end` verbatim; when absent, behavior is unchanged (now + 31 days). `lib/payments.ts` does NOT import from `lib/paymongo.ts` (keeps the modules decoupled; callers use `periodEndFor`).

- [ ] **Step 1: Write the failing test** — append to `lib/payments.test.ts` (follow the file's existing supabase mock pattern that captures subscription inserts/updates):

```typescript
it("writes the caller-supplied periodEnd as current_period_end", async () => {
  const periodEnd = new Date("2026-12-31T15:59:59Z");
  await recordPayment(supabase, {
    linkId: "link-sem-1",
    deviceId: "dev-1",
    yearId: "year-1",
    subjectId: "subj-1",
    amount: 9900,
    paidAt: new Date("2026-07-10T00:00:00Z"),
    periodEnd,
  });
  // capturedSubscriptionRow = whatever the existing mock captures on insert
  expect(capturedSubscriptionRow.current_period_end).toBe(periodEnd.toISOString());
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/payments.test.ts`
Expected: FAIL — `current_period_end` is now+31d, not the supplied date (and TS error on unknown field).

- [ ] **Step 3: Implement** — in `lib/payments.ts`:

```typescript
export interface RecordPaymentInput {
  linkId: string;
  deviceId: string;
  yearId: string;
  // null = whole-year plan; set = single-subject plan.
  subjectId: string | null;
  amount: number; // centavos
  paidAt: Date;
  userId?: string | null;
  // Access end computed by the caller (see periodEndFor in lib/paymongo.ts).
  // Absent → legacy 31 days from now.
  periodEnd?: Date;
}
```

and replace lines 56-58:

```typescript
  // Grant / extend access.
  const currentPeriodEnd = input.periodEnd ?? new Date(Date.now() + PERIOD_DAYS * 24 * 60 * 60 * 1000);
```

(Delete the old two-line `setDate` computation; keep `PERIOD_DAYS = 31`.)

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/payments.test.ts`
Expected: PASS (new test + all existing tests, which don't pass `periodEnd` and must still see ~31 days).

- [ ] **Step 5: Commit**

```bash
git add lib/payments.ts lib/payments.test.ts
git commit -m "feat(payments): recordPayment accepts plan-computed periodEnd"
```

---

### Task 4: Webhook resolves plan for amount + period

**Files:**
- Modify: `app/api/webhooks/paymongo/route.ts` (imports at line 2; remarks parsing at lines 87-108; amount check at lines 121-125; recordPayment call at lines 136-144)
- Test: `app/api/webhooks/paymongo/route.test.ts` (create)

**Interfaces:**
- Consumes: `parseLinkRemarks`, `resolvePlan`, `periodEndFor`, `PLANS`, `verifyPaymongoWebhook` from `lib/paymongo.ts`; `recordPayment` from Task 3.

- [ ] **Step 1: Write the failing test** — create `app/api/webhooks/paymongo/route.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import { SEMESTER_END } from "@/lib/paymongo";

const recorded: Array<Record<string, unknown>> = [];
vi.mock("@/lib/payments", () => ({
  recordPayment: (_supabase: unknown, input: Record<string, unknown>) => {
    recorded.push(input);
    return Promise.resolve({ recorded: true, deduped: false });
  },
}));
vi.mock("@/lib/supabase/server", () => ({ createServerClient: () => ({}) }));

import { POST } from "./route";

const SECRET = "whsk_test_secret";
const YEAR = "00000000-0000-0000-0000-000000000001";
const SUBJ = "10000000-0001-0001-0001-000000000001";
const DEV = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

function signedRequest(remarks: string, amount: number) {
  const body = JSON.stringify({
    data: {
      attributes: {
        type: "link.payment.paid",
        livemode: false,
        data: { id: "link_test_1", attributes: { remarks, amount, status: "paid" } },
      },
    },
  });
  const t = Math.floor(Date.now() / 1000);
  const hmac = crypto.createHmac("sha256", SECRET).update(`${t}.${body}`).digest("hex");
  return {
    text: () => Promise.resolve(body),
    headers: {
      get: (h: string) =>
        h === "paymongo-signature" ? `t=${t},te=${hmac},li=${hmac}` : "127.0.0.1",
    },
  } as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  recorded.length = 0;
  vi.stubEnv("PAYMONGO_WEBHOOK_SECRET", SECRET);
  vi.stubEnv("PAYMONGO_LIVEMODE", "false");
});

describe("webhook plan handling", () => {
  it("grants a subject_sem payment until SEMESTER_END", async () => {
    const res = await POST(
      signedRequest(`year:${YEAR} subject:${SUBJ} device:${DEV} plan:subject_sem`, 9900)
    );
    expect(res.status).toBe(200);
    expect(recorded).toHaveLength(1);
    expect((recorded[0].periodEnd as Date).getTime()).toBe(SEMESTER_END.getTime());
  });

  it("rejects a subject_sem underpayment at the semester price", async () => {
    const res = await POST(
      signedRequest(`year:${YEAR} subject:${SUBJ} device:${DEV} plan:subject_sem`, 4900)
    );
    expect(res.status).toBe(400);
    expect(recorded).toHaveLength(0);
  });

  it("treats legacy remarks without a plan token as before (subject_month at 4900)", async () => {
    const res = await POST(signedRequest(`year:${YEAR} subject:${SUBJ} device:${DEV}`, 4900));
    expect(res.status).toBe(200);
    expect(recorded).toHaveLength(1);
    // subject_month: ~31 days, definitely not SEMESTER_END
    expect((recorded[0].periodEnd as Date).getTime()).not.toBe(SEMESTER_END.getTime());
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run app/api/webhooks/paymongo/route.test.ts`
Expected: FAIL — underpayment test passes 200 (expected 4900 for any subject link), no `periodEnd` on recorded input.

- [ ] **Step 3: Implement** — in `app/api/webhooks/paymongo/route.ts`:

Line 2 imports become:

```typescript
import {
  verifyPaymongoWebhook,
  parseLinkRemarks,
  resolvePlan,
  periodEndFor,
  PLANS,
} from "@/lib/paymongo";
```

Replace the inline regex block (lines 87-101) with:

```typescript
  // remarks format: "year:<id> [subject:<id>] device:<id> [user:<id>] [plan:<key>]"
  const parsed = parseLinkRemarks(remarks);
  const yearId = parsed.yearId ?? "";
  const subjectId = parsed.subjectId;
  const deviceId = parsed.deviceId ?? "";
  const userId = parsed.userId && isUuid(parsed.userId) ? parsed.userId : null;

  if (!parsed.yearId || !parsed.deviceId) {
    return NextResponse.json({ error: "Missing remarks" }, { status: 400 });
  }
```

(The `isUuid` checks on lines 103-108 stay as they are.)

Replace the amount check (lines 121-125) with:

```typescript
  // Resolve the tier from the link's plan token (legacy links infer from
  // scope) and validate the paid amount covers it. Reject only UNDERpayments —
  // a payer who paid the correct amount or more must always be granted access.
  const plan = resolvePlan(parsed.plan, subjectId);
  const expectedAmount = PLANS[plan].amount;
  if (typeof paidAmount !== "number" || paidAmount < expectedAmount) {
    console.error(`Webhook underpayment: got ${paidAmount}, expected >= ${expectedAmount} (${plan})`);
    return NextResponse.json({ error: "Amount too low" }, { status: 400 });
  }
```

Add `periodEnd` to the `recordPayment` call (lines 136-144):

```typescript
    const { deduped } = await recordPayment(supabase, {
      linkId,
      deviceId,
      yearId,
      subjectId,
      amount: paidAmount,
      paidAt,
      userId,
      periodEnd: periodEndFor(plan),
    });
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run app/api/webhooks/paymongo/route.test.ts lib/paymongo.test.ts lib/payments.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/webhooks/paymongo/route.ts app/api/webhooks/paymongo/route.test.ts
git commit -m "feat(payments): webhook validates amount and grants period per plan"
```

---

### Task 5: Admin reconcile resolves plan; delete compat exports

**Files:**
- Modify: `app/api/admin/reconcile/route.ts` (imports line 4; expected-amount block; recordPayment call)
- Modify: `lib/paymongo.ts` (delete the temporary `SUBJECT_AMOUNT`/`YEAR_AMOUNT` compat exports from Task 1)

**Interfaces:**
- Consumes: `resolvePlan`, `periodEndFor`, `PLANS`, `parseLinkRemarks` (already imported), `getLinkByReference`.

- [ ] **Step 1: Implement** (covered by Task 1's unit tests for the helpers; this is wiring):

Import line becomes:

```typescript
import { getLinkByReference, parseLinkRemarks, resolvePlan, periodEndFor, PLANS } from "@/lib/paymongo";
```

`parseLinkRemarks` destructuring gains `plan: planToken`:

```typescript
  const { yearId, subjectId, deviceId, userId, plan: planToken } = parseLinkRemarks(link.remarks);
```

Expected-amount block becomes:

```typescript
  const paidAmount = link.amount;
  const plan = resolvePlan(planToken, subjectId);
  const expected = PLANS[plan].amount;
  if (paidAmount < expected) {
    return NextResponse.json(
      { error: `Underpaid: ${paidAmount} < ${expected}` },
      { status: 400 }
    );
  }
```

`recordPayment` call gains `periodEnd: periodEndFor(plan)`.

Then delete the compat exports (`SUBJECT_AMOUNT`, `YEAR_AMOUNT`) from `lib/paymongo.ts` and fix any remaining importer the compiler finds (expected: none besides the two routes already updated; `lib/paymongo.test.ts` may still import `YEAR_AMOUNT` — replace with `PLANS.year_sem.amount`).

- [ ] **Step 2: Verify by grep + full test run**

Run: `grep -rn "SUBJECT_AMOUNT\|YEAR_AMOUNT" app lib` → Expected: no matches.
Run: `npx vitest run` → Expected: ALL PASS.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/reconcile/route.ts lib/paymongo.ts lib/paymongo.test.ts
git commit -m "feat(payments): reconcile grants per plan; retire legacy amount constants"
```

---

### Task 6: `/api/subscribe` accepts a plan

**Files:**
- Modify: `app/api/subscribe/route.ts` (body parsing lines 18-38; createPaymongoLink call lines 82-88)
- Test: `app/api/subscribe/route.test.ts` (create)

**Interfaces:**
- Produces: request body accepts `plan?: "subject_month" | "subject_sem" | "year_sem"`. Missing plan → legacy default (`subject_month` when subjectId present, else `year_sem`). Plan/scope mismatch or unknown plan → 400 `{ error: "Invalid plan" }`.
- Consumes: `createPaymongoLink(..., plan)` from Task 2, `PLANS`/`PlanKey` from Task 1.

- [ ] **Step 1: Write the failing test** — create `app/api/subscribe/route.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

const linkCalls: unknown[][] = [];
vi.mock("@/lib/paymongo", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/paymongo")>();
  return {
    ...actual,
    createPaymongoLink: (...args: unknown[]) => {
      linkCalls.push(args);
      return Promise.resolve({ checkoutUrl: "https://pm.link/x", linkId: "link_1" });
    },
  };
});
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: () => ({
      select: () => ({
        eq: (_c: string, _v: string) => ({
          maybeSingle: () => Promise.resolve({ data: { id: "x" } }),
          eq: () => ({ maybeSingle: () => Promise.resolve({ data: { id: "x" } }) }),
        }),
      }),
    }),
  }),
}));
vi.mock("@/lib/auth/currentUser", () => ({ getCurrentUserId: () => Promise.resolve(null) }));

import { POST } from "./route";

const YEAR = "00000000-0000-0000-0000-000000000001";
const SUBJ = "10000000-0001-0001-0001-000000000001";
const DEV = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

let ipCounter = 0;
function makeReq(body: Record<string, unknown>) {
  const ip = `10.1.0.${ipCounter++ % 250}`;
  return {
    json: () => Promise.resolve(body),
    headers: { get: (h: string) => (h === "origin" ? "http://localhost:3000" : ip) },
  } as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  linkCalls.length = 0;
});

describe("POST /api/subscribe plan validation", () => {
  it("passes a valid plan through to createPaymongoLink", async () => {
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan: "subject_sem" }));
    expect(res.status).toBe(200);
    expect(linkCalls[0][5]).toBe("subject_sem"); // 6th arg = plan
  });

  it("rejects a plan that contradicts the scope", async () => {
    const res = await POST(makeReq({ yearId: YEAR, deviceId: DEV, plan: "subject_sem" }));
    expect(res.status).toBe(400);
    const res2 = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan: "year_sem" }));
    expect(res2.status).toBe(400);
  });

  it("rejects an unknown plan", async () => {
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan: "free_forever" }));
    expect(res.status).toBe(400);
  });

  it("defaults legacy requests without a plan", async () => {
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV }));
    expect(res.status).toBe(200);
    expect(linkCalls[0][5]).toBe("subject_month");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run app/api/subscribe/route.test.ts`
Expected: FAIL — plan arg is undefined, invalid plans are not rejected.

- [ ] **Step 3: Implement** — in `app/api/subscribe/route.ts`:

Add to imports: `import { createPaymongoLink, PLANS, type PlanKey } from "@/lib/paymongo";` (replacing the existing paymongo import).

Extend body type and add validation after the existing UUID checks (after line 38):

```typescript
  const body = (await req.json().catch(() => null)) as
    | { yearId?: string; subjectId?: string; deviceId?: string; returnPath?: string; plan?: string }
    | null;
```

```typescript
  // Plan: optional for legacy clients (defaults to the old tier for the
  // scope), but when present it must be a known key that matches the scope.
  let plan: PlanKey;
  if (body?.plan === undefined) {
    plan = subjectId ? "subject_month" : "year_sem";
  } else if (
    body.plan in PLANS &&
    (body.plan !== "year_sem") === (subjectId !== null)
  ) {
    plan = body.plan as PlanKey;
  } else {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
```

Pass it through at the createPaymongoLink call:

```typescript
    const { checkoutUrl } = await createPaymongoLink(
      yearId,
      deviceId,
      successUrl,
      subjectId,
      userId ?? undefined,
      plan
    );
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run app/api/subscribe/route.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/subscribe/route.ts app/api/subscribe/route.test.ts
git commit -m "feat(payments): subscribe API accepts and validates plan tier"
```

---

### Task 7: SubscribeGate — 3-card ladder + reviewer copy + trust signals

**Files:**
- Modify: `components/SubscribeGate.tsx` (plan type at line 18; `handleSubscribe` lines 122-156; card markup lines 175-278)

**Interfaces:**
- Consumes: `/api/subscribe` `plan` field from Task 6.
- Produces: none consumed later; pure UI. Prices are hardcoded labels — keep in sync with `PLANS` in `lib/paymongo.ts`.

No unit test (client component, copy + wiring); verified by build + manual pass in Task 11. `subscribe_click` logging stays as is.

- [ ] **Step 1: Implement.** Change the loading state type and handler to plan keys:

```typescript
type GatePlan = "subject_month" | "subject_sem" | "year_sem";
const [loading, setLoading] = useState<GatePlan | null>(null);
```

```typescript
  async function handleSubscribe(plan: GatePlan) {
    const deviceId = getDeviceId();
    if (!deviceId) return;

    logEvent("subscribe_click", { year_id: yearId, subject_id: subjectId });
    setLoading(plan);
    setError(null);

    try {
      const returnPath =
        typeof window !== "undefined" ? window.location.pathname : undefined;
      const body =
        plan === "year_sem"
          ? { yearId, deviceId, returnPath, plan }
          : { yearId, subjectId, deviceId, returnPath, plan };
      // ... fetch block unchanged
```

Replace the two-card block (lines 220-271) with three cards. Header copy (lines 177-182) becomes:

```tsx
      <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mb-2">
        Reviewer — locked
      </p>
      <p className="font-sans text-base text-ink-muted mb-6">
        Reviewers with answer keys — drills, code labs, and full solutions.
        Unlock them below.
      </p>
```

Cards (keep the existing button/border classes; this is the structure and copy):

```tsx
        <div className="flex flex-col sm:flex-row gap-4">
          {/* ₱49 — subject, 1 month */}
          <div className="flex-1 border border-ink-faint/30 p-5 flex flex-col gap-4">
            <div>
              <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mb-1">
                1 Month
              </p>
              <p className="font-sans text-sm text-ink-muted">{subjectTitle ?? "This subject"} only</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl text-ink">₱49</span>
              <span className="font-sans text-sm text-ink-muted">/ month</span>
            </div>
            <button
              onClick={() => handleSubscribe("subject_month")}
              disabled={loading !== null}
              className="bg-accent text-paper font-sans text-sm px-4 py-3 hover:bg-ink transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "subject_month" ? "Redirecting…" : "Unlock — ₱49"}
            </button>
          </div>

          {/* ₱99 — subject, semester (anchor) */}
          <div className="flex-1 border border-accent/60 p-5 flex flex-col gap-4 relative">
            <span className="absolute top-3 right-3 font-mono text-label-sm uppercase tracking-[0.1em] text-accent">
              ★ Most Popular
            </span>
            <div>
              <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mb-1">
                Whole Semester
              </p>
              <p className="font-sans text-sm text-ink-muted">
                {subjectTitle ?? "This subject"} until Dec 31 — covers prelims, midterms, and finals
              </p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl text-ink">₱99</span>
              <span className="font-sans text-sm text-ink-muted">/ semester</span>
            </div>
            <button
              onClick={() => handleSubscribe("subject_sem")}
              disabled={loading !== null}
              className="bg-accent text-paper font-sans text-sm px-4 py-3 hover:bg-ink transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "subject_sem" ? "Redirecting…" : "Unlock — ₱99"}
            </button>
          </div>

          {/* ₱299 — all subjects, semester */}
          <div className="flex-1 border border-ink/60 p-5 flex flex-col gap-4 relative">
            <span className="absolute top-3 right-3 font-mono text-label-sm uppercase tracking-[0.1em] text-accent">
              Best Value
            </span>
            <div>
              <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mb-1">
                Everything
              </p>
              <p className="font-sans text-sm text-ink-muted">
                All subjects in {yearLabel ?? "this year"} until Dec 31
              </p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl text-ink">₱299</span>
              <span className="font-sans text-sm text-ink-muted">/ semester</span>
            </div>
            <button
              onClick={() => handleSubscribe("year_sem")}
              disabled={loading !== null}
              className="bg-ink text-paper font-sans text-sm px-4 py-3 hover:bg-accent transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "year_sem" ? "Redirecting…" : "Unlock everything — ₱299"}
            </button>
          </div>
        </div>
```

Footer copy (lines 273-277) becomes:

```tsx
      <div className="mt-4 flex flex-col gap-2">
        <p className="font-sans text-xs text-ink-faint">
          One-time payment via GCash, Maya, or card. No auto-renew — access simply
          ends with the semester. Instant unlock after payment.
        </p>
      </div>
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit 2>&1 | head` (or `npm run build` if tsc isn't configured standalone)
Expected: no new type errors.

- [ ] **Step 3: Commit**

```bash
git add components/SubscribeGate.tsx
git commit -m "feat(ux): 3-tier semester ladder + reviewer reframe on subscribe gate"
```

---

### Task 8: PaywallTeaser reframe + reviewer count

**Files:**
- Modify: `components/PaywallTeaser.tsx` (props + copy, lines 8-19 and 65-85)
- Modify: `app/(main)/year/[yearId]/subjects/[subjectId]/modules/page.tsx` (compute count, pass prop)
- Modify: `app/(main)/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx` (pass count — the count query is added in Task 9 for this page; here add it to the modules-list page only, the reader page wires it in Task 9)

**Interfaces:**
- Produces: `PaywallTeaser` gains optional `reviewerCount?: number`.
- Consumes: nothing new.

- [ ] **Step 1: Implement PaywallTeaser copy.** Add `reviewerCount` to Props; replace the body copy (lines 66-76):

```tsx
    <div className="border border-accent/40 bg-accent/[0.03] p-5 mb-10">
      <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent mb-2">
        Reviewers with Answer Keys
      </p>
      <p className="font-sans text-base text-ink-muted mb-4">
        {reviewerCount
          ? `${reviewerCount} reviewers with answer keys in ${subjectTitle ?? "this subject"} — drills, code labs, and full solutions.`
          : `Reviewers with answer keys in ${subjectTitle ?? "this subject"} — drills, code labs, and full solutions.`}{" "}
        The first one&apos;s free. Unlock the rest for{" "}
        <span className="text-ink font-semibold">₱99 until end of semester</span>, or all of{" "}
        {yearLabel ?? "this year"} for <span className="text-ink font-semibold">₱299</span>.
      </p>
      <Link
        href={ctaHref}
        onClick={handleClick}
        className="inline-block bg-accent text-paper font-sans text-sm px-4 py-3 hover:bg-ink transition-colors duration-150"
      >
        Unlock reviewers →
      </Link>
    </div>
```

- [ ] **Step 2: Compute the count on the modules-list page.** In `app/(main)/year/[yearId]/subjects/[subjectId]/modules/page.tsx`, alongside the existing parallel fetches add:

```typescript
  const { count: reviewerCount } = await supabase
    .from("sections")
    .select("id, modules!inner(subject_id)", { count: "exact", head: true })
    .eq("kind", "activity")
    .eq("modules.subject_id", subjectId);
```

and pass `reviewerCount={reviewerCount ?? undefined}` to the `<PaywallTeaser>` at line 64.

- [ ] **Step 3: Verify**

Run: `npm run build 2>&1 | tail -5`
Expected: build passes. (The count query's `!inner` join filter is the one risky piece — if the build page errors at runtime in Task 11's manual pass, fall back to two queries: module ids for the subject, then `.in("module_id", ids)` with `count: "exact", head: true`.)

- [ ] **Step 4: Commit**

```bash
git add components/PaywallTeaser.tsx "app/(main)/year/[yearId]/subjects/[subjectId]/modules/page.tsx"
git commit -m "feat(ux): reviewer reframe + concrete count on paywall teaser"
```

---

### Task 9: Free first reviewer per subject

**Files:**
- Create: `lib/freeSample.ts`
- Test: `lib/freeSample.test.ts`
- Modify: `app/(main)/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx` (fetch free section in full; pass props)
- Modify: `components/SectionRenderer.tsx` (render free section unlocked + upsell banner after it)

**Interfaces:**
- Produces: `pickFirstActivity(orderedModuleIds: string[], sections: { id: string; module_id: string; sort_order: number }[]): string | null` — the subject's first activity section id, or null.
- Produces: `SectionRenderer` gains `freeSectionId?: string | null` and `reviewerCount?: number`. A locked activity section whose id equals `freeSectionId` renders fully (body, IDE, topology) followed by the upsell banner.
- Consumes: reader page already has `siblingModules` (ordered by sort_order) and `activityMeta`.

- [ ] **Step 1: Write the failing test** — create `lib/freeSample.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { pickFirstActivity } from "./freeSample";

describe("pickFirstActivity", () => {
  const sections = [
    { id: "s-late", module_id: "m2", sort_order: 1 },
    { id: "s-first", module_id: "m1", sort_order: 3 },
    { id: "s-second", module_id: "m1", sort_order: 7 },
  ];

  it("picks the lowest sort_order section of the earliest module that has activities", () => {
    expect(pickFirstActivity(["m1", "m2"], sections)).toBe("s-first");
  });

  it("skips earlier modules with no activity sections", () => {
    expect(pickFirstActivity(["m0", "m1", "m2"], sections)).toBe("s-first");
  });

  it("respects module order over section sort_order", () => {
    expect(pickFirstActivity(["m2", "m1"], sections)).toBe("s-late");
  });

  it("returns null when the subject has no activities", () => {
    expect(pickFirstActivity(["m1"], [])).toBeNull();
    expect(pickFirstActivity([], sections)).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/freeSample.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** — create `lib/freeSample.ts`:

```typescript
// The one activity section per subject that locked visitors get in full — a
// taste of what the paid reviewers look like. Selection: first module (by the
// caller's module ordering) that has any activity section, then that module's
// lowest sort_order activity.
export function pickFirstActivity(
  orderedModuleIds: string[],
  sections: { id: string; module_id: string; sort_order: number }[]
): string | null {
  for (const moduleId of orderedModuleIds) {
    const candidates = sections.filter((s) => s.module_id === moduleId);
    if (candidates.length === 0) continue;
    candidates.sort((a, b) => a.sort_order - b.sort_order);
    return candidates[0].id;
  }
  return null;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/freeSample.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire the reader page.** In `app/(main)/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx`, after the `activityMeta` fetch (line 61-70), add — only for locked visitors:

```typescript
  // Free sample: locked visitors get the subject's FIRST activity in full — a
  // taste of the paid reviewers. Everything else stays headings-only.
  let freeSectionId: string | null = null;
  let reviewerCount = 0;
  let freeSection: ReaderSection | null = null;
  if (!unlockActivities) {
    const { data: subjectActivities } = await supabase
      .from("sections")
      .select("id, module_id, sort_order")
      .eq("kind", "activity")
      .in("module_id", siblings.map((m) => m.id));
    const rows = subjectActivities ?? [];
    reviewerCount = rows.length;
    freeSectionId = pickFirstActivity(siblings.map((m) => m.id), rows);

    // Fetch the free section's full body only when it lives in THIS module.
    if (freeSectionId && (activityMeta ?? []).some((s) => s.id === freeSectionId)) {
      const { data: full } = await supabase
        .from("sections")
        .select("id, kind, heading, body_md, sort_order, ide_language, starter_code, topology_data")
        .eq("id", freeSectionId)
        .single();
      freeSection = (full as ReaderSection) ?? null;
    }
  }
```

(Move the `type ReaderSection` declaration above this block. Import `pickFirstActivity` from `@/lib/freeSample`.)

When building `allSections`, substitute the full free section for its headings-only stub:

```typescript
  const allSections: ReaderSection[] = [
    ...((contentSections ?? []) as ReaderSection[]),
    ...((activityMeta ?? []) as Partial<ReaderSection>[]).map((s) => {
      if (freeSection && s.id === freeSection.id) return freeSection;
      return {
        body_md: "",
        ide_language: null,
        starter_code: null,
        topology_data: null,
        ...s,
      } as ReaderSection;
    }),
  ].sort((a, b) => a.sort_order - b.sort_order);
```

Pass to each `<SectionRenderer>`: `freeSectionId={freeSectionId}` and `reviewerCount={reviewerCount}`. Pass `reviewerCount={reviewerCount || undefined}` to the module page's `<PaywallTeaser>` too (Task 8 interface).

- [ ] **Step 6: Render it in SectionRenderer.** In `components/SectionRenderer.tsx`, add to Props: `freeSectionId?: string | null; reviewerCount?: number;`. Change the locked-activity branch (line 53) to exempt the free section:

```typescript
  const isFreeSample = section.kind === "activity" && !unlockAll && section.id === freeSectionId;

  if (section.kind === "activity" && !unlockAll && !isFreeSample) {
    // ... existing SubscribeGate branch unchanged
  }
```

In the unlocked render path, after the Playground block (after line 88), add the upsell that follows the free sample:

```tsx
      {isFreeSample && (
        <div className="mt-6 pl-10 md:pl-12">
          <div className="border border-accent/40 bg-accent/[0.03] p-5">
            <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent mb-2">
              Free Sample
            </p>
            <p className="font-sans text-base text-ink-muted mb-4">
              That was 1 of {reviewerCount ?? "the"} reviewers with answer keys in{" "}
              {subjectTitle ?? "this subject"}. Unlock all of them for the semester.
            </p>
            <a
              href="#subscribe"
              className="inline-block bg-accent text-paper font-sans text-sm px-4 py-3 hover:bg-ink transition-colors duration-150"
            >
              Unlock all reviewers →
            </a>
          </div>
        </div>
      )}
```

Also change the `Activity (UNLOCK_ALL active)` label condition (line 89) to `section.kind === "activity" && unlockAll` — unchanged, but confirm the free sample does NOT show it (it won't: `unlockAll` is false).

- [ ] **Step 7: Verify**

Run: `npx vitest run && npm run build 2>&1 | tail -5`
Expected: all tests pass, build passes.

- [ ] **Step 8: Commit**

```bash
git add lib/freeSample.ts lib/freeSample.test.ts components/SectionRenderer.tsx "app/(main)/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx"
git commit -m "feat(ux): free first reviewer per subject with inline upsell"
```

---

### Task 10: AccountSidebar modals — ladder + copy

**Files:**
- Modify: `components/account/AccountSidebar.tsx` (`startCheckout` body ~line 30; `YearSubscribeModal` lines 42-122; `SubjectSubscribeModal` lines 126-173)

**Interfaces:**
- Consumes: `/api/subscribe` `plan` field (Task 6).

- [ ] **Step 1: Implement.** `startCheckout` already spreads a body object — callers now include `plan`. In `YearSubscribeModal`:

```typescript
  type ModalPlan = "subject_month" | "subject_sem" | "year_sem";
  const [loading, setLoading] = useState<ModalPlan | null>(null);

  async function handlePlan(plan: ModalPlan) {
    setLoading(plan);
    setError(null);
    await startCheckout(
      plan === "year_sem"
        ? { yearId: year.yearId, plan }
        : { yearId: year.yearId, subjectId: subjectId ?? null, plan },
      (msg) => { setError(msg); setLoading(null); }
    );
  }
```

Buttons become three (subject rows only show the two subject tiers when `subjectId` is set; the year tier always shows):
- `₱49` — "Single subject · 1 month" → `handlePlan("subject_month")`
- `₱99` — "Single subject · until Dec 31 (whole semester)" + "★ Most Popular" badge → `handlePlan("subject_sem")`
- `₱299` — "Every subject in this year · until Dec 31" + "Best value" badge → `handlePlan("year_sem")`

Keep the existing button classNames (copy the ₱49 button's classes for ₱99; keep the accented classes on ₱299).

In `SubjectSubscribeModal`, replace the single button with the two subject tiers (same `startCheckout` call shape with `plan: "subject_month"` / `plan: "subject_sem"`, labels "Unlock — ₱49 / 1 month" and "Unlock — ₱99 / semester").

Replace BOTH footers (lines 118, 169): `Paid via GCash, Maya, or card. Cancel anytime.` →

```
One-time payment via GCash, Maya, or card. No auto-renew.
```

- [ ] **Step 2: Verify**

Run: `npm run build 2>&1 | tail -5`
Expected: build passes.

- [ ] **Step 3: Commit**

```bash
git add components/account/AccountSidebar.tsx
git commit -m "feat(ux): semester tiers in account subscribe modals"
```

---

### Task 11: Full verification + ship

**Files:** none new.

- [ ] **Step 1: Full suite + lint + build**

Run: `npx vitest run && npm run lint && npm run build`
Expected: all pass (2 pre-existing lint warnings in `lib/auth/claim.test.ts` are known).

- [ ] **Step 2: Manual end-to-end pass (verify skill / browser).** On the deployed preview or `npm run dev` with a fresh device (no subscription):
  1. Open a CP1 module with activities → first subject activity renders in FULL with the Free Sample upsell after it; other activities show "Reviewer — locked" + 3-card gate.
  2. Teaser on the modules list shows the reviewer count and ₱99 anchor.
  3. Click each tier → PayMongo checkout opens with the right amount (₱49/₱99/₱299) — verify amount on the PayMongo page, then close WITHOUT paying.
  4. Account sidebar modals show the new tiers and copy.
- [ ] **Step 3: Live-webhook smoke check after deploy.** After merging to main and Vercel deploy is Ready: `vercel ls --prod` shows ● Ready. Optionally verify a real ₱99 test purchase end-to-end (user's call — it's real money; the admin reconcile view can refund-grant if anything misfires).
- [ ] **Step 4: Push**

```bash
git push "https://$(gh auth token)@github.com/lauurnce/survivalKitApp.git" main
```

---

## Self-Review Notes

- Spec coverage: pricing plumbing (Tasks 1-6), gate/teaser reframe (7, 8), free first reviewer (9), AccountSidebar sync (10), testing/rollout (11). Edge cases: stale SEMESTER_END (Task 1 test), scope-mismatch plans (Tasks 1, 6 tests), legacy links (Tasks 1, 4 tests), subject with no activities (Task 9 test → null → page renders as today).
- Type consistency: `PlanKey` defined once in Task 1 and imported everywhere; `periodEnd?: Date` on `RecordPaymentInput` consumed by Tasks 4-5; `freeSectionId`/`reviewerCount` produced by Task 9's page wiring and consumed by SectionRenderer in the same task.
- `parseLinkRemarks` return-type change (new `plan` field) is additive; the one other consumer (`listRecentPaidLinks` spread at `lib/paymongo.ts:220`) spreads the parsed object into `PaidLink` — add `plan` to the `PaidLink` interface or destructure it out; simplest: add `plan: string | null` to `PaidLink`.
