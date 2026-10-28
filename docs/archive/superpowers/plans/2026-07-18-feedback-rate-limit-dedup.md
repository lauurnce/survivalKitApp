# Feedback Anti-Farming: Rate Limit + Dedup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop unlimited ₱100 coupon farming on `POST /api/feedback` with database-enforced dedup, distributed rate limiting, trusted device identity, and coupon gating — without ever breaking the auto-deploy pipeline.

**Architecture:** Four defense layers. (1) The route trusts the signed HttpOnly device cookie over the client-supplied `device_id`, mirroring the 13 other routes that already do. (2) Dedup is enforced by partial unique indexes in Postgres (one feedback per user per module; one per device per module for anonymous), with a friendly 409 pre-check and `23505` race handling in the route. (3) Rate limiting moves to a **generic Supabase-backed fixed-window limiter** (`api_rate_limits` table + `check_rate_limit` RPC, modeled on the live `record_login_attempt` pattern) — shared across all Vercel instances, unlike the in-memory Maps, and reusable by every other public route later (this is item #2 on the security backlog). (4) Coupons are only issued to authenticated, non-anonymous submissions — the unique index then genuinely caps coupons at one per user per module; the modal copy already says "Create an account to claim your discount."

**Tech Stack:** Next.js App Router route handlers, Supabase (Postgres RPC via `@supabase/supabase-js` service-role client), Vitest + Testing Library (jsdom), hand-applied migrations via Supabase MCP.

## Global Constraints

- **Never break the pipeline:** every commit must pass `npm run build` and `npx vitest run` before it lands. Push to `main` auto-deploys to production.
- **Migration ordering:** tolerant code deploys BEFORE constraints are applied live; RPCs are applied live BEFORE code that calls them is pushed. Migrations are hand-applied via Supabase MCP (project `mpdymglipgzuybtxuvhy`) — the repo migration file is the record, not a pipeline.
- **Commits:** no `Co-Authored-By` trailers ever; lauurnce is sole author. Push via `git push "https://$(gh auth token)@github.com/lauurnce/survivalKitApp.git" main`.
- **Rate limits:** IP: 20 requests/hour; device: 5 requests/hour. Constants in the route file.
- **Coupon format changes** from `FEEDBACK-` + 6 chars to `FEEDBACK-` + 8 chars (Crockford base32, 40 bits entropy, fits `varchar(20)`).
- **Fail open:** a rate-limiter RPC error must never block a legitimate request (log + allow).
- Existing API response field names (`module_name`, `coupon_code`, …) must not change.

## File Structure

- `lib/rateLimit.ts` — existing in-memory limiter; only `getClientIp` signature widens.
- `lib/serverRateLimit.ts` — NEW: Supabase-backed distributed limiter (`isServerRateLimited`).
- `lib/feedback.ts` — coupon generation goes crypto-secure.
- `app/api/feedback/route.ts` — device cookie trust, dedup, rate limits, coupon gating.
- `app/api/feedback/route.test.ts` — grows with each route change.
- `lib/serverRateLimit.test.ts` — NEW.
- `components/FeedbackPrompt.tsx` — inline 409/429 errors, success state without coupon, honest coupon copy.
- `components/FeedbackPrompt.test.tsx` — NEW.
- `supabase/migrations/20260719000000_user_feedback_dedup.sql` — NEW.
- `supabase/migrations/20260719010000_api_rate_limits.sql` — NEW.

---

### Task 1: Commit the plan

**Files:**
- Create: `docs/superpowers/plans/2026-07-18-feedback-rate-limit-dedup.md` (this file)

- [ ] **Step 1: Commit**

```bash
git add docs/superpowers/plans/2026-07-18-feedback-rate-limit-dedup.md
git commit -m "docs: implementation plan for feedback rate limiting and dedup"
```

---

### Task 2: Widen `getClientIp` to accept any Request

The feedback route uses plain `Request`, but `getClientIp` in `lib/rateLimit.ts` demands `NextRequest`. It only reads headers, so widen the parameter type. Zero behavior change; unblocks reuse from any route handler.

**Files:**
- Modify: `lib/rateLimit.ts:40`
- Test: `lib/rateLimit.test.ts` (exists — add one case)

**Interfaces:**
- Produces: `getClientIp(req: { headers: Headers }): string` — consumed by Task 8.

- [ ] **Step 1: Write the failing test** (append to `lib/rateLimit.test.ts`)

```ts
it("getClientIp accepts a plain Request", () => {
  const req = new Request("http://localhost/", {
    headers: { "x-real-ip": "203.0.113.9" },
  });
  expect(getClientIp(req)).toBe("203.0.113.9");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/rateLimit.test.ts`
Expected: FAIL — TypeScript error (Request not assignable to NextRequest) or type-check failure at compile.

- [ ] **Step 3: Widen the signature** in `lib/rateLimit.ts`

```ts
// Prefer x-real-ip (set by Vercel, not client-spoofable). Fall back to the LAST
// x-forwarded-for hop (the one added by our proxy), never the first
// (client-controlled), then to a constant so a missing header can't bypass.
// Accepts anything with a Headers object so plain Request handlers can use it.
export function getClientIp(req: { headers: Headers }): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ??
    "unknown"
  );
}
```

Remove the now-unused `import { NextRequest } from "next/server";` if nothing else in the file uses it.

- [ ] **Step 4: Run tests + build**

Run: `npx vitest run lib/rateLimit.test.ts && npx tsc --noEmit`
Expected: PASS, no type errors (all existing NextRequest callers still satisfy the structural type).

- [ ] **Step 5: Commit**

```bash
git add lib/rateLimit.ts lib/rateLimit.test.ts
git commit -m "refactor(lib): widen getClientIp to accept any Request-shaped object"
```

---

### Task 3: Trust the signed device cookie in feedback POST

Feedback is the only public POST route that trusts the body `device_id`. Mirror the events-route pattern: verified cookie wins, body is the fallback.

**Files:**
- Modify: `app/api/feedback/route.ts`
- Test: `app/api/feedback/route.test.ts`

**Interfaces:**
- Consumes: `verifyDeviceCookie(value: string | undefined): string | null`, `DEVICE_COOKIE` from `@/lib/auth/deviceCookie`.
- Produces: route-local `const device_id = cookieDeviceId ?? bodyDeviceId` used by Tasks 4 and 8.

- [ ] **Step 1: Add the `next/headers` mock and failing test** to `app/api/feedback/route.test.ts`

At the top of the file (after existing mocks), add a controllable cookie mock. `verifyDeviceCookie` needs `DEVICE_COOKIE_SECRET`; mock the module instead so tests don't depend on HMAC internals:

```ts
let mockCookieDeviceId: string | null = null;
vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      get: () => (mockCookieDeviceId ? { value: `${mockCookieDeviceId}.sig` } : undefined),
    }),
}));
vi.mock("@/lib/auth/deviceCookie", () => ({
  DEVICE_COOKIE: "bsit_device_id",
  verifyDeviceCookie: (value: string | undefined) =>
    value ? value.slice(0, value.lastIndexOf(".")) : null,
}));
```

Reset `mockCookieDeviceId = null;` inside the existing `beforeEach`. Then the test (the supabase mock must capture insert payloads — restructure the `insert` mock to `vi.fn((row) => …)` storing `row` in a shared `let lastInsert` variable):

```ts
it("prefers the signed device cookie over the body device_id", async () => {
  mockCookieDeviceId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
  const req = new Request("http://localhost/api/feedback", {
    method: "POST",
    body: JSON.stringify({
      device_id: "11111111-1111-1111-1111-111111111111", // spoofed
      module_id: "module-789",
      app_rating: 5,
      module_rating: 5,
      feedback_text: "",
      is_anonymous: true,
    }),
  });
  const res = await POST(req);
  expect(res.status).toBe(200);
  expect(lastInsert.device_id).toBe("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/api/feedback/route.test.ts`
Expected: FAIL — `lastInsert.device_id` is the spoofed body value.

- [ ] **Step 3: Implement** in `app/api/feedback/route.ts`

Add imports:

```ts
import { cookies } from "next/headers";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
```

After parsing the body, replace the destructured `device_id` usage:

```ts
    // Trust the signed HttpOnly device cookie over the client-supplied body
    // value — the body is forgeable, the HMAC cookie is not.
    const cookieStore = await cookies();
    const cookieDeviceId = verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value);
    const device_id = cookieDeviceId ?? bodyDeviceId;
```

Rename the destructured field: `const { device_id: bodyDeviceId, module_id, ... } = body;` and update the required-fields check to use the resolved `device_id`.

- [ ] **Step 4: Run all feedback tests**

Run: `npx vitest run app/api/feedback`
Expected: ALL PASS (existing tests have no cookie → body fallback still works).

- [ ] **Step 5: Commit**

```bash
git add app/api/feedback/route.ts app/api/feedback/route.test.ts
git commit -m "fix(security): trust signed device cookie over body device_id in feedback POST"
```

---

### Task 4: Dedup pre-check → friendly 409

**Files:**
- Modify: `app/api/feedback/route.ts`
- Test: `app/api/feedback/route.test.ts`

**Interfaces:**
- Produces: 409 body `{ error: "already_submitted", message: "You've already shared feedback for this module — thank you!" }` — consumed by Task 12 (frontend).

- [ ] **Step 1: Write the failing test**

The supabase mock needs a controllable select chain. Extend the mocked `from()` with:

```ts
let existingFeedback: { id: string } | null = null;
// inside from() mock return object:
select: vi.fn(() => ({
  eq: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn(async () => ({ data: existingFeedback, error: null })),
})),
```

(Chainable: `eq`/`is`/`limit` return `this` so any order works.) Reset `existingFeedback = null` in `beforeEach`. Test:

```ts
it("returns 409 when feedback already exists for this device+module", async () => {
  existingFeedback = { id: "prior-feedback" };
  const req = new Request("http://localhost/api/feedback", {
    method: "POST",
    body: JSON.stringify({
      device_id: "11111111-1111-1111-1111-111111111111",
      module_id: "module-789",
      app_rating: 4,
      module_rating: 4,
      feedback_text: "",
      is_anonymous: true,
    }),
  });
  const res = await POST(req);
  const json = await res.json();
  expect(res.status).toBe(409);
  expect(json.error).toBe("already_submitted");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/api/feedback/route.test.ts`
Expected: FAIL — currently returns 200.

- [ ] **Step 3: Implement** — insert after rating validation, before quality check:

```ts
    // One feedback per user per module (authenticated) or per device per module
    // (anonymous). The DB unique indexes are the real guarantee; this pre-check
    // exists to return a friendly 409 instead of a raw constraint error.
    let dedupQuery = supabase
      .from("user_feedback")
      .select("id")
      .eq("module_id", module_id)
      .limit(1);
    if (!is_anonymous && authenticatedUserId) {
      dedupQuery = dedupQuery.eq("user_id", authenticatedUserId);
    } else {
      dedupQuery = dedupQuery.is("user_id", null).eq("device_id", device_id);
    }
    const { data: existing } = await dedupQuery.maybeSingle();
    if (existing) {
      return Response.json(
        {
          error: "already_submitted",
          message: "You've already shared feedback for this module — thank you!",
        },
        { status: 409 }
      );
    }
```

- [ ] **Step 4: Run all feedback tests** — `npx vitest run app/api/feedback` — ALL PASS (existing tests: `existingFeedback` defaults to null).

- [ ] **Step 5: Commit**

```bash
git add app/api/feedback/route.ts app/api/feedback/route.test.ts
git commit -m "feat(feedback): reject duplicate feedback per module with friendly 409"
```

---

### Task 5: Handle unique-violation race as 409

Two concurrent first submissions both pass the pre-check; the unique index (Task 6) makes the loser's insert fail with Postgres code `23505`. Map it to the same 409.

**Files:**
- Modify: `app/api/feedback/route.ts` (insert error branch)
- Test: `app/api/feedback/route.test.ts`

- [ ] **Step 1: Write the failing test.** Make the insert mock's result controllable (`let insertResult = { data: { id: "test-id-123" }, error: null as { code?: string } | null }`), reset in `beforeEach`:

```ts
it("maps a unique-violation insert error to 409", async () => {
  insertResult = { data: null, error: { code: "23505" } };
  const req = new Request("http://localhost/api/feedback", {
    method: "POST",
    body: JSON.stringify({
      device_id: "11111111-1111-1111-1111-111111111111",
      module_id: "module-789",
      app_rating: 4,
      module_rating: 4,
      feedback_text: "",
      is_anonymous: true,
    }),
  });
  const res = await POST(req);
  expect(res.status).toBe(409);
});
```

- [ ] **Step 2: Run to verify it fails** — expected 500 today.

- [ ] **Step 3: Implement** — in the insert error branch:

```ts
    if (error) {
      // Unique index caught a concurrent duplicate the pre-check missed.
      if (error.code === "23505") {
        return Response.json(
          {
            error: "already_submitted",
            message: "You've already shared feedback for this module — thank you!",
          },
          { status: 409 }
        );
      }
      console.error("Feedback insert error:", error);
      return Response.json({ error: "Failed to save feedback" }, { status: 500 });
    }
```

- [ ] **Step 4: Run all feedback tests** — ALL PASS.

- [ ] **Step 5: Commit, then push and confirm deploy**

```bash
git add app/api/feedback/route.ts app/api/feedback/route.test.ts
git commit -m "feat(feedback): treat unique-violation race as duplicate submission (409)"
npm run build && npx vitest run
git push "https://$(gh auth token)@github.com/lauurnce/survivalKitApp.git" main
```

Wait for the Vercel production deployment to reach READY (MCP `list_deployments`). **The tolerant code must be live before Task 6 applies the constraint.**

---

### Task 6: Dedup unique indexes (migration, applied live)

**Files:**
- Create: `supabase/migrations/20260719000000_user_feedback_dedup.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- One feedback per user per module (authenticated rows), one per device per
-- module (anonymous rows). Enforced in the DB so no API race can farm coupons.
-- Idempotent: safe to run against live DB or fresh one.

-- Pre-dedupe any rows inserted before the constraint existed: keep the
-- earliest submission (its coupon may already be redeemed), drop later ones.
delete from user_feedback a
using user_feedback b
where a.user_id is not null and b.user_id is not null
  and a.user_id = b.user_id
  and a.module_id = b.module_id
  and (a.created_at > b.created_at
       or (a.created_at = b.created_at and a.id > b.id));

delete from user_feedback a
using user_feedback b
where a.user_id is null and b.user_id is null
  and a.device_id = b.device_id
  and a.module_id = b.module_id
  and (a.created_at > b.created_at
       or (a.created_at = b.created_at and a.id > b.id));

create unique index if not exists user_feedback_user_module_uniq
  on user_feedback (user_id, module_id) where user_id is not null;

create unique index if not exists user_feedback_device_module_anon_uniq
  on user_feedback (device_id, module_id) where user_id is null;
```

- [ ] **Step 2: Apply live** via Supabase MCP `apply_migration` (project `mpdymglipgzuybtxuvhy`, name `user_feedback_dedup`) with the exact SQL above. First run `select count(*) from user_feedback;` to know the row count going in; verify after with `select indexname from pg_indexes where tablename='user_feedback';` — both new indexes present.

- [ ] **Step 3: Verify against production** — POST twice to `https://survival-kit-app.vercel.app/api/feedback` with the same fresh device UUID + module `a1000001-0001-0001-0001-000000000001` (empty `feedback_text`): first → 200, second → 409. Then delete the test row:
`delete from user_feedback where device_id = '<the test uuid>';`

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260719000000_user_feedback_dedup.sql
git commit -m "feat(db): enforce one feedback per user/device per module with unique indexes"
```

---

### Task 7: Generic distributed rate-limit table + RPC (migration, applied live)

Modeled on the live `record_login_attempt` fixed-window upsert. Generic key so any route can adopt it later (events, waitlist, progress, run still use per-instance Maps — this is their migration path).

**Files:**
- Create: `supabase/migrations/20260719010000_api_rate_limits.sql`

**Interfaces:**
- Produces: RPC `check_rate_limit(p_key text, p_max integer, p_window_seconds integer) returns boolean` (true = limited) — consumed by Task 8.

- [ ] **Step 1: Write the migration file**

```sql
-- Generic fixed-window rate limiting shared across all serverless instances.
-- Modeled on the live login_attempts pattern (record_login_attempt), but
-- keyed by an arbitrary namespaced string ("feedback:ip:1.2.3.4") so every
-- public route can share one table + RPC instead of per-instance memory Maps.
-- Idempotent: safe to run against live DB or fresh one.

create table if not exists api_rate_limits (
  key      text primary key,
  count    integer not null,
  reset_at timestamptz not null
);

-- Service-role / SECURITY DEFINER access only; no client policies.
alter table api_rate_limits enable row level security;

create or replace function check_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_now   timestamptz := now();
  v_reset timestamptz := now() + make_interval(secs => p_window_seconds);
  v_count integer;
begin
  insert into public.api_rate_limits as r (key, count, reset_at)
  values (p_key, 1, v_reset)
  on conflict (key) do update
    set count    = case when r.reset_at < v_now then 1 else r.count + 1 end,
        reset_at = case when r.reset_at < v_now then v_reset else r.reset_at end
  returning count into v_count;

  return v_count > p_max;  -- true => over the limit, reject
end;
$$;

revoke execute on function check_rate_limit(text, integer, integer)
  from anon, authenticated;

-- Housekeeping: callable from an admin task or cron to drop expired windows.
create or replace function cleanup_expired_rate_limits() returns integer
language sql
security definer
set search_path to 'public'
as $$
  with deleted as (
    delete from api_rate_limits where reset_at < now() returning 1
  )
  select count(*)::integer from deleted;
$$;

revoke execute on function cleanup_expired_rate_limits()
  from anon, authenticated;
```

- [ ] **Step 2: Apply live** via MCP `apply_migration` (name `api_rate_limits`). Verify:

```sql
select check_rate_limit('plan-test:1', 2, 60);  -- false
select check_rate_limit('plan-test:1', 2, 60);  -- false
select check_rate_limit('plan-test:1', 2, 60);  -- true (3rd call over max 2)
delete from api_rate_limits where key like 'plan-test:%';
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260719010000_api_rate_limits.sql
git commit -m "feat(db): generic distributed rate limiting via api_rate_limits + check_rate_limit RPC"
```

---

### Task 8: `lib/serverRateLimit.ts` + wire into feedback POST

RPC is live (Task 7), so code can ship. Two commits: the lib, then the wiring.

**Files:**
- Create: `lib/serverRateLimit.ts`
- Create: `lib/serverRateLimit.test.ts`
- Modify: `app/api/feedback/route.ts`
- Test: `app/api/feedback/route.test.ts`

**Interfaces:**
- Consumes: `check_rate_limit` RPC (Task 7), `getClientIp` (Task 2).
- Produces: `isServerRateLimited(key: string, opts: { max: number; windowSeconds: number }): Promise<boolean>`; 429 body `{ error: "rate_limited", message: "Too many submissions — please try again later." }` (consumed by Task 12).

- [ ] **Step 1: Write failing lib tests** — `lib/serverRateLimit.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const rpcMock = vi.fn();
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ rpc: rpcMock })),
}));

