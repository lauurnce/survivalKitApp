# Self-Serve Class Rep System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the founder-brokered manual class-grant flow with a fully self-serve system: a rep pays through real PayMongo checkout with seat-tiered pricing, classmates request to join via a shareable link and wait for rep approval (no more typing a code or messaging the founder), and the rep gets a dashboard showing pending requests and per-classmate progress.

**Architecture:** Extends the existing `classes`/`class_members` schema (from the prior manual-grant iteration) with a new `class_join_requests` table for the approval step. Reuses the existing PayMongo webhook infrastructure (`app/api/webhooks/paymongo/route.ts`, `lib/payments.ts`) with a new "class purchase" branch, rather than inventing a parallel payment pipeline. The admin-only `POST /api/admin/grant-class` route from the prior iteration stays in place unlinked as a manual override — it is not removed by this plan.

**Tech Stack:** Next.js App Router, Supabase (Postgres + RLS), PayMongo Payment Links API, existing device-cookie identity system (`lib/auth/deviceCookie.ts`).

## Global Constraints

- Never trust a client-supplied amount, device ID, or seat count for anything that affects money or access — every route in this plan must derive `repDeviceId`/`deviceId` from the signed device cookie (`DEVICE_COOKIE`/`verifyDeviceCookie` in `lib/auth/deviceCookie.ts`) and recompute price/seats server-side, mirroring every existing route in this codebase (`app/api/subscribe/route.ts`, `app/api/class/join/route.ts`).
- Class code lookups must use exact match (`.eq`), never `.ilike` — a prior security review found `.ilike` lets `%`/`_` act as SQL wildcards, an authorization bypass. Validate any code against the alphabet `23456789ABCDEFGHJKMNPQRSTUVWXYZ` (case-insensitive, 6 chars) before it reaches a query.
- All new/modified tables need RLS enabled with explicit policies, mirroring the existing `classes`/`class_members` policies (device-scoped reads via `current_setting('app.device_id', true)`); privileged writes go through the service-role client (`createServerClient()`), which bypasses RLS and does its own authorization check in code.
- Migrations must be idempotent (`create table if not exists`, `alter table ... if not exists` guards where the syntax supports it, `drop policy if exists` before `create policy`).
- Pricing formula, exact values, verbatim from the approved spec (`docs/superpowers/specs/2026-07-16-self-serve-class-rep-design.md`): `total = (scope === 'all' ? 999 : 799) + max(0, declaredSeats - 11) * 59`, amounts in **pesos** in this formula but must be converted to **centavos** (× 100) wherever PayMongo or the `payments`/`classes` tables expect an amount, matching the existing convention in `lib/paymongo.ts`'s `PLANS` (e.g. `4900` = ₱49). `declaredSeats` has a UI-enforced minimum of 11.
- No seat top-up flow, no rep account-recovery flow, no email/push notifications, no classmate names collected — all explicitly out of scope per the spec.

---

### Task 1: Fix `isSubscribed`'s class-membership branch for all-subjects classes + relax `classes.subject_id`

**Files:**
- Modify: `supabase/migrations/` — create new migration `supabase/migrations/20260717000000_classes_subject_id_nullable.sql`
- Modify: `lib/subscriptions.ts`
- Modify: `lib/subscriptions.test.ts`

**Interfaces:**
- Consumes: existing `classes`/`class_members` tables (`supabase/migrations/20260716000000_classes.sql`).
- Produces: `isSubscribed(deviceId, yearId, subjectId?, userId?)` — signature unchanged — now also returns `true` when a device belongs to an **all-subjects** class (`classes.subject_id IS NULL`) scoped to the matching `yearId`, in addition to the existing subject-scoped class check.

This is a real, pre-existing gap discovered while writing this plan: the current class-membership branch in `lib/subscriptions.ts` does `.eq("classes.subject_id", subjectId)`, which can never match a class row where `subject_id IS NULL` (the "all subjects" case this plan introduces). Without this fix, an all-subjects class purchase would silently unlock nothing.

- [ ] **Step 1: Write the migration to relax the column**

```sql
-- supabase/migrations/20260717000000_classes_subject_id_nullable.sql
-- Allows a class purchase to cover "all subjects for this year" (subject_id
-- IS NULL), mirroring the existing subscriptions.subject_id convention where
-- NULL already means "whole year." Idempotent: dropping a NOT NULL
-- constraint that's already dropped is a no-op in Postgres.
alter table classes alter column subject_id drop not null;
```

- [ ] **Step 2: Write the failing test for the all-subjects unlock case**

Read `lib/subscriptions.test.ts` in full first to match its existing mocking style for the class-membership branch (added in the prior iteration), then add:

```ts
describe("isSubscribed - all-subjects class membership", () => {
  it("unlocks any subject in the class's year when the class has subject_id IS NULL", async () => {
    // Arrange: year/subject direct-subscription queries return no row.
    // class_members join returns a class row where classes.subject_id is
    // null, classes.year_id matches, status active, unexpired.
    // Assert isSubscribed(deviceId, yearId, someSubjectIdInThatYear) === true.
  });

  it("does not unlock a subject in a DIFFERENT year even with an active all-subjects class", async () => {
    // classes.year_id does not match the queried yearId -> false.
  });
});
```

- [ ] **Step 3: Run the test to confirm it fails**

Run: `npm test -- lib/subscriptions.test.ts`
Expected: FAIL (current query structurally excludes `subject_id IS NULL` rows).

- [ ] **Step 4: Fix the query in `lib/subscriptions.ts`**

Read the current class-membership branch (near the end of the function) before editing. Replace the single `.eq("classes.subject_id", subjectId)` filter with a filter that accepts either an exact subject match OR a null (all-subjects) class:

```ts
// Class membership: a joined class with an active, unexpired grant for
// this exact subject (or an all-subjects class for this year) unlocks
// every member (block sales via class rep).
const { data: membership } = await supabase
  .from("class_members")
  .select("class_id, classes!inner(subject_id, year_id, status, current_period_end)")
  .eq("device_id", deviceId)
  .eq("classes.year_id", yearId)
  .or(`subject_id.eq.${subjectId},subject_id.is.null`, { referencedTable: "classes" })
  .eq("classes.status", "active")
  .gt("classes.current_period_end", now)
  .limit(1)
  .maybeSingle();

return !!membership;
```

Note: PostgREST's `.or()` with `referencedTable` targets the embedded `classes` filter set — verify this syntax against the installed `@supabase/supabase-js` version's docs/types before finalizing (check `node_modules/@supabase/postgrest-js` version or run a quick local query against the dev Supabase instance) since `.or()` + embedded-table filtering has had syntax changes across versions; if the exact syntax doesn't work as written, the equivalent two-query fallback (query subject-scoped class membership, then separately query all-subjects class membership, return true if either hits) is an acceptable, if less elegant, substitute — prefer the single-query `.or()` form if it works cleanly.

- [ ] **Step 5: Run the test to confirm it passes**

Run: `npm test -- lib/subscriptions.test.ts`
Expected: PASS, including the two pre-existing class-membership tests (subject-scoped case) — confirm no regression.

- [ ] **Step 6: Run the full suite and commit**

Run: `npm test && npx tsc --noEmit`

```bash
git add supabase/migrations/20260717000000_classes_subject_id_nullable.sql lib/subscriptions.ts lib/subscriptions.test.ts
git commit -m "fix: unlock all-subjects classes in isSubscribed, relax classes.subject_id"
```

---

### Task 2: `class_join_requests` table

**Files:**
- Create: `supabase/migrations/20260717010000_class_join_requests.sql`

