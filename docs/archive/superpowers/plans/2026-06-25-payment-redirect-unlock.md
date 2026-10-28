# Payment Redirect-Unlock Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make in-app Subscribe-button payments auto-unlock the activity on return from PayMongo, and remove the static-QR "I already paid" path.

**Architecture:** `SubscribeGate` sends its current module path to `/api/subscribe`. A new pure helper validates that path against the module-route shape (and confirms its year/subject match what is being paid for), then the route builds a `successUrl` ending in `?payment=success`. PayMongo redirects the payer back to that exact module page; `SubscribeGate` already auto-polls `/api/subscription-status` when it sees `?payment=success`, so the activity unlocks in place. No backend payment logic and no DB migration change.

**Tech Stack:** Next.js App Router (route handlers), TypeScript, Vitest, Supabase (unchanged here).

## Global Constraints

- Test runner: `npm test` (vitest run). Watch: `npm run test:watch`.
- UUID validation MUST use the existing `isUuid` helper from `lib/validation.ts` — do not hand-roll UUID regexes.
- Allowed redirect origins are the existing `ALLOWED_ORIGINS` in `app/api/subscribe/route.ts` (`https://survival-kit-app.vercel.app`, `http://localhost:3000`). Never redirect to a free-form or external origin.
- Commits: NO `Co-Authored-By` trailer; lauurnce is sole contributor (per CLAUDE.md).
- Do NOT modify: `lib/payments.ts`, `app/api/webhooks/paymongo/route.ts`, `lib/subscriptions.ts`, `lib/auth/claim.ts`, or any migration — these are already correct and verified against the live DB.

---

## File Structure

- **Create** `lib/subscribeRedirect.ts` — pure helper `buildSuccessUrl(...)` that validates an optional `returnPath` and returns the success URL. No I/O, fully unit-testable.
- **Create** `lib/subscribeRedirect.test.ts` — unit tests for the helper.
- **Modify** `app/api/subscribe/route.ts` — read optional `returnPath` from the body, call `buildSuccessUrl`, pass result as `successUrl`.
- **Modify** `components/SubscribeGate.tsx` — send `returnPath: window.location.pathname` in the POST body; remove the "I already paid" button + comment; soften the poll-timeout message.

---

### Task 1: `buildSuccessUrl` redirect helper

**Files:**
- Create: `lib/subscribeRedirect.ts`
- Test: `lib/subscribeRedirect.test.ts`

**Interfaces:**
- Consumes: `isUuid` from `lib/validation.ts`.
- Produces:
  ```ts
  export function buildSuccessUrl(params: {
    origin: string;        // already validated against ALLOWED_ORIGINS by caller
    yearId: string;        // validated UUID (the plan's year)
    subjectId: string | null; // validated UUID or null (the plan's subject)
    returnPath?: string | null; // untrusted; e.g. "/year/<uuid>/subjects/<uuid>/modules/<uuid>"
  }): string;
  ```
  Behavior: if `returnPath` is a string of the exact shape
  `/year/<uuid>/subjects/<uuid>/modules/<uuid>` AND its year segment === `yearId`
  AND (when `subjectId` is non-null) its subject segment === `subjectId`,
  return `${origin}${returnPath}?payment=success`.
  Otherwise return the fallback `${origin}/year/${yearId}/subjects?payment=success`.

- [ ] **Step 1: Write the failing tests**

```ts
// lib/subscribeRedirect.test.ts
import { describe, it, expect } from "vitest";
import { buildSuccessUrl } from "./subscribeRedirect";

const ORIGIN = "https://survival-kit-app.vercel.app";
const YEAR = "11111111-1111-1111-1111-111111111111";
const SUBJECT = "22222222-2222-2222-2222-222222222222";
const MODULE = "33333333-3333-3333-3333-333333333333";
const validPath = `/year/${YEAR}/subjects/${SUBJECT}/modules/${MODULE}`;
const fallback = `${ORIGIN}/year/${YEAR}/subjects?payment=success`;

describe("buildSuccessUrl", () => {
  it("returns the module path with ?payment=success for a valid matching subject-plan path", () => {
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: validPath })
    ).toBe(`${ORIGIN}${validPath}?payment=success`);
  });

  it("returns the module path for a year-plan (subjectId null) when the year matches", () => {
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: null, returnPath: validPath })
    ).toBe(`${ORIGIN}${validPath}?payment=success`);
  });

  it("falls back when returnPath is missing", () => {
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: null })
    ).toBe(fallback);
  });

  it("falls back when the year segment does not match the paid year", () => {
    const otherYear = "99999999-9999-9999-9999-999999999999";
    const path = `/year/${otherYear}/subjects/${SUBJECT}/modules/${MODULE}`;
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: path })
    ).toBe(fallback);
  });

  it("falls back when the subject segment does not match the paid subject", () => {
    const otherSubject = "44444444-4444-4444-4444-444444444444";
    const path = `/year/${YEAR}/subjects/${otherSubject}/modules/${MODULE}`;
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: path })
    ).toBe(fallback);
  });

  it("falls back for a non-module path", () => {
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: "/admin" })
    ).toBe(fallback);
  });

  it("falls back for a protocol-relative open-redirect attempt", () => {
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: "//evil.com" })
    ).toBe(fallback);
  });

  it("falls back when a segment is a non-UUID", () => {
    const path = `/year/${YEAR}/subjects/not-a-uuid/modules/${MODULE}`;
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: null, returnPath: path })
    ).toBe(fallback);
  });

  it("falls back for a path with extra trailing segments", () => {
    const path = `${validPath}/extra`;
    expect(
      buildSuccessUrl({ origin: ORIGIN, yearId: YEAR, subjectId: SUBJECT, returnPath: path })
    ).toBe(fallback);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- lib/subscribeRedirect.test.ts`