import { isServerRateLimited } from "./serverRateLimit";

describe("isServerRateLimited", () => {
  beforeEach(() => rpcMock.mockReset());

  it("returns true when the RPC reports the key is over its limit", async () => {
    rpcMock.mockResolvedValue({ data: true, error: null });
    expect(await isServerRateLimited("t:1", { max: 5, windowSeconds: 60 })).toBe(true);
    expect(rpcMock).toHaveBeenCalledWith("check_rate_limit", {
      p_key: "t:1",
      p_max: 5,
      p_window_seconds: 60,
    });
  });

  it("returns false when under the limit", async () => {
    rpcMock.mockResolvedValue({ data: false, error: null });
    expect(await isServerRateLimited("t:1", { max: 5, windowSeconds: 60 })).toBe(false);
  });

  it("fails open when the RPC errors", async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: "boom" } });
    expect(await isServerRateLimited("t:1", { max: 5, windowSeconds: 60 })).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npx vitest run lib/serverRateLimit.test.ts` — FAIL (module not found).

- [ ] **Step 3: Implement `lib/serverRateLimit.ts`**

```ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Distributed fixed-window rate limiter backed by the check_rate_limit RPC.
// Unlike the in-memory maps in lib/rateLimit.ts, state is shared across all
// serverless instances and survives cold starts. Keys are namespaced by the
// caller, e.g. "feedback:ip:203.0.113.9".
//
// Fails open: a limiter outage must never take down the endpoint it protects.

