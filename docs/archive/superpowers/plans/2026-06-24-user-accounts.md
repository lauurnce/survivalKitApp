# User Accounts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email + password accounts (Supabase Auth) so paid access attaches to a person, not a device, with an account dashboard showing unlocked subjects and progress.

**Architecture:** Supabase Auth via `@supabase/ssr` issues session cookies. Each device-keyed table gains a nullable `user_id`. On login/signup a `claimDeviceRows` server helper migrates the current signed device's unclaimed rows onto the account. Access checks become user-first with device fallback. The PayMongo webhook binds new payments to `user_id` directly.

**Tech Stack:** Next.js 15 (App Router), React 19, Supabase (Auth + Postgres), `@supabase/ssr`, TypeScript, Tailwind, Vitest.

## Global Constraints

- Node `24.x`; Next `^15.5.19`; React `19`.
- Never store or hash passwords ourselves — Supabase Auth owns credentials.
- All access decisions are **server-side**; the client never gates paid content.
- New migrations are idempotent (`if not exists` / `drop policy if exists`) and RLS-enabled, matching existing conventions.
- Commits: no `Co-Authored-By` trailers; lauurnce is sole contributor (per CLAUDE.md).
- Email confirmation is **disabled** for now (instant login on signup).
- Existing device-based access must keep working for anonymous users (device fallback).
- Run `npm test` (Vitest) for tests; access functions live in `lib/`.

---

### Task 1: Add `user_id` columns, RLS policies, and indexes (DB migration)

**Files:**
- Create: `supabase/migrations/20260624200000_accounts_user_id.sql`

**Interfaces:**
- Produces: nullable `user_id uuid` on `subscriptions`, `payments`, `module_progress`, `unlocks`, each referencing `auth.users(id)`; per-table `user reads own ...` select policies; per-table `(user_id)` index.

- [ ] **Step 1: Write the migration**

```sql
-- Accounts: attach paid/progress rows to a Supabase auth user.
-- Nullable so existing anonymous device rows stay valid; claimDeviceRows()
-- backfills user_id on login. Idempotent for re-runs.

alter table subscriptions   add column if not exists user_id uuid references auth.users(id);
alter table payments        add column if not exists user_id uuid references auth.users(id);
alter table module_progress add column if not exists user_id uuid references auth.users(id);
alter table unlocks         add column if not exists user_id uuid references auth.users(id);

create index if not exists subscriptions_user_id_idx   on subscriptions   (user_id);
create index if not exists payments_user_id_idx        on payments        (user_id);
create index if not exists module_progress_user_id_idx on module_progress (user_id);
create index if not exists unlocks_user_id_idx         on unlocks         (user_id);

-- Logged-in users may read their own rows (device policies remain for anon).
drop policy if exists "user reads own subscriptions" on subscriptions;
create policy "user reads own subscriptions" on subscriptions
  for select using (user_id = auth.uid());

drop policy if exists "user reads own payments" on payments;
create policy "user reads own payments" on payments
  for select using (user_id = auth.uid());

drop policy if exists "user reads own module_progress" on module_progress;
create policy "user reads own module_progress" on module_progress
  for select using (user_id = auth.uid());

drop policy if exists "user reads own unlocks" on unlocks;
create policy "user reads own unlocks" on unlocks
  for select using (user_id = auth.uid());
```

- [ ] **Step 2: Apply the migration**

Apply via the Supabase MCP `apply_migration` tool (name: `accounts_user_id`) OR `supabase db push` if using the CLI. Expected: success, no errors.

- [ ] **Step 3: Verify columns exist**

Use Supabase MCP `list_tables` (or `\d subscriptions`). Expected: each of the four tables now has a `user_id` column.

- [ ] **Step 4: Check advisors**

Run Supabase MCP `get_advisors` (type: security). Expected: no new RLS advisories for the four tables.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260624200000_accounts_user_id.sql
git commit -m "feat(db): add user_id + RLS policies for accounts on paid/progress tables"
```

---

### Task 2: Install `@supabase/ssr` and add browser/server SSR clients

**Files:**
- Modify: `package.json` (add `@supabase/ssr`)
- Create: `lib/supabase/ssrServer.ts`
- Create: `lib/supabase/ssrBrowser.ts`

**Interfaces:**
- Consumes: env `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (already in `.env.local` / `lib/supabase/env.ts`).
- Produces:
  - `createSSRServerClient(): Promise<SupabaseClient>` — reads/writes auth cookies via `next/headers`.
  - `createSSRBrowserClient(): SupabaseClient` — browser client for client components.
  - These are the **auth-aware** clients (anon key + user session). The existing `createServerClient()` (service role) is unchanged and stays for webhook/admin writes.