**Interfaces:**
- Produces: table `class_join_requests (id uuid, class_id uuid references classes(id), device_id text, status text check in ('pending','approved','rejected'), created_at timestamptz, decided_at timestamptz, unique(class_id, device_id))`. Later tasks (3, 5, 6) read/write this table by these exact names.

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/20260717010000_class_join_requests.sql
-- Classmate join requests awaiting rep approval — replaces the prior
-- iteration's auto-join (app/api/class/join/route.ts) with an approval step.
-- Idempotent: safe to run against the live DB or a fresh one.

create table if not exists class_join_requests (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes(id) on delete cascade,
  device_id   text not null,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now(),
  decided_at  timestamptz,
  unique(class_id, device_id)
);

create index if not exists class_join_requests_class_status_idx
  on class_join_requests (class_id, status);

alter table class_join_requests enable row level security;

-- A device may read only its own join requests (used by the polling
-- endpoint). Service role bypasses for the rep-facing approve/reject route.
drop policy if exists "device reads own join requests" on class_join_requests;
create policy "device reads own join requests"
  on class_join_requests for select
  using (device_id = current_setting('app.device_id', true));
```

- [ ] **Step 2: Verify locally**

Run: `supabase db reset` (or equivalent local-replay command — check `package.json` scripts) then confirm the table exists and the check constraint rejects an invalid status:

```bash
# Via Supabase Studio SQL editor or psql against the local instance:
# insert into class_join_requests (class_id, device_id, status) values ('<real class id>', 'test-device', 'bogus');
# Expect: check constraint violation.
```

If no local Postgres replay is available, verify by careful reading (confirm `classes(id)` exists as an FK target, confirm the `subscription_status`-style check-constraint syntax is valid Postgres) rather than skipping verification — note in the task's self-review which method was used.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260717010000_class_join_requests.sql
git commit -m "feat(db): add class_join_requests table for rep-approval flow"
```

---

### Task 3: Shared class-code generator helper

**Files:**
- Create: `lib/classCode.ts`
- Create: `lib/classCode.test.ts`
- Modify: `app/api/admin/grant-class/route.ts` (use the shared helper instead of its inline copy)

**Interfaces:**
- Produces: `export const CODE_ALPHABET: string` and `export function generateClassCode(): string` — a 6-character code from the alphabet `23456789ABCDEFGHJKMNPQRSTUVWXYZ` (excludes `0/O/1/I/L` to avoid Messenger-transcription errors). Also `export function isValidClassCodeShape(code: string): boolean` — the regex check `/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/i.test(code)`, currently duplicated inline in `app/api/class/join/route.ts`.
- Consumes by: Task 5 (webhook, to generate the code at class-creation time) and any future code reading/writing class codes.

This removes duplication ahead of Task 5 needing the same code-generation logic the webhook will now own (moved from `grant-class`'s inline function).

- [ ] **Step 1: Write the failing test**

```ts
// lib/classCode.test.ts
import { describe, it, expect } from "vitest";
import { generateClassCode, isValidClassCodeShape, CODE_ALPHABET } from "./classCode";

describe("generateClassCode", () => {
  it("produces a 6-character code using only alphabet characters", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateClassCode();
      expect(code).toHaveLength(6);
      expect([...code].every((c) => CODE_ALPHABET.includes(c))).toBe(true);
    }
  });
});

describe("isValidClassCodeShape", () => {
  it("accepts a valid 6-char alphabet code, case-insensitively", () => {
    expect(isValidClassCodeShape("ABC234")).toBe(true);
    expect(isValidClassCodeShape("abc234")).toBe(true);
  });

  it("rejects wrong length", () => {
    expect(isValidClassCodeShape("AB")).toBe(false);
    expect(isValidClassCodeShape("ABC2345")).toBe(false);
  });

  it("rejects SQL wildcard characters even at length 6", () => {
    expect(isValidClassCodeShape("%%%%%%")).toBe(false);
    expect(isValidClassCodeShape("AB__EF")).toBe(false);
  });

  it("rejects excluded ambiguous characters (0, O, 1, I, L)", () => {
    expect(isValidClassCodeShape("ABC0EF")).toBe(false);
    expect(isValidClassCodeShape("ABCOEF")).toBe(false);
    expect(isValidClassCodeShape("ABC1EF")).toBe(false);
    expect(isValidClassCodeShape("ABCIEF")).toBe(false);
    expect(isValidClassCodeShape("ABCLEF")).toBe(false);
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- lib/classCode.test.ts`
Expected: FAIL (module doesn't exist).

- [ ] **Step 3: Write the implementation**

```ts
// lib/classCode.ts
// Excludes 0/O/1/I/L to avoid Messenger-transcription errors when reps
// read the code aloud or retype it from a screenshot.
export const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

const SHAPE_RE = new RegExp(`^[${CODE_ALPHABET}]{6}$`, "i");

export function generateClassCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

export function isValidClassCodeShape(code: string): boolean {
  return SHAPE_RE.test(code);
}
```

- [ ] **Step 4: Run to confirm pass**

Run: `npm test -- lib/classCode.test.ts`
Expected: PASS.

- [ ] **Step 5: Update `grant-class` to use the shared helper**

In `app/api/admin/grant-class/route.ts`, remove the inline `CODE_ALPHABET` constant and `generateClassCode` function, replace with `import { generateClassCode } from "@/lib/classCode";`. Behavior must be identical — this is a pure refactor, verify by re-running its existing test file.

Run: `npm test -- app/api/admin/grant-class/route.test.ts`
Expected: PASS, unchanged (7 tests from the prior iteration).

- [ ] **Step 6: Full suite + commit**

Run: `npm test && npx tsc --noEmit`

```bash
git add lib/classCode.ts lib/classCode.test.ts app/api/admin/grant-class/route.ts
git commit -m "refactor: extract shared class-code generator/validator into lib/classCode.ts"
```

---

### Task 4: Dynamic-amount PayMongo link support

**Files:**
- Modify: `lib/paymongo.ts`
- Modify: `lib/paymongo.test.ts` (check if it exists first; create alongside if not, matching existing test conventions in the file's directory)

**Interfaces:**
- Produces: `export async function createDynamicPaymongoLink(amount: number, description: string, remarks: string, successUrl: string, idempotencyKey: string): Promise<{ checkoutUrl: string; linkId: string }>` — a sibling to the existing `createPaymongoLink`, for purchases whose amount isn't one of the fixed `PLANS` entries.

The existing `createPaymongoLink` resolves `amount`/`description` from the fixed `PLANS` table via `resolvePlan`. A class purchase's amount is computed from the seat-count formula, not a fixed plan, so it needs its own entry point rather than forcing a fake `PlanKey` through the existing function.

- [ ] **Step 1: Read `lib/paymongo.ts` in full** to confirm the exact PayMongo API call shape (headers, idempotency key construction, response parsing) used by the existing `createPaymongoLink`, since the new function must make an identical HTTP call, just with caller-supplied `amount`/`description`/`remarks` instead of plan-resolved ones.

- [ ] **Step 2: Write the failing test**

```ts
// Add to lib/paymongo.test.ts (or create it, matching whatever mocking
// pattern the existing createPaymongoLink tests use for the fetch() call —
// read the file first if it exists).
describe("createDynamicPaymongoLink", () => {
  it("calls the PayMongo links API with the exact caller-supplied amount and remarks", async () => {
    // Mock global.fetch, assert the request body's attributes.amount equals
    // the passed amount (not looked up from PLANS), attributes.remarks
    // equals the passed remarks string, and the idempotency key header
    // equals the passed idempotencyKey.
  });

  it("throws when PAYMONGO_SECRET_KEY is not set", async () => {
    // mirrors createPaymongoLink's existing guard
  });

  it("throws with the PayMongo error detail on a non-ok response", async () => {
    // mirrors createPaymongoLink's existing error-surfacing behavior
  });
});
```

- [ ] **Step 3: Run to confirm failure**

Run: `npm test -- lib/paymongo.test.ts`
Expected: FAIL.

- [ ] **Step 4: Implement**

```ts
// Add to lib/paymongo.ts, near createPaymongoLink.

// For purchases whose amount is computed dynamically (e.g. class-rep block
// sales, priced by seat count) rather than looked up from the fixed PLANS
// table. Caller is responsible for computing `amount` (centavos) and
// `remarks` correctly — this function does no plan resolution, unlike
// createPaymongoLink.
export async function createDynamicPaymongoLink(
  amount: number,
  description: string,
  remarks: string,
  successUrl: string,
  idempotencyKey: string
): Promise<{ checkoutUrl: string; linkId: string }> {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) throw new Error("PAYMONGO_SECRET_KEY is not set");

  const encoded = Buffer.from(`${secretKey}:`).toString("base64");

  const res = await fetch("https://api.paymongo.com/v1/links", {
    method: "POST",
    headers: {
      Authorization: `Basic ${encoded}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount,
          description,
          remarks,
          redirect: { success: successUrl, failed: successUrl },
        },
      },
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    const detail = json?.errors?.[0]?.detail ?? "Unknown error";
    throw new Error(`PayMongo error: ${detail}`);
  }

  return {
    checkoutUrl: json.data.attributes.checkout_url as string,
    linkId: json.data.id as string,
  };
}
```

- [ ] **Step 5: Run to confirm pass, then full suite**

Run: `npm test -- lib/paymongo.test.ts && npm test && npx tsc --noEmit`

- [ ] **Step 6: Commit**

```bash
git add lib/paymongo.ts lib/paymongo.test.ts
git commit -m "feat: add createDynamicPaymongoLink for computed-amount purchases"
```

---

### Task 5: `POST /api/class/checkout` + webhook class-purchase branch

**Files:**
- Create: `app/api/class/checkout/route.ts`
- Create: `app/api/class/checkout/route.test.ts`
- Modify: `app/api/webhooks/paymongo/route.ts`
- Modify: `app/api/webhooks/paymongo/route.test.ts` (read first to match its exact mocking conventions)

**Interfaces:**
- Consumes: `generateClassCode` from `lib/classCode.ts` (Task 3), `createDynamicPaymongoLink` from `lib/paymongo.ts` (Task 4), `recordPayment`-style ledger insert pattern from `lib/payments.ts` (read, do not necessarily reuse verbatim since class purchases don't create a `subscriptions` row, they create a `classes` row).
- Produces: `POST /api/class/checkout` returns `{ checkoutUrl: string }` or `{ error: string }`. Webhook gains a class-purchase code path triggered by a `block:1` token in the link's `remarks`.

- [ ] **Step 1: Define the remarks format and write it down before coding**

Format: `block:1 year:<yearId> [subject:<subjectId>] seats:<n> rep:<repDeviceId>`. `subject:` is present only for scope `'subject'`; absent means scope `'all'`. This must be parsed by both the checkout route (to build it) and the webhook (to parse it) — keep the format in a comment in both files pointing at each other.

- [ ] **Step 2: Write the checkout route's failing test**

```ts
// app/api/class/checkout/route.test.ts
// Mirror app/api/subscribe/route.test.ts's cookie-mocking and
// createDynamicPaymongoLink-mocking pattern (read both referenced files first).
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("POST /api/class/checkout", () => {
  it("rejects seats below the 11 minimum", async () => {
    // body: { scope: 'subject', subjectId: SUBJ, yearId: YEAR, seats: 10 }
    // expect 400
  });

  it("computes the correct total for a subject-scope purchase at the 11-seat minimum", async () => {
    // seats: 11 -> amount passed to createDynamicPaymongoLink must be 79900 (₱799 in centavos)
  });

  it("computes the correct total for a subject-scope purchase above the minimum", async () => {
    // seats: 20 -> 799 + (20-11)*59 = 799 + 531 = 1330 pesos -> 133000 centavos
  });

  it("computes the correct total for an all-subjects purchase at the minimum", async () => {
    // scope: 'all', seats: 11 -> 99900 centavos (₱999)
  });

  it("rejects scope='subject' with no subjectId", async () => {
    // expect 400
  });

  it("trusts only the signed device cookie for repDeviceId, never a client-supplied value", async () => {
    // assert the remarks/rep field passed to createDynamicPaymongoLink matches
    // the cookie-derived device id, not any deviceId in the request body
  });

  it("returns the checkoutUrl from createDynamicPaymongoLink on success", async () => {
    // expect 200 { checkoutUrl }
  });
});
```

- [ ] **Step 3: Run to confirm failure**

Run: `npm test -- app/api/class/checkout/route.test.ts`
Expected: FAIL (route doesn't exist).

- [ ] **Step 4: Implement the checkout route**

```ts
// app/api/class/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { createDynamicPaymongoLink, SEMESTER_END } from "@/lib/paymongo";
import { isUuid } from "@/lib/validation";
import crypto from "crypto";