let client: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return client;
}

export interface ServerRateLimitOptions {
  max: number;
  windowSeconds: number;
}

export async function isServerRateLimited(
  key: string,
  { max, windowSeconds }: ServerRateLimitOptions
): Promise<boolean> {
  const { data, error } = await getClient().rpc("check_rate_limit", {
    p_key: key,
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("check_rate_limit RPC error:", error);
    return false;
  }
  return data === true;
}
```

- [ ] **Step 4: Run lib tests** — PASS. Commit:

```bash
git add lib/serverRateLimit.ts lib/serverRateLimit.test.ts
git commit -m "feat(lib): Supabase-backed distributed rate limiter shared across instances"
```

- [ ] **Step 5: Write failing route tests** — mock the lib in `app/api/feedback/route.test.ts`:

```ts
let rateLimited = false;
vi.mock("@/lib/serverRateLimit", () => ({
  isServerRateLimited: vi.fn(async () => rateLimited),
}));
```

Reset `rateLimited = false` in `beforeEach`. Test:

```ts
it("returns 429 when rate limited", async () => {
  rateLimited = true;
  const req = new Request("http://localhost/api/feedback", {
    method: "POST",
    body: JSON.stringify({
      device_id: "11111111-1111-1111-1111-111111111111",
      module_id: "module-789",
      app_rating: 4,
      module_rating: 4,
      feedback_text: "",
      is_anonymous: true,
    }),
  });
  const res = await POST(req);
  const json = await res.json();
  expect(res.status).toBe(429);
  expect(json.error).toBe("rate_limited");
});
```

- [ ] **Step 6: Run to verify failure** — currently 200.

- [ ] **Step 7: Wire into the route** — after field validation, before the dedup pre-check:

```ts
import { getClientIp } from "@/lib/rateLimit";
import { isServerRateLimited } from "@/lib/serverRateLimit";

const RATE_LIMIT_IP = { max: 20, windowSeconds: 3600 };     // campus NAT headroom
const RATE_LIMIT_DEVICE = { max: 5, windowSeconds: 3600 };
```

```ts
    // Distributed rate limits: coarse per-IP, tight per-device.
    const ip = getClientIp(request);
    const [ipLimited, deviceLimited] = await Promise.all([
      isServerRateLimited(`feedback:ip:${ip}`, RATE_LIMIT_IP),
      isServerRateLimited(`feedback:device:${device_id}`, RATE_LIMIT_DEVICE),
    ]);
    if (ipLimited || deviceLimited) {
      return Response.json(
        {
          error: "rate_limited",
          message: "Too many submissions — please try again later.",
        },
        { status: 429 }
      );
    }
```

- [ ] **Step 8: Run all tests + build** — `npx vitest run && npm run build` — ALL PASS.

- [ ] **Step 9: Commit**

```bash
git add app/api/feedback/route.ts app/api/feedback/route.test.ts
git commit -m "feat(feedback): distributed per-IP and per-device rate limits on submission"
```

---

### Task 9: Crypto-secure coupon codes

`Math.random()` is predictable. Use `crypto.randomBytes` with a 32-char Crockford-style alphabet (power of two → `& 31` has zero modulo bias); 8 chars = 40 bits. `FEEDBACK-XXXXXXXX` is 17 chars, fits `varchar(20)`.

**Files:**
- Modify: `lib/feedback.ts`
- Test: `lib/feedback.test.ts` (exists — update format tests)
- Test: `app/api/feedback/route.test.ts` (update the `FEEDBACK-[A-Z0-9]{6}` regex to `{8}`)

- [ ] **Step 1: Write/adjust failing tests** in `lib/feedback.test.ts`:

```ts
it("generates 8-char codes from the unambiguous alphabet", () => {
  const code = generateCouponCode();
  expect(code).toMatch(/^FEEDBACK-[0-9ABCDEFGHJKMNPQRSTVWXYZ]{8}$/);
});

it("does not repeat across many generations", () => {
  const codes = new Set(Array.from({ length: 1000 }, generateCouponCode));
  expect(codes.size).toBe(1000);
});
```

Search both test files for `FEEDBACK-[A-Z0-9]{6}` and update to the new pattern.

- [ ] **Step 2: Run to verify failure** — old 6-char format fails the new regex.

- [ ] **Step 3: Implement** in `lib/feedback.ts`:

```ts
import { randomBytes } from "crypto";

/**
 * Generate a coupon code: FEEDBACK- + 8 chars from a 32-char alphabet
 * (Crockford-style, no I/L/O/U). crypto-random; 32 = 2^5 so `& 31` is
 * unbiased. 40 bits of entropy.
 */
const COUPON_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function generateCouponCode(): string {
  const bytes = randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) code += COUPON_ALPHABET[bytes[i] & 31];
  return `FEEDBACK-${code}`;
}
```

- [ ] **Step 4: Run all tests** — `npx vitest run` — ALL PASS (subscribe-route coupon validation looks codes up by exact value, so format change is compatible; only new codes get the new format).

- [ ] **Step 5: Commit**

```bash
git add lib/feedback.ts lib/feedback.test.ts app/api/feedback/route.test.ts
git commit -m "fix(security): cryptographically secure coupon codes with unbiased 32-char alphabet"
```

---

### Task 10: Coupons only for authenticated, non-anonymous submissions

Anonymous `device_id` is client-generated, so anonymous coupons are farmable by construction. Gate coupons on `user_id` — then the unique index truly caps them at one per user per module. Anonymous feedback is still accepted and quality-scored (the data is the point); the modal copy already promises discounts to account holders.

**Files:**
- Modify: `app/api/feedback/route.ts`
- Test: `app/api/feedback/route.test.ts`

**Interfaces:**
- Produces: anonymous success body has `coupon_code: null` and message `"Thanks for your feedback! Sign in next time to earn a ₱100 discount code."` — consumed by Task 12.

- [ ] **Step 1: Write the failing test**

```ts
it("does not issue a coupon for anonymous submissions", async () => {
  const req = new Request("http://localhost/api/feedback", {
    method: "POST",
    body: JSON.stringify({
      device_id: "11111111-1111-1111-1111-111111111111",
      module_id: "module-789",
      app_rating: 5,
      module_rating: 5,
      feedback_text: "Great examples, very clear and helpful!",
      is_anonymous: true,
    }),
  });
  const res = await POST(req);
  const json = await res.json();
  expect(res.status).toBe(200);
  expect(json.coupon_code).toBeNull();
  expect(json.is_quality_approved).toBe(true);
  expect(json.message).toContain("Sign in");
});
```

Also assert in the existing authenticated test that the coupon is still issued.

- [ ] **Step 2: Run to verify failure** — anonymous currently gets a coupon.

- [ ] **Step 3: Implement**

```ts
    const isQualityApproved = checkFeedbackQuality(feedback_text);

    // Coupons only for signed-in, non-anonymous feedback: anonymous device_ids
    // are client-generated, so anonymous coupons are farmable by construction.
    // The (user_id, module_id) unique index caps this at one coupon per user
    // per module.
    const couponEligible = !is_anonymous && authenticatedUserId !== null;

    let coupon_code = null;
    let coupon_expires_at = null;
    if (isQualityApproved && couponEligible) {
      coupon_code = generateCouponCode();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      coupon_expires_at = expiryDate.toISOString();
    }