- [ ] **Step 1: Install dependency**

```bash
npm install @supabase/ssr
```
Expected: `@supabase/ssr` added to `package.json` dependencies.

- [ ] **Step 2: Write the server SSR client**

```typescript
// lib/supabase/ssrServer.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireEnv } from "./env";

export async function createSSRServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // called from a Server Component; middleware refreshes the session
          }
        },
      },
    },
  );
}
```

- [ ] **Step 3: Write the browser SSR client**

```typescript
// lib/supabase/ssrBrowser.ts
"use client";
import { createBrowserClient } from "@supabase/ssr";

export function createSSRBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 4: Verify env helper exposes the anon key**

Run: `grep -n "NEXT_PUBLIC_SUPABASE_ANON_KEY" lib/supabase/env.ts .env.local`
Expected: the key is present. If `requireEnv` whitelists keys, add `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json lib/supabase/ssrServer.ts lib/supabase/ssrBrowser.ts lib/supabase/env.ts
git commit -m "feat(auth): add @supabase/ssr browser + server clients"
```

---

### Task 3: Refresh Supabase session in middleware (preserve admin guard)

**Files:**
- Modify: `middleware.ts`

**Interfaces:**
- Consumes: `createServerClient` from `@supabase/ssr`.
- Produces: every request gets its Supabase auth cookies refreshed; the existing `/admin` HMAC guard still runs and redirects unauthenticated admins.

- [ ] **Step 1: Update middleware to refresh the session before the admin guard**

Add session refresh at the top of `middleware()` and widen the matcher. Keep `verifyAdminToken` and the `/admin` redirect exactly as-is.

```typescript
import { createServerClient } from "@supabase/ssr";
// ...keep existing verifyAdminToken...

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });

  // Refresh the Supabase auth session cookie on every request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet) =>
          toSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          ),
      },
    },
  );
  await supabase.auth.getUser();

  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get("admin_session")?.value ?? "";
    const valid = await verifyAdminToken(token);
    if (!valid) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manually verify admin guard still redirects**

Run `npm run dev`, visit `/admin` while logged out of admin. Expected: redirect to `/admin/login` (unchanged behavior).

- [ ] **Step 4: Commit**

```bash
git add middleware.ts
git commit -m "feat(auth): refresh Supabase session in middleware, keep admin guard"
```

---

### Task 4: `claimDeviceRows` helper (device → account migration)

**Files:**
- Create: `lib/auth/claim.ts`
- Test: `lib/auth/claim.test.ts`

**Interfaces:**
- Consumes: `createServerClient` (service role) from `@/lib/supabase/server`; `isUuid` from `@/lib/validation`.
- Produces: `claimDeviceRows(userId: string, deviceId: string): Promise<void>` — for each of `subscriptions`, `payments`, `module_progress`, `unlocks`, sets `user_id = userId` where `device_id = deviceId` and `user_id is null`. No-op if either id is not a valid UUID.

- [ ] **Step 1: Write the failing test**

```typescript
// lib/auth/claim.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const updates: Array<{ table: string; user_id: string; device_id: string; nullOnly: boolean }> = [];

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: (table: string) => ({
      update: (vals: { user_id: string }) => ({
        eq: (_c: string, device_id: string) => ({
          is: (_col: string, _v: null) => {
            updates.push({ table, user_id: vals.user_id, device_id, nullOnly: true });
            return Promise.resolve({ error: null });
          },
        }),
      }),
    }),
  }),
}));

import { claimDeviceRows } from "./claim";

beforeEach(() => { updates.length = 0; });

const U = "11111111-1111-1111-1111-111111111111";
const D = "22222222-2222-2222-2222-222222222222";

describe("claimDeviceRows", () => {
  it("updates all four tables, scoped to the device and user_id IS NULL", async () => {
    await claimDeviceRows(U, D);
    expect(updates.map((u) => u.table).sort()).toEqual(
      ["module_progress", "payments", "subscriptions", "unlocks"],
    );
    expect(updates.every((u) => u.user_id === U && u.device_id === D && u.nullOnly)).toBe(true);
  });

  it("no-ops on an invalid device id", async () => {
    await claimDeviceRows(U, "not-a-uuid");
    expect(updates).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- claim`