Expected: FAIL — `buildSuccessUrl` is not defined / module not found.

- [ ] **Step 3: Write the minimal implementation**

```ts
// lib/subscribeRedirect.ts
import { isUuid } from "./validation";

interface BuildSuccessUrlParams {
  origin: string;
  yearId: string;
  subjectId: string | null;
  returnPath?: string | null;
}

// Build the post-payment redirect URL. Returns the exact module page the payer
// came from (so the SubscribeGate there can auto-poll and unlock in place),
// but ONLY if returnPath is a well-formed module route whose year/subject match
// the plan being purchased. Anything else falls back to the subjects list. This
// prevents open-redirects and stops a payer from returning to content they did
// not pay for. The ?payment=success marker is what triggers SubscribeGate's poll.
export function buildSuccessUrl({
  origin,
  yearId,
  subjectId,
  returnPath,
}: BuildSuccessUrlParams): string {
  const fallback = `${origin}/year/${yearId}/subjects?payment=success`;
  if (typeof returnPath !== "string") return fallback;

  // Expect exactly: ["", "year", <uuid>, "subjects", <uuid>, "modules", <uuid>]
  const parts = returnPath.split("/");
  if (parts.length !== 7) return fallback;
  const [empty, yearKw, pathYear, subjectsKw, pathSubject, modulesKw, pathModule] = parts;
  if (empty !== "" || yearKw !== "year" || subjectsKw !== "subjects" || modulesKw !== "modules") {
    return fallback;
  }
  if (!isUuid(pathYear) || !isUuid(pathSubject) || !isUuid(pathModule)) return fallback;

  // Year must match the purchased plan.
  if (pathYear !== yearId) return fallback;
  // For a subject plan, the subject must match too. (Year plans unlock the whole
  // year, so any subject under the matching year is fine.)
  if (subjectId !== null && pathSubject !== subjectId) return fallback;

  return `${origin}${returnPath}?payment=success`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- lib/subscribeRedirect.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/subscribeRedirect.ts lib/subscribeRedirect.test.ts
git commit -m "feat(payments): add buildSuccessUrl redirect helper with allowlist validation"
```

---

### Task 2: Wire `returnPath` through `/api/subscribe`

**Files:**
- Modify: `app/api/subscribe/route.ts`

**Interfaces:**
- Consumes: `buildSuccessUrl` from `lib/subscribeRedirect.ts` (Task 1).
- Produces: `/api/subscribe` now accepts optional `returnPath: string` in the JSON body and uses it to build the PayMongo `successUrl`.

- [ ] **Step 1: Add `returnPath` to the request body type**

In `app/api/subscribe/route.ts`, change the body cast (currently lines 17-19):

```ts
  const body = (await req.json().catch(() => null)) as
    | { yearId?: string; subjectId?: string; deviceId?: string; returnPath?: string }
    | null;
```

- [ ] **Step 2: Import the helper**

Add to the imports at the top of `app/api/subscribe/route.ts`:

```ts
import { buildSuccessUrl } from "@/lib/subscribeRedirect";
```

- [ ] **Step 3: Replace the hard-coded successUrl with the helper**

Replace the current success-URL block (currently lines 63-71):

```ts
  const ALLOWED_ORIGINS = [
    "https://survival-kit-app.vercel.app",
    "http://localhost:3000",
  ];
  const requestOrigin = req.headers.get("origin") ?? "";
  const origin = ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : "https://survival-kit-app.vercel.app";
  const successUrl = `${origin}/year/${yearId}/subjects`;
```