```

And the message block:

```ts
    let message = "Thanks for your feedback!";
    if (coupon_code) {
      message = `Thanks! Your feedback helps us improve. You've earned a ₱100 discount code: ${coupon_code} (valid 30 days)`;
    } else if (isQualityApproved && !couponEligible) {
      message = "Thanks for your feedback! Sign in next time to earn a ₱100 discount code.";
    }
```

Simplify the response to use `coupon_code` / `coupon_expires_at` directly (they're already null when ineligible).

- [ ] **Step 4: Run all tests + build** — ALL PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/feedback/route.ts app/api/feedback/route.test.ts
git commit -m "feat(feedback): issue coupons only to authenticated non-anonymous submissions"
```

---

### Task 11: FeedbackPrompt UX for 409/429, success without coupon, honest copy

Today the modal `alert()`s errors, only shows the success panel when a coupon exists, and tells anonymous users to "create an account to claim your discount" for a code they can no longer receive.

**Files:**
- Modify: `components/FeedbackPrompt.tsx`
- Create: `components/FeedbackPrompt.test.tsx`

- [ ] **Step 1: Write failing component tests** — `components/FeedbackPrompt.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FeedbackPrompt } from "./FeedbackPrompt";

vi.mock("@/lib/device", () => ({
  getDeviceId: () => "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
}));

function fillAndSubmit() {
  // 10 star buttons: first 5 = module rating, last 5 = app rating
  const stars = screen.getAllByRole("button", { name: "★" });
  fireEvent.click(stars[4]);
  fireEvent.click(stars[9]);
  fireEvent.click(screen.getByRole("button", { name: /submit/i }));
}

describe("FeedbackPrompt", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("shows an inline error on 409 instead of alerting", async () => {
    global.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({ error: "already_submitted", message: "You've already shared feedback for this module — thank you!" }),
        { status: 409 }
      )
    ) as unknown as typeof fetch;
    render(<FeedbackPrompt isOpen moduleId="m1" onClose={() => {}} />);
    fillAndSubmit();
    await waitFor(() =>
      expect(screen.getByText(/already shared feedback/i)).toBeInTheDocument()
    );
  });

  it("shows the thank-you state even when no coupon is returned", async () => {
    global.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          id: "f1", coupon_code: null, coupon_expires_at: null,
          is_quality_approved: true,
          message: "Thanks for your feedback! Sign in next time to earn a ₱100 discount code.",
        }),
        { status: 200 }
      )
    ) as unknown as typeof fetch;
    render(<FeedbackPrompt isOpen moduleId="m1" onClose={() => {}} />);
    fillAndSubmit();
    await waitFor(() =>
      expect(screen.getByText(/Sign in next time/i)).toBeInTheDocument()
    );
  });
});
```