Expected: FAIL ("claimDeviceRows is not a function" / module not found).

- [ ] **Step 3: Write the implementation**

```typescript
// lib/auth/claim.ts
import { createServerClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";

const TABLES = ["subscriptions", "payments", "module_progress", "unlocks"] as const;

/**
 * Migrate a device's unclaimed rows onto a logged-in user. Only touches rows
 * matching the given device_id whose user_id is still NULL, so it can never
 * reassign another account's rows. Safe to call on every login (idempotent).
 */
export async function claimDeviceRows(userId: string, deviceId: string): Promise<void> {
  if (!isUuid(userId) || !isUuid(deviceId)) return;
  const supabase = createServerClient();
  await Promise.all(
    TABLES.map((table) =>
      supabase
        .from(table)
        .update({ user_id: userId })
        .eq("device_id", deviceId)
        .is("user_id", null),
    ),
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- claim`
Expected: PASS (both tests).

- [ ] **Step 5: Commit**

```bash
git add lib/auth/claim.ts lib/auth/claim.test.ts
git commit -m "feat(auth): add claimDeviceRows to migrate device rows to a user on login"
```

---

### Task 5: Make access checks user-first with device fallback

**Files:**
- Modify: `lib/subscriptions.ts`
- Modify: `lib/unlocks.ts`
- Test: `lib/subscriptions.test.ts` (extend), `lib/unlocks` test if present (else add `lib/unlocks.test.ts`)

**Interfaces:**
- Consumes: `createServerClient` (service role).
- Produces:
  - `isSubscribed(deviceId, yearId, subjectId?, userId?: string): Promise<boolean>` — if `userId` is a valid UUID, query by `user_id`; else query by `device_id` (today's behavior).
  - `isUnlocked(deviceId, moduleId, userId?: string): Promise<boolean>` — same pattern.
  - The new param is **optional and last**, so existing callers compile unchanged.

- [ ] **Step 1: Write the failing test (subscriptions, user-first branch)**

```typescript
// lib/subscriptions.test.ts — add this case
import { describe, it, expect, vi } from "vitest";

it("queries by user_id when a userId is supplied", async () => {
  const eqCalls: Array<[string, string]> = [];
  vi.doMock("./supabase/server", () => ({
    createServerClient: () => {
      const chain: any = {
        select: () => chain, eq: (c: string, v: string) => { eqCalls.push([c, v]); return chain; },
        is: () => chain, gt: () => chain, limit: () => chain,
        maybeSingle: () => Promise.resolve({ data: { id: "x" } }),
      };
      return { from: () => chain };
    },
  }));
  const { isSubscribed } = await import("./subscriptions");
  const ok = await isSubscribed("dev", "11111111-1111-1111-1111-111111111111", undefined, "33333333-3333-3333-3333-333333333333");
  expect(ok).toBe(true);
  expect(eqCalls.some(([c]) => c === "user_id")).toBe(true);
  expect(eqCalls.some(([c]) => c === "device_id")).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- subscriptions`
Expected: FAIL (still filters by `device_id`).

- [ ] **Step 3: Update `lib/subscriptions.ts`**

Add an optional `userId` param and choose the filter column. Replace the two `.eq("device_id", deviceId)` filters with a helper that keys on user when present.

```typescript
import { createServerClient } from "./supabase/server";
import { isUuid } from "./validation";

export async function isSubscribed(
  deviceId: string,
  yearId: string,
  subjectId?: string,
  userId?: string,
): Promise<boolean> {
  if (process.env.UNLOCK_ALL === "true") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("UNLOCK_ALL must not be set in production");
    }
    return true;
  }

  const now = new Date().toISOString();
  const supabase = createServerClient();
  const useUser = isUuid(userId);
  const col = useUser ? "user_id" : "device_id";
  const val = useUser ? (userId as string) : deviceId;

  const { data: yearPlan } = await supabase
    .from("subscriptions").select("id")
    .eq(col, val).eq("year_id", yearId).is("subject_id", null)
    .eq("status", "active").gt("current_period_end", now)
    .limit(1).maybeSingle();
  if (yearPlan) return true;

  if (!subjectId) return false;

  const { data: subjectPlan } = await supabase
    .from("subscriptions").select("id")
    .eq(col, val).eq("year_id", yearId).eq("subject_id", subjectId)
    .eq("status", "active").gt("current_period_end", now)
    .limit(1).maybeSingle();
  return !!subjectPlan;
}
```

- [ ] **Step 4: Update `lib/unlocks.ts` the same way**

```typescript
import { createServerClient } from "./supabase/server";
import { isUuid } from "./validation";

export async function isUnlocked(
  deviceId: string,
  moduleId: string,
  userId?: string,
): Promise<boolean> {
  if (process.env.UNLOCK_ALL === "true") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("UNLOCK_ALL must not be set in production — disable it in Vercel environment variables");
    }
    return true;
  }
  const supabase = createServerClient();
  const useUser = isUuid(userId);
  const { data } = await supabase
    .from("unlocks").select("id")
    .eq(useUser ? "user_id" : "device_id", useUser ? (userId as string) : deviceId)
    .eq("module_id", moduleId).eq("status", "approved")
    .limit(1).maybeSingle();
  return !!data;
}
```

Note: `.single()` → `.maybeSingle()` avoids a throw when no row matches.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- subscriptions unlocks`
Expected: PASS (new + existing device-fallback cases).

- [ ] **Step 6: Commit**

```bash
git add lib/subscriptions.ts lib/unlocks.ts lib/subscriptions.test.ts lib/unlocks.test.ts
git commit -m "feat(access): make isSubscribed/isUnlocked user-first with device fallback"
```

---

### Task 6: Resolve the current user at gate call sites

**Files:**
- Create: `lib/auth/currentUser.ts`
- Modify: `app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx` (~line 59)
- Modify: `app/api/subscription-status/route.ts`
- Modify: `app/api/activity/[sectionId]/route.ts`

**Interfaces:**
- Consumes: `createSSRServerClient` (Task 2).
- Produces: `getCurrentUserId(): Promise<string | null>` — returns `auth.uid()` or null. Each gate passes it as the new `userId` arg to `isSubscribed`/`isUnlocked`.

- [ ] **Step 1: Write `getCurrentUserId`**

```typescript
// lib/auth/currentUser.ts
import { createSSRServerClient } from "@/lib/supabase/ssrServer";

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createSSRServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}
```

- [ ] **Step 2: Wire the module reader page**

In `app/year/.../modules/[moduleId]/page.tsx`, after the existing `deviceId` line (~59):

```typescript
import { getCurrentUserId } from "@/lib/auth/currentUser";
// ...
const userId = await getCurrentUserId();
const subscribed = (userId || deviceId)
  ? await isSubscribed(deviceId ?? "", yearId, subjectId, userId ?? undefined)
  : false;