with:

```ts
  const ALLOWED_ORIGINS = [
    "https://survival-kit-app.vercel.app",
    "http://localhost:3000",
  ];
  const requestOrigin = req.headers.get("origin") ?? "";
  const origin = ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : "https://survival-kit-app.vercel.app";
  // Return the payer to the exact module page they came from (validated), with
  // ?payment=success so the SubscribeGate there auto-polls and unlocks in place.
  const successUrl = buildSuccessUrl({
    origin,
    yearId,
    subjectId,
    returnPath: body?.returnPath ?? null,
  });
```

Note: `yearId` and `subjectId` here are already validated (UUID or null) earlier in the handler, satisfying `buildSuccessUrl`'s precondition.

- [ ] **Step 4: Typecheck and run the full suite**

Run: `npx tsc --noEmit && npm test`
Expected: tsc clean (no output); all tests PASS (including Task 1's new file and the existing paymongo/payments/subscriptions suites).

- [ ] **Step 5: Commit**

```bash
git add app/api/subscribe/route.ts
git commit -m "feat(payments): redirect to originating module page with ?payment=success"
```

---

### Task 3: Update `SubscribeGate` — send returnPath, remove QR button, soften timeout copy

**Files:**
- Modify: `components/SubscribeGate.tsx`

**Interfaces:**
- Consumes: `/api/subscribe` now honoring `returnPath` (Task 2).
- Produces: no exported interface change.

- [ ] **Step 1: Send `returnPath` in the subscribe POST body**

In `components/SubscribeGate.tsx`, inside `handleSubscribe`, replace the body construction (currently lines 132-135):

```ts
      const body =
        plan === "subject"
          ? { yearId, subjectId, deviceId }
          : { yearId, deviceId };
```

with:

```ts
      const returnPath =
        typeof window !== "undefined" ? window.location.pathname : undefined;
      const body =
        plan === "subject"
          ? { yearId, subjectId, deviceId, returnPath }
          : { yearId, deviceId, returnPath };
```

- [ ] **Step 2: Remove the "I already paid" QR button**

Delete this block (currently lines 290-301):

```tsx
        {/* Manual trigger for QR code payers */}
        {!polling && (
          <button
            onClick={() => {
              setError(null);
              startPolling();
            }}
            className="font-sans text-xs text-ink-faint underline underline-offset-2 hover:text-ink transition-colors duration-150 text-left w-fit"
          >
            I already paid
          </button>
        )}
```

After deletion, the enclosing wrapper keeps only the helper line:

```tsx
      <div className="mt-4 flex flex-col gap-2">
        <p className="font-sans text-xs text-ink-faint">
          Paid via GCash, Maya, or card. Cancel anytime.
        </p>
      </div>
```

- [ ] **Step 3: Soften the poll-timeout message**

Replace the timeout error string (currently line 72):

```ts
        setError("We couldn't confirm your payment yet. Please refresh the page in a moment.");
```

with:

```ts
        setError("Almost there — your payment is still processing. Refresh this page in a moment to unlock.");
```

- [ ] **Step 4: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: tsc clean; lint passes. NOTE: `startPolling` must remain defined — it is still called by the `?payment=success` mount effect (~lines 98-102). Only its use inside the removed button goes away.

- [ ] **Step 5: Manual verification note (no automated browser test)**

Confirm by reasoning + (optional) local dev:
- `?payment=success` on a module page still triggers `startPolling()` via the mount effect (unchanged) — the removed button was not the only caller, so polling still works.
- The Subscribe buttons now post `returnPath`, so PayMongo will redirect back to the module page with the marker.

- [ ] **Step 6: Commit**

```bash
git add components/SubscribeGate.tsx
git commit -m "feat(payments): auto-unlock on return via returnPath; remove QR 'I already paid' path"
```

---

### Task 4: Full-suite verification

**Files:** none (verification only)

- [ ] **Step 1: Run the entire test suite + typecheck + lint**

Run: `npx tsc --noEmit && npm test && npm run lint`
Expected: tsc clean; ALL vitest tests PASS; lint passes.

- [ ] **Step 2: Confirm untouched files are truly untouched**

Run: `git diff --name-only main...HEAD`
Expected: only `lib/subscribeRedirect.ts`, `lib/subscribeRedirect.test.ts`, `app/api/subscribe/route.ts`, `components/SubscribeGate.tsx`, and the two `docs/superpowers/...` markdown files. Specifically NOT `lib/payments.ts`, `app/api/webhooks/paymongo/route.ts`, `lib/subscriptions.ts`, or any migration.

- [ ] **Step 3: Done — hand back for code review**

No commit. Report results and proceed to requesting-code-review.