(Adjust the star-button query if `★` needs `getAllByText` — match whatever renders; keep the two assertions as written.)

- [ ] **Step 2: Run to verify failure** — `npx vitest run components/FeedbackPrompt.test.tsx` — FAIL (alert path, no no-coupon success state).

- [ ] **Step 3: Implement** in `components/FeedbackPrompt.tsx`:

1. Add state: `const [errorMessage, setErrorMessage] = useState('');` and `const [submitted, setSubmitted] = useState(false);`
2. In `handleSubmit`: `setErrorMessage('')` at start; on `response.ok` set `setSubmitted(true)` (keep coupon + message states); replace the `else` branch's `alert(...)` with `setErrorMessage(data.message || data.error || 'Failed to submit feedback');` and the catch's `alert` with `setErrorMessage('Error submitting feedback — please try again.');`
3. Change the success gate from `if (couponCode)` to `if (submitted)` — inside, keep the coupon block conditional on `couponCode` as it already is, and change the anonymous hint to: `Sign in and submit non-anonymously next time to earn a ₱100 discount code.`
4. Render the inline error above the buttons:

```tsx
{errorMessage && (
  <p role="alert" className="text-sm text-red-600 dark:text-red-400">
    {errorMessage}
  </p>
)}
```

5. Reset `errorMessage`/`submitted` in the existing post-success `setTimeout` reset block.