```

- [ ] **Step 3: Wire `subscription-status` route**

```typescript
import { getCurrentUserId } from "@/lib/auth/currentUser";
// ...inside GET, after reading deviceId:
const userId = await getCurrentUserId();
if (!isUuid(yearId) || (!deviceId && !userId)) {
  return NextResponse.json({ subscribed: false });
}
const subscribed = await isSubscribed(deviceId, yearId, subjectId ?? undefined, userId ?? undefined);
```

- [ ] **Step 4: Wire `activity/[sectionId]` route**

Read `getCurrentUserId()` and pass it to whichever access check the route uses (`isSubscribed`/`isUnlocked`), mirroring Step 3.

- [ ] **Step 5: Typecheck + manual gate check**

Run: `npx tsc --noEmit` (Expected: no errors).
Manual: as an anonymous device with no access, a paid activity stays locked (device fallback intact).

- [ ] **Step 6: Commit**

```bash
git add lib/auth/currentUser.ts "app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx" app/api/subscription-status/route.ts "app/api/activity/[sectionId]/route.ts"
git commit -m "feat(access): pass current user id into paid-content gates"
```

---

### Task 7: Auth server actions (signup, login, logout) + claim on success

**Files:**
- Create: `app/(auth)/actions.ts`
- Test: `app/(auth)/actions.test.ts` (validation-only unit test)

**Interfaces:**
- Consumes: `createSSRServerClient` (Task 2), `claimDeviceRows` (Task 4), `verifyDeviceCookie` + `DEVICE_COOKIE` (`@/lib/auth/deviceCookie`), `createRateLimiter` (`@/lib/rateLimit`).
- Produces server actions:
  - `signUpAction(formData): Promise<{ error?: string }>`
  - `signInAction(formData): Promise<{ error?: string }>`
  - `signOutAction(): Promise<void>`
  Each of signUp/signIn: validates email/password, calls Supabase, then on success reads the signed device cookie and calls `claimDeviceRows(user.id, deviceId)` before redirecting to `next` (default `/account`).

- [ ] **Step 1: Write the failing validation test**

```typescript
// app/(auth)/actions.test.ts
import { describe, it, expect } from "vitest";
import { validateCredentials } from "./actions";