const BASE_SUBJECT_CENTAVOS = 79900; // ₱799
const BASE_ALL_CENTAVOS = 99900;     // ₱999
const PER_SEAT_CENTAVOS = 5900;      // ₱59
const INCLUDED_SEATS = 11;
const MIN_SEATS = 11;

function computeAmount(scope: "subject" | "all", seats: number): number {
  const base = scope === "all" ? BASE_ALL_CENTAVOS : BASE_SUBJECT_CENTAVOS;
  const extra = Math.max(0, seats - INCLUDED_SEATS);
  return base + extra * PER_SEAT_CENTAVOS;
}

export async function POST(req: NextRequest) {
  const jar = await cookies();
  const repDeviceId = verifyDeviceCookie(jar.get(DEVICE_COOKIE)?.value);
  if (!repDeviceId) {
    return NextResponse.json({ error: "no_device" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    scope?: string; subjectId?: string; yearId?: string; seats?: number;
  } | null;
  const scope = body?.scope === "all" ? "all" : body?.scope === "subject" ? "subject" : null;
  const { subjectId, yearId, seats } = body ?? {};

  if (!scope || !isUuid(yearId) || typeof seats !== "number" || seats < MIN_SEATS) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  if (scope === "subject" && !isUuid(subjectId)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const amount = computeAmount(scope, seats);
  const description =
    scope === "all"
      ? "BSIT Survival Kit — Class block (all subjects, semester)"
      : "BSIT Survival Kit — Class block (1 subject, semester)";

  // remarks format: "block:1 year:<id> [subject:<id>] seats:<n> rep:<deviceId>"
  // Parsed by app/api/webhooks/paymongo/route.ts's class-purchase branch.
  let remarks = `block:1 year:${yearId}`;
  if (scope === "subject") remarks += ` subject:${subjectId}`;
  remarks += ` seats:${seats} rep:${repDeviceId}`;

  const idempotencyKey = crypto
    .createHash("sha256")
    .update(`class-checkout:${repDeviceId}:${yearId}:${subjectId ?? "all"}:${seats}`)
    .digest("hex");

  const origin = req.nextUrl.origin;
  const successUrl = `${origin}/for-blocks?payment=success`;

  try {
    const { checkoutUrl } = await createDynamicPaymongoLink(
      amount,
      description,
      remarks,
      successUrl,
      idempotencyKey
    );
    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 5: Run checkout route tests to confirm pass**

Run: `npm test -- app/api/class/checkout/route.test.ts`
Expected: PASS.

- [ ] **Step 6: Write the webhook's failing test for the class-purchase branch**

Read `app/api/webhooks/paymongo/route.test.ts` in full first to match its exact event-payload-construction helpers, then add:

```ts
describe("POST /api/webhooks/paymongo - class purchase branch", () => {
  it("creates a classes row and a payments row when remarks contain block:1", async () => {
    // remarks: "block:1 year:<YEAR> subject:<SUBJ> seats:15 rep:<REP_DEVICE>"
    // paidAmount matching computeAmount('subject', 15) = 79900 + 4*5900 = 103500
    // Assert: payments insert called with device_id=REP_DEVICE, amount=paidAmount
    // Assert: classes insert called with subject_id=SUBJ, year_id=YEAR,
    //   rep_device_id=REP_DEVICE, seat_cap=15, status='active',
    //   current_period_end matching SEMESTER_END, paymongo_link_id=the real linkId
    //   (NOT a 'block-<uuid>' placeholder this time — that convention was only
    //   for the deprecated manual-grant path)
    // Assert response includes the generated code (200 { ok: true } is fine if
    // the code doesn't need to be returned to PayMongo — the rep sees it via
    // their dashboard after redirect, not from the webhook response directly)
  });

  it("creates a classes row with subject_id null for an all-subjects purchase", async () => {
    // remarks without a "subject:" token -> subject_id inserted as null
  });

  it("rejects underpayment: paidAmount less than the recomputed expected amount", async () => {
    // paidAmount below computeAmount(scope, seats) for the parsed seats -> 400,
    // no classes row created
  });

  it("retries code generation on a unique-constraint collision, mirroring grant-class's existing retry logic", async () => {
    // first insert attempt returns a 23505 on the classes.code unique index,
    // second attempt succeeds
  });
});
```

- [ ] **Step 7: Run to confirm failure**

Run: `npm test -- app/api/webhooks/paymongo/route.test.ts`
Expected: FAIL for the new tests (existing tests must still pass — this is an additive branch).

- [ ] **Step 8: Implement the webhook branch**

Read the full current `app/api/webhooks/paymongo/route.ts` before editing (already reviewed above — the file ends after the existing `recordPayment` call and `return NextResponse.json({ ok: true })`). Add a class-purchase branch that runs **instead of** the existing device-subscription logic when `remarks` contains a `block:1` token, checked immediately after parsing `remarks` and before the existing `parseLinkRemarks`/`resolvePlan` calls (which assume a `PLANS`-keyed purchase and would misparse a class purchase's dynamic amount):

```ts
// New parsing block, placed after `const remarks = resource.attributes.remarks ?? "";`
// and before the existing `const parsed = parseLinkRemarks(remarks);` call.
const classMatch = remarks.match(/^block:1 year:([^\s]+)(?: subject:([^\s]+))? seats:(\d+) rep:([^\s]+)/);
if (classMatch) {
  const [, classYearId, classSubjectId, seatsStr, repDeviceId] = classMatch;
  const seats = parseInt(seatsStr, 10);

  if (!isUuid(classYearId) || (classSubjectId && !isUuid(classSubjectId))) {
    return NextResponse.json({ error: "Malformed remarks" }, { status: 400 });
  }
  if (typeof paidStatus !== "string" || paidStatus !== "paid") {
    return NextResponse.json({ ok: true, ignored: "status" });
  }

  // Recompute the expected amount server-side — never trust the client's
  // declared seat count without verifying the paid amount matches it.
  const BASE_SUBJECT_CENTAVOS = 79900, BASE_ALL_CENTAVOS = 99900, PER_SEAT_CENTAVOS = 5900, INCLUDED_SEATS = 11;
  const base = classSubjectId ? BASE_SUBJECT_CENTAVOS : BASE_ALL_CENTAVOS;
  const expectedAmount = base + Math.max(0, seats - INCLUDED_SEATS) * PER_SEAT_CENTAVOS;
  if (typeof paidAmount !== "number" || paidAmount < expectedAmount) {
    console.error(`Class webhook underpayment: got ${paidAmount}, expected >= ${expectedAmount}`);
    return NextResponse.json({ error: "Amount too low" }, { status: 400 });
  }

  const supabase = createServerClient();
  const paidAtSeconds = resource.attributes.paid_at;
  const paidAt = typeof paidAtSeconds === "number" ? new Date(paidAtSeconds * 1000) : new Date();

  // Ledger row first — never grant access without a recorded payment,
  // mirroring recordPayment's invariant in lib/payments.ts.
  const { error: paymentError } = await supabase.from("payments").insert({
    paymongo_link_id: linkId,
    device_id: repDeviceId,
    year_id: classYearId,
    subject_id: classSubjectId ?? null,
    amount: paidAmount,
    currency: "PHP",
    paid_at: paidAt.toISOString(),
  });
  if (paymentError) {
    if ((paymentError as { code?: string }).code === "23505") {
      return NextResponse.json({ ok: true, deduped: true });
    }
    console.error("Class payment insert failed:", paymentError.message);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  let code = generateClassCode();
  let created = false;
  for (let attempt = 0; attempt < 5 && !created; attempt++) {
    const { error } = await supabase.from("classes").insert({
      code,
      name: "Untitled class", // rep can rename later if a rename feature ships; not in this plan's scope
      subject_id: classSubjectId ?? null,
      year_id: classYearId,
      rep_device_id: repDeviceId,
      seat_cap: seats,
      status: "active",
      current_period_end: SEMESTER_END.toISOString(),
      paymongo_link_id: linkId,
    });
    if (error?.code === "23505") { code = generateClassCode(); continue; }
    if (error) {
      console.error("Class insert failed:", error.message);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
    created = true;
  }
  if (!created) {
    return NextResponse.json({ error: "Could not generate a unique class code" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

Add the import `import { generateClassCode } from "@/lib/classCode";` at the top of the file.

- [ ] **Step 9: Run webhook tests to confirm pass, then full suite**

Run: `npm test -- app/api/webhooks/paymongo/route.test.ts && npm test && npx tsc --noEmit`
Expected: all pass, including every pre-existing webhook test (the class branch must not alter the existing device-subscription code path at all).

- [ ] **Step 10: Commit**

```bash
git add app/api/class/checkout/route.ts app/api/class/checkout/route.test.ts app/api/webhooks/paymongo/route.ts app/api/webhooks/paymongo/route.test.ts
git commit -m "feat: add self-serve class checkout + webhook class-purchase branch"
```

---

### Task 6: Join-request submission + polling endpoints

**Files:**
- Create: `app/api/class/[code]/request/route.ts`
- Create: `app/api/class/[code]/request/route.test.ts`
- Create: `app/api/class/[code]/request/status/route.ts`
- Create: `app/api/class/[code]/request/status/route.test.ts`

**Interfaces:**
- Consumes: `isValidClassCodeShape` from `lib/classCode.ts` (Task 3), `class_join_requests` table (Task 2).
- Produces: `POST /api/class/[code]/request` → `{ status: 'pending' | 'approved' }` or `{ error: string }`. `GET /api/class/[code]/request/status` → `{ status: 'pending' | 'approved' | 'rejected' | 'none' }`.

- [ ] **Step 1: Write the failing tests for the request-submission route**

```ts
// app/api/class/[code]/request/route.test.ts
// Mirror app/api/class/join/route.test.ts's cookie-mocking and rate-limiter
// test patterns (read that file first — it's the direct predecessor of this
// route and already solved the IP-per-test isolation issue this file will
// also need).
import { describe, it, expect } from "vitest";

describe("POST /api/class/[code]/request", () => {
  it("rejects when no device cookie is present", async () => {
    // expect 401
  });

  it("rejects a malformed code (wrong shape / wildcard characters)", async () => {
    // expect 400, using isValidClassCodeShape — never reaches the DB
  });

  it("returns not_found for a code with no matching class", async () => {
    // expect 404
  });

  it("returns not_found for an expired or inactive class", async () => {
    // expect 404
  });

  it("creates a pending request and returns { status: 'pending' } for a new device", async () => {
    // expect 200 { status: 'pending' }
  });

  it("returns { status: 'approved' } immediately if this device already has an approved request", async () => {
    // no new insert; existing approved row is enough
  });

  it("resets a previously-rejected request back to pending on resubmission", async () => {
    // upsert on (class_id, device_id) conflict updates status back to 'pending'
  });

  it("is rate-limited per IP, matching the existing class/join endpoint's threshold", async () => {
    // reuse createRateLimiter/getClientIp from lib/rateLimit.ts
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test -- "app/api/class/[code]/request/route.test.ts"`
Expected: FAIL.

- [ ] **Step 3: Implement the request-submission route**

```ts
// app/api/class/[code]/request/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { createServerClient } from "@/lib/supabase/server";
import { createRateLimiter, getClientIp } from "@/lib/rateLimit";
import { isValidClassCodeShape } from "@/lib/classCode";

// Mirrors app/api/class/join/route.ts's rate-limit reasoning: this is the
// only throttle standing between a 6-char code (887M-combination space,
// Math.random-generated) and brute-force guessing. Do not remove or weaken.
const limiter = createRateLimiter(10);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  if (limiter.check(getClientIp(req))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const jar = await cookies();
  const deviceId = verifyDeviceCookie(jar.get(DEVICE_COOKIE)?.value);
  if (!deviceId) {
    return NextResponse.json({ error: "no_device" }, { status: 401 });
  }

  const { code: rawCode } = await params;
  const code = rawCode.trim().toUpperCase();
  if (!isValidClassCodeShape(code)) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: cls } = await supabase
    .from("classes")
    .select("id, status, current_period_end")
    .eq("code", code)
    .maybeSingle();

  if (!cls || cls.status !== "active" || new Date(cls.current_period_end) < new Date()) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Check for an existing request first so an already-approved device skips
  // straight to 'approved' without creating a duplicate pending row.
  const { data: existing } = await supabase
    .from("class_join_requests")
    .select("status")
    .eq("class_id", cls.id)
    .eq("device_id", deviceId)
    .maybeSingle();

  if (existing?.status === "approved") {
    return NextResponse.json({ status: "approved" });
  }

  const { error } = await supabase
    .from("class_join_requests")
    .upsert(
      { class_id: cls.id, device_id: deviceId, status: "pending", decided_at: null },
      { onConflict: "class_id,device_id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: "pending" });
}
```

- [ ] **Step 4: Run to confirm pass**

Run: `npm test -- "app/api/class/[code]/request/route.test.ts"`
Expected: PASS.

- [ ] **Step 5: Write the failing tests for the polling/status route**

```ts
// app/api/class/[code]/request/status/route.test.ts
describe("GET /api/class/[code]/request/status", () => {
  it("returns 'none' when this device has no request for the class", async () => {});
  it("returns 'pending' when a request is awaiting approval", async () => {});
  it("returns 'approved' once the rep has approved it", async () => {});
  it("returns 'rejected' when the rep rejected it", async () => {});
  it("returns 'none' for a nonexistent class code (never leaks whether a code exists via a different status)", async () => {});
});
```

- [ ] **Step 6: Run to confirm failure, then implement**

```ts
// app/api/class/[code]/request/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { createServerClient } from "@/lib/supabase/server";
import { isValidClassCodeShape } from "@/lib/classCode";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const jar = await cookies();
  const deviceId = verifyDeviceCookie(jar.get(DEVICE_COOKIE)?.value);
  if (!deviceId) {
    return NextResponse.json({ status: "none" });
  }

  const { code: rawCode } = await params;
  const code = rawCode.trim().toUpperCase();
  if (!isValidClassCodeShape(code)) {
    return NextResponse.json({ status: "none" });
  }

  const supabase = createServerClient();
  const { data: cls } = await supabase
    .from("classes")
    .select("id")
    .eq("code", code)
    .maybeSingle();

  if (!cls) return NextResponse.json({ status: "none" });

  const { data: reqRow } = await supabase
    .from("class_join_requests")
    .select("status")
    .eq("class_id", cls.id)
    .eq("device_id", deviceId)
    .maybeSingle();

  return NextResponse.json({ status: reqRow?.status ?? "none" });
}
```

Run: `npm test -- "app/api/class/[code]/request/status/route.test.ts"`
Expected: PASS.

- [ ] **Step 7: Full suite + commit**

Run: `npm test && npx tsc --noEmit`

```bash
git add "app/api/class/[code]/request/route.ts" "app/api/class/[code]/request/route.test.ts" "app/api/class/[code]/request/status/route.ts" "app/api/class/[code]/request/status/route.test.ts"
git commit -m "feat: add classmate join-request submission and polling endpoints"
```

---

### Task 7: Rep dashboard data + approve/reject endpoints

**Files:**
- Create: `app/api/class/[code]/rep/route.ts`
- Create: `app/api/class/[code]/rep/route.test.ts`
- Create: `app/api/class/[code]/rep/decide/route.ts`
- Create: `app/api/class/[code]/rep/decide/route.test.ts`

**Interfaces:**
- Consumes: `classes`, `class_members`, `class_join_requests`, `module_progress`, `modules` tables. `isValidClassCodeShape` from `lib/classCode.ts`.
- Produces: `GET /api/class/[code]/rep` → `{ summary: { seatsFilled, seatCap, expiresAt, subjectId, yearId, scope }, pending: [{ id, createdAt }], roster: [{ ordinal, completed, total }] }`. `POST /api/class/[code]/rep/decide` → `{ ok: true }` or `{ error: string }`.

- [ ] **Step 1: Write the failing tests for the dashboard data route**

```ts
// app/api/class/[code]/rep/route.test.ts
describe("GET /api/class/[code]/rep", () => {
  it("rejects when the calling device is not the class's rep_device_id", async () => {
    // expect 401/403 — device cookie present but doesn't match rep_device_id
  });

  it("returns summary, pending requests, and roster with progress for the real rep device", async () => {
    // expect 200 with the shape above; roster entries have completed/total
    // computed from module_progress joined against modules for the class's subject
  });

  it("computes roster progress across ALL subjects in the year when subject_id is null", async () => {
    // all-subjects class case
  });

  it("orders the roster by class_members.joined_at ascending (Classmate 1 = first joiner)", async () => {});

  it("never exposes a classmate's raw device_id in the response", async () => {
    // assert no field in any roster entry matches a device_id pattern
  });
});
```

- [ ] **Step 2: Run to confirm failure, then implement**

```ts
// app/api/class/[code]/rep/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { createServerClient } from "@/lib/supabase/server";
import { isValidClassCodeShape } from "@/lib/classCode";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const jar = await cookies();
  const deviceId = verifyDeviceCookie(jar.get(DEVICE_COOKIE)?.value);
  if (!deviceId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { code: rawCode } = await params;
  const code = rawCode.trim().toUpperCase();
  if (!isValidClassCodeShape(code)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const supabase = createServerClient();
  const { data: cls } = await supabase
    .from("classes")
    .select("id, subject_id, year_id, seat_cap, current_period_end, rep_device_id")
    .eq("code", code)
    .maybeSingle();

  if (!cls) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (cls.rep_device_id !== deviceId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: members } = await supabase
    .from("class_members")
    .select("device_id, joined_at")
    .eq("class_id", cls.id)
    .order("joined_at", { ascending: true });

  const { data: pending } = await supabase
    .from("class_join_requests")
    .select("id, created_at")
    .eq("class_id", cls.id)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  // Total module count: scoped to one subject, or every subject in the year
  // if this is an all-subjects class (subject_id IS NULL).
  const modulesQuery = cls.subject_id
    ? supabase.from("modules").select("id").eq("subject_id", cls.subject_id)
    : supabase.from("modules").select("id, subjects!inner(year_id)").eq("subjects.year_id", cls.year_id);
  const { data: allModules } = await modulesQuery;
  const totalModules = allModules?.length ?? 0;
  const moduleIds = new Set((allModules ?? []).map((m: { id: string }) => m.id));

  const roster = await Promise.all(
    (members ?? []).map(async (m: { device_id: string; joined_at: string }, idx: number) => {
      const { data: progressRows } = await supabase
        .from("module_progress")
        .select("module_id")
        .eq("device_id", m.device_id);
      const completed = (progressRows ?? []).filter((p: { module_id: string }) =>
        moduleIds.has(p.module_id)
      ).length;
      return { ordinal: idx + 1, completed, total: totalModules };
    })
  );

  return NextResponse.json({
    summary: {
      seatsFilled: members?.length ?? 0,
      seatCap: cls.seat_cap,
      expiresAt: cls.current_period_end,
      subjectId: cls.subject_id,
      yearId: cls.year_id,
      scope: cls.subject_id ? "subject" : "all",
    },
    pending: (pending ?? []).map((p: { id: string; created_at: string }) => ({
      id: p.id,
      createdAt: p.created_at,
    })),
    roster,
  });
}
```

Note on the roster N+1 query loop: acceptable for v1 given class sizes (≤~55 members per the pricing model's practical range), but flag in the task's self-review as a candidate for a single batched query (`module_progress.device_id IN (...)`) if dashboard load times become a real issue — do not prematurely optimize this in the same task, per YAGNI, but do leave the note.

Run: `npm test -- "app/api/class/[code]/rep/route.test.ts"`
Expected: PASS.

- [ ] **Step 3: Write the failing tests for the approve/reject route**

```ts
// app/api/class/[code]/rep/decide/route.test.ts
describe("POST /api/class/[code]/rep/decide", () => {
  it("rejects when the calling device is not the rep", async () => {});

  it("approves a pending request: flips status, creates a class_members row", async () => {});

  it("rejects a pending request: flips status, does NOT create a class_members row", async () => {});

  it("maps a seat_cap-trigger P0001 error on approval to a clear 409 'full' response", async () => {
    // mirrors the exact P0001-handling pattern from the prior iteration's
    // app/api/class/join/route.ts — read that file for the exact mapping code
  });

  it("returns 404 for a requestId that doesn't belong to this class", async () => {});
});
```

- [ ] **Step 4: Run to confirm failure, then implement**

```ts
// app/api/class/[code]/rep/decide/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { createServerClient } from "@/lib/supabase/server";
import { isValidClassCodeShape } from "@/lib/classCode";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const jar = await cookies();
  const deviceId = verifyDeviceCookie(jar.get(DEVICE_COOKIE)?.value);
  if (!deviceId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { code: rawCode } = await params;
  const code = rawCode.trim().toUpperCase();
  if (!isValidClassCodeShape(code)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as
    | { requestId?: string; decision?: string }
    | null;
  const { requestId, decision } = body ?? {};
  if (!requestId || (decision !== "approve" && decision !== "reject")) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: cls } = await supabase
    .from("classes")
    .select("id, rep_device_id")
    .eq("code", code)
    .maybeSingle();

  if (!cls) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (cls.rep_device_id !== deviceId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: reqRow } = await supabase
    .from("class_join_requests")
    .select("id, device_id, status")
    .eq("id", requestId)
    .eq("class_id", cls.id)
    .maybeSingle();

  if (!reqRow) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (decision === "reject") {
    const { error } = await supabase
      .from("class_join_requests")
      .update({ status: "rejected", decided_at: new Date().toISOString() })
      .eq("id", requestId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Approve: create the class_members row. The class_members_seat_cap_trigger
  // (supabase/migrations/20260716010000_class_members_seat_cap_trigger.sql)
  // enforces the cap here, same as the prior iteration's join endpoint did —
  // map its P0001 error to a clear 409, not a generic 500.
  const { error: memberError } = await supabase
    .from("class_members")
    .upsert({ class_id: cls.id, device_id: reqRow.device_id }, { onConflict: "class_id,device_id" });

  if (memberError) {
    if ((memberError as { code?: string }).code === "P0001") {
      return NextResponse.json({ error: "full" }, { status: 409 });
    }
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  const { error: statusError } = await supabase
    .from("class_join_requests")
    .update({ status: "approved", decided_at: new Date().toISOString() })
    .eq("id", requestId);
  if (statusError) return NextResponse.json({ error: statusError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
```

Run: `npm test -- "app/api/class/[code]/rep/decide/route.test.ts"`
Expected: PASS.

- [ ] **Step 5: Full suite + commit**

Run: `npm test && npx tsc --noEmit`

```bash
git add "app/api/class/[code]/rep/route.ts" "app/api/class/[code]/rep/route.test.ts" "app/api/class/[code]/rep/decide/route.ts" "app/api/class/[code]/rep/decide/route.test.ts"
git commit -m "feat: add rep dashboard data endpoint and approve/reject decision endpoint"
```

---

### Task 8: Rewrite `/for-blocks` as the live checkout page

**Files:**
- Modify: `app/(main)/for-blocks/page.tsx` (rewrite to a client component)

**Interfaces:**
- Consumes: `POST /api/class/checkout` (Task 5).
- Produces: no exports consumed elsewhere — this is a leaf page.

- [ ] **Step 1: Read the current file in full** (already reviewed above — static server component with a placeholder Messenger link) and the confirmed mockup behavior: scope toggle (1 Subject / All Subjects) + seat slider (11–55+) with live-recomputed total, styled with the app's real design tokens (`bg-paper`, `text-ink`, `font-serif`, `label-sm` — NOT the mockup's raw hex/Georgia styling, which was only for the throwaway browser preview).

- [ ] **Step 2: Rewrite the page**

```tsx
// app/(main)/for-blocks/page.tsx
"use client";

import { useMemo, useState } from "react";
import { BackLink } from "@/components/BackLink";
import { getDeviceId } from "@/lib/device";

const BASE_SUBJECT = 799;
const BASE_ALL = 999;
const PER_SEAT = 59;
const INCLUDED_SEATS = 11;
const MIN_SEATS = 11;
const MAX_SEATS = 55;

export default function ForBlocksPage() {
  const [scope, setScope] = useState<"subject" | "all">("subject");
  const [seats, setSeats] = useState(INCLUDED_SEATS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { base, extra, total, perHead } = useMemo(() => {
    const base = scope === "all" ? BASE_ALL : BASE_SUBJECT;
    const extraSeats = Math.max(0, seats - INCLUDED_SEATS);
    const extraCost = extraSeats * PER_SEAT;
    const total = base + extraCost;
    return { base, extra: extraCost, total, perHead: total / seats };
  }, [scope, seats]);

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      getDeviceId(); // ensures the signed device cookie exists before checkout
      // NOTE: subjectId selection UI is not built in this task — this plan's
      // scope is the pricing/checkout mechanics. A subject picker must be
      // added here (or on a preceding step) before this page is fully
      // functional for scope='subject'; flag this as a follow-up if not
      // completed inline.
      const res = await fetch("/api/class/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, seats }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-12 md:px-16 md:py-20">
      <div className="max-w-md mx-auto">
        <BackLink href="/" label="Back to home" className="text-ink-muted hover:text-ink mb-10" />

        <p className="label-sm mb-4">For Class Representatives</p>
        <h1 className="font-serif text-display-lg text-ink mb-6 leading-tight">
          Unlock a subject for your whole block
        </h1>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setScope("subject")}
            className={`flex-1 rounded-xl py-3 text-sm font-sans font-semibold transition-colors ${
              scope === "subject" ? "bg-accent text-paper" : "border border-taupe/30 text-ink-muted"
            }`}
          >
            1 Subject
          </button>
          <button
            onClick={() => setScope("all")}
            className={`flex-1 rounded-xl py-3 text-sm font-sans font-semibold transition-colors ${
              scope === "all" ? "bg-accent text-paper" : "border border-taupe/30 text-ink-muted"
            }`}
          >
            All Subjects
          </button>
        </div>

        <div className="mb-7">
          <div className="flex justify-between text-sm font-sans text-ink-muted mb-2">
            <span>Expected classmates (incl. you)</span>
            <span className="text-ink font-semibold">{seats} people</span>
          </div>
          <input
            type="range"
            min={MIN_SEATS}
            max={MAX_SEATS}
            value={seats}
            onChange={(e) => setSeats(parseInt(e.target.value, 10))}
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-xs font-sans text-ink-faint mt-1">
            <span>{MIN_SEATS} (minimum)</span>
            <span>{MAX_SEATS}+</span>
          </div>
        </div>

        <div className="rounded-2xl border border-taupe/30 p-5 mb-6">
          <div className="flex justify-between text-sm font-sans text-ink-muted mb-1">
            <span>Base ({INCLUDED_SEATS} people)</span>
            <span>₱{base}</span>
          </div>
          <div className="flex justify-between text-sm font-sans text-ink-muted mb-3">
            <span>+{Math.max(0, seats - INCLUDED_SEATS)} extra × ₱{PER_SEAT}</span>
            <span>₱{extra}</span>
          </div>
          <div className="flex justify-between items-baseline border-t border-taupe/20 pt-3">
            <span className="font-sans text-sm text-ink">Total</span>
            <span className="font-serif text-3xl text-accent">₱{total.toLocaleString()}</span>
          </div>
          <p className="font-sans text-xs text-ink-faint mt-2">
            ≈ ₱{perHead.toFixed(1)}/person for the whole semester
          </p>
        </div>

        {error && <p className="font-sans text-sm text-red-500 mb-4">{error}</p>}

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full rounded-xl bg-accent px-4 py-4 font-sans font-semibold text-paper transition-opacity disabled:opacity-50 hover:opacity-90"
        >
          {loading ? "Redirecting…" : "Pay with GCash / Card →"}
        </button>
        <p className="font-sans text-xs text-ink-faint text-center mt-3">
          You&apos;ll get a shareable join link right after payment.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2a: Resolve the subject-picker gap flagged in the code comment above**

The checkout API (Task 5) requires a `subjectId` when `scope === 'subject'`, but this page as drafted doesn't collect one. Before this task is done, add a subject picker: either a `<select>` populated from a server-fetched subject list for a chosen year, or (simpler for v1) keep `/for-blocks` scoped to a single year context passed via query param (e.g. `/for-blocks?yearId=...`) and add a subject dropdown fed by that year's subjects. Resolve this concretely during implementation — do not ship Task 8 without it, since the page is non-functional for the 1-subject path otherwise.

- [ ] **Step 3: Manually verify in the browser**

Run: `npm run dev`, visit `/for-blocks`, confirm: scope toggle switches base price (799 ↔ 999), slider updates total live, clicking Pay calls `/api/class/checkout` and redirects to a real (or test-mode) PayMongo checkout URL.

- [ ] **Step 4: Commit**

```bash
git add "app/(main)/for-blocks/page.tsx"
git commit -m "feat: rewrite /for-blocks as a live self-serve checkout page"
```

---

### Task 9: Rewrite `/class/[code]/join` as the request+waiting page

**Files:**
- Create: `app/(main)/class/[code]/join/page.tsx`
- Remove: `app/(main)/class/join/page.tsx` (the old manual-code-entry page — no longer reachable once links carry the code directly; confirm nothing else links to `/class/join` before deleting, via `grep -rn "class/join" app/ components/`)

**Interfaces:**
- Consumes: `POST /api/class/[code]/request`, `GET /api/class/[code]/request/status` (Task 6).

- [ ] **Step 1: Confirm no other references to the old page**

Run: `grep -rn "class/join" app/ components/ --include="*.tsx"` (excluding the file being removed itself) — if any other page links to `/class/join`, update that link to the new pattern before deleting.

- [ ] **Step 2: Write the new page**

```tsx
// app/(main)/class/[code]/join/page.tsx
"use client";

import { useEffect, useRef, useState, use } from "react";
import { BackLink } from "@/components/BackLink";
import { getDeviceId } from "@/lib/device";

type ReqStatus = "idle" | "pending" | "approved" | "rejected" | "error";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40; // ~2 minutes — a rep approving is a human action, give it room

export default function ClassJoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [status, setStatus] = useState<ReqStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  function clearPoll() {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function startPolling() {
    if (pollRef.current !== null) return;
    pollCountRef.current = 0;
    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;
      try {
        const res = await fetch(`/api/class/${code}/request/status`);
        const data = await res.json();
        if (data.status === "approved") {
          clearPoll();
          setStatus("approved");
          return;
        }
        if (data.status === "rejected") {
          clearPoll();
          setStatus("rejected");
          return;
        }
      } catch {
        // swallow — keep polling
      }
      if (pollCountRef.current >= MAX_POLLS) {
        clearPoll();
        setError("Still waiting — check back in a bit, or ask your rep directly.");
      }
    }, POLL_INTERVAL_MS);
  }

  useEffect(() => () => clearPoll(), []);

  async function handleRequest() {
    getDeviceId();
    setError(null);
    try {
      const res = await fetch(`/api/class/${code}/request`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === "not_found" ? "That link doesn't match an active class."
          : data.error === "rate_limited" ? "Too many attempts. Try again in a minute."
          : "Something went wrong. Try again."
        );
        return;
      }
      if (data.status === "approved") {
        setStatus("approved");
      } else {
        setStatus("pending");
        startPolling();
      }
    } catch {
      setError("Something went wrong. Try again.");
    }
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-12 md:px-16 md:py-20">
      <div className="max-w-sm mx-auto text-center">
        <BackLink href="/" label="Back to home" className="text-ink-muted hover:text-ink mb-10" />

        {status === "idle" && (
          <>
            <p className="label-sm mb-4">Class Rep</p>
            <h1 className="font-serif text-display-md text-ink mb-3 leading-tight">Join your class</h1>
            <p className="font-sans text-sm text-ink-muted mb-8">
              Tap below to request to join — your class rep approves each classmate.
            </p>
            <button
              onClick={handleRequest}
              className="w-full rounded-xl bg-ink px-4 py-3 font-sans font-medium text-paper hover:opacity-90"
            >
              Request to join →
            </button>
          </>
        )}

        {status === "pending" && (
          <>
            <div className="mx-auto mb-6 h-14 w-14 rounded-full border-4 border-taupe/30 border-t-accent animate-spin" />
            <h1 className="font-serif text-display-md text-ink mb-2">Waiting for approval</h1>
            <p className="font-sans text-sm text-ink-muted">Your rep has been notified.</p>
          </>
        )}

        {status === "approved" && (
          <>
            <div className="mx-auto mb-6 h-14 w-14 rounded-full bg-accent flex items-center justify-center text-paper text-2xl">✓</div>
            <h1 className="font-serif text-display-md text-ink mb-2">You&apos;re in!</h1>
            <p className="font-sans text-sm text-ink-muted mb-6">Your subject is now unlocked.</p>
          </>
        )}

        {status === "rejected" && (
          <p className="font-sans text-sm text-ink-muted">
            Your request wasn&apos;t approved. Check with your class rep.
          </p>
        )}

        {error && <p className="mt-4 font-sans text-sm text-red-500">{error}</p>}
      </div>
    </main>
  );
}
```

Note: the "approved" state here doesn't redirect into a subject page the way the prior iteration's `join` route did, because this endpoint's response (Task 6) doesn't return `subjectId`/`yearId` — the join-request flow doesn't know which subject until the dashboard/class row is fetched. If immediate redirect-to-subject is wanted, extend `GET /api/class/[code]/request/status`'s response to include the class's `subjectId`/`yearId` (only when approved) and redirect the same way `SubscribeGate` does. Resolve this during implementation based on whether the founder wants that redirect in v1.

- [ ] **Step 3: Delete the old page**

```bash
git rm "app/(main)/class/join/page.tsx"
```

- [ ] **Step 4: Manually verify in the browser**

Run: `npm run dev`, visit `/class/ABCDEF/join` (any 6-char code, even a fake one, to see the "not found" error state), then test against a real class code created via Task 5's checkout flow end-to-end if a test PayMongo payment can be completed in dev.

- [ ] **Step 5: Full suite + commit**

Run: `npm test && npx tsc --noEmit`

```bash
git add "app/(main)/class/[code]/join/page.tsx"
git commit -m "feat: replace manual-code join page with request+approval flow"
```

---

### Task 10: Rep dashboard page

**Files:**
- Create: `app/(main)/class/[code]/rep/page.tsx`

**Interfaces:**
- Consumes: `GET /api/class/[code]/rep`, `POST /api/class/[code]/rep/decide` (Task 7).

- [ ] **Step 1: Write the page**, matching the confirmed mockup layout (summary stats row, pending-requests list with approve/reject buttons, roster with progress bars) but using the app's real design tokens instead of the mockup's throwaway hex styling:

```tsx
// app/(main)/class/[code]/rep/page.tsx
"use client";

import { useCallback, useEffect, useState, use } from "react";
import { BackLink } from "@/components/BackLink";

interface DashboardData {
  summary: { seatsFilled: number; seatCap: number; expiresAt: string; scope: "subject" | "all" };
  pending: { id: string; createdAt: string }[];
  roster: { ordinal: number; completed: number; total: number }[];
}

export default function RepDashboardPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deciding, setDeciding] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/class/${code}/rep`);
      if (!res.ok) {
        setError(res.status === 403 ? "This isn't your class dashboard." : "Class not found.");
        return;
      }
      setData(await res.json());
    } catch {
      setError("Something went wrong loading your dashboard.");
    }
  }, [code]);

  useEffect(() => { void load(); }, [load]);

  async function decide(requestId: string, decision: "approve" | "reject") {
    setDeciding(requestId);
    try {
      const res = await fetch(`/api/class/${code}/rep/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, decision }),
      });
      if (res.ok) await load();
    } finally {
      setDeciding(null);
    }
  }

  if (error) return <main className="min-h-screen bg-paper px-6 py-12"><p className="font-sans text-ink-muted">{error}</p></main>;
  if (!data) return null;

  return (
    <main className="min-h-screen bg-paper px-6 py-12 md:px-16 md:py-20">
      <div className="max-w-2xl mx-auto">
        <BackLink href="/" label="Back to home" className="text-ink-muted hover:text-ink mb-10" />
        <p className="label-sm mb-4">Class Rep Dashboard</p>
        <h1 className="font-serif text-display-lg text-ink mb-8">Your class</h1>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-xl border border-taupe/30 p-4">
            <p className="font-sans text-xs text-ink-faint mb-1">Seats filled</p>
            <p className="font-serif text-2xl text-ink">{data.summary.seatsFilled}<span className="text-sm text-ink-faint">/{data.summary.seatCap}</span></p>
          </div>
          <div className="rounded-xl border border-taupe/30 p-4">
            <p className="font-sans text-xs text-ink-faint mb-1">Class average</p>
            <p className="font-serif text-2xl text-accent">
              {data.roster.length > 0
                ? Math.round(
                    (data.roster.reduce((sum, r) => sum + (r.total ? r.completed / r.total : 0), 0) / data.roster.length) * 100
                  )
                : 0}%
            </p>
          </div>
          <div className="rounded-xl border border-taupe/30 p-4">
            <p className="font-sans text-xs text-ink-faint mb-1">Expires</p>
            <p className="font-serif text-lg text-ink">{new Date(data.summary.expiresAt).toLocaleDateString()}</p>
          </div>
        </div>

        {data.pending.length > 0 && (
          <div className="mb-8">
            <h3 className="font-sans text-sm uppercase tracking-wide text-ink-muted mb-3">
              Pending requests ({data.pending.length})
            </h3>
            <div className="space-y-2">
              {data.pending.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-taupe/20 px-4 py-3">
                  <span className="font-sans text-sm text-ink-muted">
                    Request · {new Date(p.createdAt).toLocaleTimeString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={deciding === p.id}
                      onClick={() => decide(p.id, "approve")}
                      className="rounded-lg bg-accent px-3 py-1.5 text-xs font-sans font-semibold text-paper disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      disabled={deciding === p.id}
                      onClick={() => decide(p.id, "reject")}
                      className="rounded-lg border border-taupe/30 px-3 py-1.5 text-xs font-sans text-ink-muted disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="font-sans text-sm uppercase tracking-wide text-ink-muted mb-3">
            Roster ({data.roster.length})
          </h3>
          <div className="space-y-2">
            {data.roster.map((r) => {
              const pct = r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0;
              return (
                <div key={r.ordinal} className="flex items-center gap-3 text-sm font-sans">
                  <span className="w-24 shrink-0 text-ink-faint">Classmate {r.ordinal}</span>
                  <div className="flex-1 h-2 rounded-full bg-taupe/20 overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right text-ink-muted">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Manually verify in the browser**

Run: `npm run dev`, visit `/class/<real-code>/rep` from the device that made the purchase (confirm 403 from a different device's cookie), approve/reject a test join request, confirm roster/summary update after approval.

- [ ] **Step 3: Commit**

```bash
git add "app/(main)/class/[code]/rep/page.tsx"
git commit -m "feat: add rep dashboard page with pending requests and roster progress"
```

---

## Self-Review Notes

- **Spec coverage:** Every confirmed decision in `docs/superpowers/specs/2026-07-16-self-serve-class-rep-design.md` maps to a task: pricing formula → Task 5/8, slider UX → Task 8, join-request+polling → Task 6/9, dashboard-only notification (no task needed, it's an absence), device-bound rep auth → Task 7's `rep_device_id` check, dashboard content (stats/pending/roster) → Task 7/10.
- **Pre-existing bug found and fixed:** Task 1 addresses a real gap in the already-merged `isSubscribed` class-membership branch that would have silently broken the spec's "all subjects" scope — found by reading the current code during plan-writing, not assumed.
- **Placeholder scan:** Two spots intentionally flagged as "resolve during implementation, not a placeholder to leave in": Task 8's subject-picker UI (a genuine open UX question — single-year context vs. dropdown — deferred to implementation judgment per the spec's own "open implementation questions" section) and Task 9's redirect-on-approval behavior (depends on extending Task 6's status endpoint, a small scope call left to the implementer). Both are flagged with concrete next steps, not vague TODOs.
- **Type/interface consistency:** `classes.subject_id: string | null` used consistently across Tasks 1, 5, 7. `class_join_requests.status: 'pending'|'approved'|'rejected'` consistent across Tasks 2, 6, 7. Remarks format `block:1 year:<id> [subject:<id>] seats:<n> rep:<id>` defined once in Task 5 and referenced (not redefined) in Task 5's own webhook step.
- **Removed the old manual-grant path?** No — per the spec, `POST /api/admin/grant-class` and its test file stay in place, untouched, as a manual override. This plan only unlinks the old `/class/join` manual-code page (Task 9), which was Task 4's UI from the prior iteration, not the admin route.