- [ ] **Step 4: Run component tests + full suite + build** — ALL PASS.

- [ ] **Step 5: Commit**

```bash
git add components/FeedbackPrompt.tsx components/FeedbackPrompt.test.tsx
git commit -m "feat(ui): inline feedback errors, thank-you without coupon, honest discount copy"
```

---

### Task 12: Final verification, push, live smoke test

- [ ] **Step 1: Full local gate** — `npx vitest run && npm run build` — everything green.

- [ ] **Step 2: Push** — `git push "https://$(gh auth token)@github.com/lauurnce/survivalKitApp.git" main`; wait for the production deployment to reach READY.

- [ ] **Step 3: Live smoke test** against `https://survival-kit-app.vercel.app/api/feedback` with a fresh device UUID and module `a1000001-0001-0001-0001-000000000001`:
  1. Anonymous POST with good feedback text → 200, `coupon_code: null`, message mentions signing in.
  2. Same device+module again → 409 `already_submitted`.
  3. Loop 6 anonymous POSTs with distinct random device UUIDs from one IP... (device limit is per-device; the 6 distinct devices exercise the IP counter without hitting 20 — instead verify the device limiter by POSTing 6 times with ONE device UUID across 6 different module IDs → 6th returns 429 `rate_limited`.)
  4. Clean up: `delete from user_feedback where device_id in (<test uuids>);` and `delete from api_rate_limits where key like 'feedback:%<test-marker>%';` (delete the exact test keys).
- [ ] **Step 4: Confirm no new runtime errors** — MCP `get_runtime_errors` since the deploy.
- [ ] **Step 5: Update memory** — mark the coupon-farming risk CLOSED in `project_feedback_system.md`; note `check_rate_limit` RPC as the shared limiter other routes should migrate to.

## Self-Review Notes

- Spec coverage: rate limit ✓ (Tasks 7–8), dedup ✓ (Tasks 4–6), scalability ✓ (generic RPC/table + reusable lib + widened `getClientIp`; migration path for 4 other Map-based routes), 10+ commits ✓ (12), pipeline safety ✓ (tolerant code before constraints; RPC before callers; build+tests gate every commit; deploy verified at both push points).
- Type consistency: `isServerRateLimited(key, { max, windowSeconds })` used identically in Tasks 8 lib/route; 409/429 bodies identical across Tasks 4/5/8 and consumed in Task 11.
- Known accepted trade-offs: two students sharing one lab PC can each leave authenticated feedback (dedup is per-user), but a second *anonymous* submission per device+module is blocked. Fail-open limiter favors availability over strictness.