describe("validateCredentials", () => {
  it("rejects a malformed email", () => {
    expect(validateCredentials("nope", "password123")).toMatch(/email/i);
  });
  it("rejects a short password", () => {
    expect(validateCredentials("a@b.com", "short")).toMatch(/password/i);
  });
  it("accepts valid input", () => {
    expect(validateCredentials("a@b.com", "password123")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- actions`
Expected: FAIL (module/function not found).

- [ ] **Step 3: Implement the actions + exported validator**

```typescript
// app/(auth)/actions.ts
"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSSRServerClient } from "@/lib/supabase/ssrServer";
import { claimDeviceRows } from "@/lib/auth/claim";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCredentials(email: string, password: string): string | null {
  if (!EMAIL_RE.test(email)) return "Please enter a valid email address.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

async function claimForUser(userId: string) {
  const jar = await cookies();
  const deviceId = verifyDeviceCookie(jar.get(DEVICE_COOKIE)?.value);
  if (deviceId) await claimDeviceRows(userId, deviceId);
}

export async function signUpAction(formData: FormData): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/account");
  const invalid = validateCredentials(email, password);
  if (invalid) return { error: invalid };

  const supabase = await createSSRServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };
  if (data.user) await claimForUser(data.user.id);
  redirect(next);
}

export async function signInAction(formData: FormData): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/account");
  const invalid = validateCredentials(email, password);
  if (invalid) return { error: invalid };

  const supabase = await createSSRServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid email or password." };
  if (data.user) await claimForUser(data.user.id);
  redirect(next);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSSRServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- actions`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "app/(auth)/actions.ts" "app/(auth)/actions.test.ts"
git commit -m "feat(auth): signup/login/logout server actions with device-row claim"
```

---

### Task 8: Login & signup pages (editorial theme, dark-mode aware)

**Files:**
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/signup/page.tsx`
- Create: `components/AuthForm.tsx`

**Interfaces:**
- Consumes: `signInAction`, `signUpAction` (Task 7).
- Produces: `AuthForm` client component used by both pages — fields email + password, an error region, a submit button, and a hidden `next` input read from the `?next=` query param. Mode prop selects action + copy + link to the other page.

- [ ] **Step 1: Write `AuthForm`**

```tsx
// components/AuthForm.tsx
"use client";
import { useState, useTransition } from "react";

type Action = (fd: FormData) => Promise<{ error?: string }>;

export function AuthForm({ mode, action, next }: { mode: "login" | "signup"; action: Action; next: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const title = mode === "login" ? "Log in" : "Create account";

  return (
    <form
      className="mx-auto mt-24 max-w-sm space-y-4 px-6"
      action={(fd) => start(async () => { const r = await action(fd); if (r?.error) setError(r.error); })}
    >
      <h1 className="font-serif text-3xl text-ink dark:text-ink">{title}</h1>
      <input type="hidden" name="next" value={next} />
      <label className="block text-sm text-ink-muted">Email
        <input name="email" type="email" required autoComplete="email"
          className="mt-1 w-full rounded border border-taupe bg-paper px-3 py-2 text-ink" />
      </label>
      <label className="block text-sm text-ink-muted">Password
        <input name="password" type="password" required minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="mt-1 w-full rounded border border-taupe bg-paper px-3 py-2 text-ink" />
      </label>
      {error && <p role="alert" className="text-sm text-accent">{error}</p>}
      <button type="submit" disabled={pending}
        className="w-full rounded bg-accent px-4 py-2 font-medium text-paper disabled:opacity-60">
        {pending ? "…" : title}
      </button>
      <p className="text-sm text-ink-muted">
        {mode === "login"
          ? <>No account? <a className="text-accent underline" href={`/signup?next=${encodeURIComponent(next)}`}>Sign up</a></>
          : <>Have an account? <a className="text-accent underline" href={`/login?next=${encodeURIComponent(next)}`}>Log in</a></>}
      </p>
    </form>
  );
}
```

- [ ] **Step 2: Write the login page**

```tsx
// app/(auth)/login/page.tsx
import { AuthForm } from "@/components/AuthForm";
import { signInAction } from "../actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthForm mode="login" action={signInAction} next={next ?? "/account"} />;
}
```

- [ ] **Step 3: Write the signup page**

```tsx
// app/(auth)/signup/page.tsx
import { AuthForm } from "@/components/AuthForm";
import { signUpAction } from "../actions";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthForm mode="signup" action={signUpAction} next={next ?? "/account"} />;
}
```

- [ ] **Step 4: Typecheck + manual check**

Run: `npx tsc --noEmit` (Expected: no errors).
Manual: `npm run dev`, visit `/signup`, create an account → lands on `/account` (built next task; for now a 404 is acceptable, just confirm no auth error in console and a Supabase user is created).

- [ ] **Step 5: Commit**

```bash
git add "app/(auth)/login/page.tsx" "app/(auth)/signup/page.tsx" components/AuthForm.tsx
git commit -m "feat(auth): login and signup pages"
```

---

### Task 9: Account dashboard (subjects grid + progress rings)

**Files:**
- Create: `app/account/page.tsx`
- Create: `lib/account.ts`
- Create: `components/account/SubjectCard.tsx`
- Create: `components/account/ProgressRing.tsx`
- Test: `lib/account.test.ts`

**Interfaces:**
- Consumes: `getCurrentUserId` (Task 6), `isSubscribed` (Task 5), `createServerClient` (service role) for reading subjects/modules/progress.
- Produces:
  - `getAccountOverview(userId): Promise<AccountOverview>` where
    `AccountOverview = { yearLabel: string | null; subjects: SubjectSummary[]; overallDone: number; overallTotal: number }`
    and `SubjectSummary = { id, title, yearId, unlocked: boolean, doneCount: number, totalCount: number }`.
  - `ProgressRing({ done, total }: { done: number; total: number })` — SVG ring with center percentage.
  - `SubjectCard({ subject }: { subject: SubjectSummary })` — ring + Continue/Unlock CTA.

- [ ] **Step 1: Write the failing test for the percentage helper**

```typescript
// lib/account.test.ts
import { describe, it, expect } from "vitest";
import { pct } from "./account";

describe("pct", () => {
  it("is 0 when total is 0", () => expect(pct(0, 0)).toBe(0));
  it("rounds to nearest integer percent", () => expect(pct(2, 3)).toBe(67));
  it("caps at 100", () => expect(pct(5, 4)).toBe(100));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- account`
Expected: FAIL (`pct` not found).

- [ ] **Step 3: Implement `lib/account.ts`**

```typescript
// lib/account.ts
import { createServerClient } from "./supabase/server";
import { isSubscribed } from "./subscriptions";

export function pct(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((done / total) * 100));
}

export interface SubjectSummary {
  id: string; title: string; yearId: string;
  unlocked: boolean; doneCount: number; totalCount: number;
}
export interface AccountOverview {
  yearLabel: string | null;
  subjects: SubjectSummary[];
  overallDone: number; overallTotal: number;
}

export async function getAccountOverview(userId: string): Promise<AccountOverview> {
  const supabase = createServerClient();

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, title, year_id, years(label, sort_order)")
    .order("sort_order");

  const { data: progressRows } = await supabase
    .from("module_progress").select("module_id").eq("user_id", userId);
  const doneModuleIds = new Set((progressRows ?? []).map((r) => r.module_id));

  const summaries: SubjectSummary[] = [];
  let overallDone = 0, overallTotal = 0;
  let yearLabel: string | null = null;

  for (const s of subjects ?? []) {
    const { data: mods } = await supabase
      .from("modules").select("id").eq("subject_id", s.id);
    const moduleIds = (mods ?? []).map((m) => m.id);
    const doneCount = moduleIds.filter((id) => doneModuleIds.has(id)).length;
    const unlocked = await isSubscribed("", s.year_id, s.id, userId);
    if (unlocked) { overallDone += doneCount; overallTotal += moduleIds.length; }
    yearLabel = yearLabel ?? (s as any).years?.label ?? null;
    summaries.push({
      id: s.id, title: s.title, yearId: s.year_id,
      unlocked, doneCount, totalCount: moduleIds.length,
    });
  }

  return { yearLabel, subjects: summaries, overallDone, overallTotal };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- account`
Expected: PASS.

- [ ] **Step 5: Implement `ProgressRing`**

```tsx
// components/account/ProgressRing.tsx
import { pct } from "@/lib/account";

export function ProgressRing({ done, total }: { done: number; total: number }) {
  const p = pct(done, total);
  const r = 26, c = 2 * Math.PI * r, off = c - (p / 100) * c;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
      <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-taupe/40" />
      <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="6"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
        transform="rotate(-90 32 32)" className="text-accent" />
      <text x="32" y="36" textAnchor="middle" className="fill-ink text-[13px] font-medium">{p}%</text>
    </svg>
  );
}
```

- [ ] **Step 6: Implement `SubjectCard`**

```tsx
// components/account/SubjectCard.tsx
import Link from "next/link";
import type { SubjectSummary } from "@/lib/account";
import { ProgressRing } from "./ProgressRing";

export function SubjectCard({ subject }: { subject: SubjectSummary }) {
  const href = `/year/${subject.yearId}/subjects/${subject.id}`;
  return (
    <div className="flex items-center gap-4 rounded-lg border border-taupe/50 bg-paper p-4">
      <ProgressRing done={subject.doneCount} total={subject.totalCount} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-serif text-lg text-ink">{subject.title}</h3>
        {subject.unlocked ? (
          <p className="text-sm text-ink-muted">{subject.doneCount}/{subject.totalCount} modules done</p>
        ) : (
          <p className="text-sm text-ink-faint">🔒 Locked</p>
        )}
      </div>
      {subject.unlocked ? (
        <Link href={href} className="rounded bg-accent px-3 py-1.5 text-sm text-paper">Continue</Link>
      ) : (
        <Link href={href} className="rounded border border-accent px-3 py-1.5 text-sm text-accent">Unlock ₱50</Link>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Implement the account page (redirects anon to login)**

```tsx
// app/account/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { getAccountOverview } from "@/lib/account";
import { SubjectCard } from "@/components/account/SubjectCard";
import { ProgressRing } from "@/components/account/ProgressRing";
import { signOutAction } from "../(auth)/actions";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?next=/account");
  const overview = await getAccountOverview(userId);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8 flex items-center gap-5">
        <ProgressRing done={overview.overallDone} total={overview.overallTotal} />
        <div className="flex-1">
          <h1 className="font-serif text-3xl text-ink">My Account</h1>
          <p className="text-sm text-ink-muted">
            {overview.yearLabel ?? "BSIT"} · {overview.overallDone}/{overview.overallTotal} modules done
          </p>
        </div>
        <form action={signOutAction}>
          <button className="text-sm text-ink-muted underline">Log out</button>
        </form>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {overview.subjects.map((s) => <SubjectCard key={s.id} subject={s} />)}
      </div>
    </main>
  );
}
```

- [ ] **Step 8: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add app/account/page.tsx lib/account.ts lib/account.test.ts components/account/
git commit -m "feat(account): dashboard with subjects grid and progress rings"
```

---

### Task 10: Header account control + SubscribeGate login redirect

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/AccountNav.tsx`
- Modify: `components/SubscribeGate.tsx`

**Interfaces:**
- Consumes: `getCurrentUserId` (Task 6).
- Produces: header shows "My Account" (signed in) or "Log in" (anon) next to `ThemeToggle`. `SubscribeGate`: if not logged in, the Subscribe buttons link to `/login?next=<path>` instead of starting payment.

- [ ] **Step 1: Create `AccountNav` (server component)**

```tsx
// components/AccountNav.tsx
import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth/currentUser";

export async function AccountNav() {
  const userId = await getCurrentUserId();
  return (
    <Link href={userId ? "/account" : "/login"}
      className="fixed right-16 top-4 z-50 text-sm text-ink-muted underline">
      {userId ? "My Account" : "Log in"}
    </Link>
  );
}
```

- [ ] **Step 2: Mount it in the root layout next to ThemeToggle**

In `app/layout.tsx`, import and render `<AccountNav />` alongside the existing `<ThemeToggle />`. (Suspense-wrap if needed since it's async.)

- [ ] **Step 3: Gate the Subscribe buttons on auth**

In `components/SubscribeGate.tsx`, accept whether the user is logged in. Simplest approach: add a `loggedIn: boolean` prop passed from the server component that renders the gate; when `false`, render a "Log in to subscribe" link to `/login?next=<current path>` in place of the Subscribe buttons. Pass `loggedIn={!!(await getCurrentUserId())}` from the module page that renders `SubscribeGate`.

```tsx
// inside SubscribeGate render, before the pay buttons:
if (!loggedIn) {
  return (
    <a href={`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}
       className="inline-block rounded bg-accent px-4 py-2 text-paper">
      Log in to subscribe
    </a>
  );
}
```

- [ ] **Step 4: Typecheck + manual check**

Run: `npx tsc --noEmit` (Expected: no errors).
Manual: logged out, a locked activity shows "Log in to subscribe" → clicking goes to `/login?next=...`; after login, returns and shows the normal Subscribe buttons.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx components/AccountNav.tsx components/SubscribeGate.tsx
git commit -m "feat(account): header account link + gate subscribe behind login"
```

---

### Task 11: Bind payments to the user in checkout + webhook

**Files:**
- Modify: `lib/paymongo.ts` (remarks builder — locate where `device:` is written)
- Modify: the checkout/link-creation route that builds `remarks` (find with grep)
- Modify: `app/api/webhooks/paymongo/route.ts`
- Test: extend `lib/paymongo.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: payment-link `remarks` include `user:<userId>` when the buyer is logged in; the webhook parses `user:` and writes `user_id` onto the `subscriptions` and `payments` rows (in addition to `device_id`). Device-only remarks remain fully supported (backward compatible).

- [ ] **Step 1: Find the remarks builder and checkout route**

Run: `grep -rn "device:" lib app --include=*.ts | grep -v test`
Expected: the line(s) constructing `remarks`. Note the file + function.

- [ ] **Step 2: Write the failing webhook-parse test**

```typescript
// lib/paymongo.test.ts — add
it("parses an optional user id from remarks", () => {
  const remarks = "year:11111111-1111-1111-1111-111111111111 device:22222222-2222-2222-2222-222222222222 user:33333333-3333-3333-3333-333333333333";
  expect(remarks.match(/user:([^\s]+)/)?.[1]).toBe("33333333-3333-3333-3333-333333333333");
});
```

(If a `parseRemarks` helper is introduced, test that helper instead.)

- [ ] **Step 3: Add `user:` to the remarks builder**

Where `remarks` is built, append ` user:${userId}` when a logged-in user id is available. The checkout route gets the user id via `getCurrentUserId()` and passes it through.

- [ ] **Step 4: Parse + persist `user_id` in the webhook**

In `app/api/webhooks/paymongo/route.ts`, after the existing `deviceMatch`:

```typescript
const userMatch = remarks.match(/user:([^\s]+)/);
const userId = userMatch && isUuid(userMatch[1]) ? userMatch[1] : null;
```

Then include `user_id: userId` in the `subscriptions` upsert and the `recordPayment` insert payloads (add the column to those write objects). Device fields stay as-is.

- [ ] **Step 5: Run tests**

Run: `npm test -- paymongo`
Expected: PASS. Also `npx tsc --noEmit` clean.

- [ ] **Step 6: Commit**

```bash
git add lib/paymongo.ts lib/paymongo.test.ts app/api/webhooks/paymongo/route.ts
git commit -m "feat(payments): bind payment to user_id via remarks + webhook"
```

---

### Task 12: Full-suite verification + run the dashboard locally

**Files:** none (verification only)

- [ ] **Step 1: Run the entire test suite**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 2: Typecheck + lint + build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: no errors; build succeeds.

- [ ] **Step 3: Run the app and walk the full flow locally**

Run: `npm run dev`. Then in the browser:
1. Sign up at `/signup` → redirected to `/account`.
2. **Confirm the dashboard renders**: header with overall progress ring + the subjects grid with per-subject rings, Continue (unlocked) / Unlock ₱50 (locked) CTAs. **(This is the explicit deliverable the user asked to see locally.)**
3. Log out → header shows "Log in"; visiting `/account` redirects to `/login`.
4. Log back in → lands on `/account` with the same state (session + claim working).
5. Open a locked activity while logged out → "Log in to subscribe" → login → returns to the activity with Subscribe buttons.

- [ ] **Step 4: Re-check security advisors**

Run Supabase MCP `get_advisors` (type: security). Expected: no new advisories introduced by this work.

- [ ] **Step 5: Final commit (if any verification fixups were needed)**

```bash
git add -A
git commit -m "chore(account): verification fixups for user accounts"
```

---

## Notes for the executor

- The existing service-role `createServerClient()` (in `lib/supabase/server.ts`) is for **trusted server writes** (webhook, progress, admin). The new `createSSRServerClient()` is the **user-session** client. Don't confuse them: gates resolve identity with the SSR client (`getCurrentUserId`) but read data with the service-role client to avoid RLS friction on server reads.
- `claimDeviceRows` is the linchpin for not breaking existing payers — keep its `user_id IS NULL` filter; removing it would let a login steal another account's claimed rows.
- Email confirmation is off in Supabase Auth settings for now; if signups error with "Email not confirmed", disable confirmation in the Supabase dashboard (Authentication → Providers → Email).
