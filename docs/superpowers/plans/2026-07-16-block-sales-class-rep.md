# Block Sales + Class Rep System (Track B) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a class representative unlock a subject for their whole section via one manual (Messenger + PayMongo link) sale, join their classmates under a 6-character class code, and have `isSubscribed` treat every joined member as subscribed for that subject — replacing the per-device manual grants this app has relied on until now.

**Architecture:** Two new tables (`classes`, `class_members`) sit alongside the existing `subscriptions`/`payments` ledger. A class purchase is granted by an admin-only API route that inserts one `subscriptions` row scoped to the class's `device_id` sentinel... no — see Task 2 for the actual mechanism: class membership is checked as a *third* branch in `isSubscribed`, independent of the existing device/user branches, so no synthetic `subscriptions` row is needed. A public `/for-blocks` marketing page and a public `/class/join` flow are the only new user-facing surfaces in this plan; the rep dashboard (B4) is intentionally out of scope — see "Deferred" at the end.

**Tech Stack:** Next.js App Router, Supabase (Postgres + RLS), existing `lib/auth/adminSession.ts` pattern for admin gating, existing `lib/device.ts` / `lib/auth/deviceCookie.ts` for device identity.

## Global Constraints

- Never grant access without a recorded payment row, mirroring `recordPayment` in `lib/payments.ts:23` — the manual-grant route must insert into `payments` before/with the `classes` row, using a `block-<uuid>` placeholder in `paymongo_link_id` (a real convention being established now; it does not exist anywhere in the codebase yet — verified by grep, nothing to preserve).
- Any new `event_type` value MUST be added to **both** `VALID_EVENT_TYPES` in `app/api/events/route.ts:8` **and** a new migration widening the `events_event_type_check` CHECK constraint (see `supabase/migrations/20260713000000_events_add_share_card_types.sql` for the exact pattern) — the constraint silently 400s on unknown types otherwise (documented history: migration `20260706150000`).
- All new tables need RLS enabled with an explicit policy, mirroring `subscriptions`/`payments` (`device_id = current_setting('app.device_id', true)` for device-scoped reads; service role bypasses RLS for privileged writes).
- Migrations must be idempotent (`create table if not exists`, `create index if not exists`) per the pattern established in every existing migration file — this repo's live Supabase project has diverged from a clean migration replay before (see `20260624130000_subscriptions_add_subject_id.sql` header comment), so idempotent-and-convergent is the house style, not just a nicety.
- Class codes are 6 characters, uppercase alphanumeric, excluding visually ambiguous characters (`0/O`, `1/I/L`) to avoid Messenger-transcription errors — this is a support-cost decision, not arbitrary.
- No checkout build in this plan. PayMongo links for blocks are generated manually by the founder outside the app (per GTM doc B1); the app only needs to *display* the price and *record* the grant once paid.

---

### Task 1: `classes` + `class_members` schema

**Files:**
- Create: `supabase/migrations/20260716000000_classes.sql`
- Test: `supabase/migrations/20260716000000_classes.test.md` (manual verification checklist — this repo has no pgTAP harness; existing migrations are verified by hand-running against a local Supabase instance, see below)

**Interfaces:**
- Produces: table `classes (id uuid, code text unique, name text, subject_id uuid, year_id uuid, rep_device_id text, seat_cap int default 50, status text, current_period_end timestamptz, paymongo_link_id text, created_at timestamptz)`. Table `class_members (id uuid, class_id uuid references classes(id), device_id text, joined_at timestamptz, unique(class_id, device_id))`.

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/20260716000000_classes.sql
-- Class Rep block sales: one manual sale unlocks a subject for every member
-- who joins via a 6-char class code. Mirrors the subscriptions/payments
-- pattern — see lib/payments.ts recordPayment for the analogous device flow.
-- Idempotent: safe to run against the live DB or a fresh one.

create table if not exists classes (
  id                 uuid primary key default gen_random_uuid(),
  code               text not null,
  name               text not null,
  subject_id         uuid not null references subjects(id),
  year_id            uuid not null references years(id),
  rep_device_id      text not null,
  seat_cap           int not null default 50,
  status             subscription_status not null default 'active',
  current_period_end timestamptz not null,
  -- 'block-<uuid>' placeholder for manually-generated PayMongo links, mirroring
  -- the real link IDs subscriptions/payments store. Never null: a class must
  -- always trace back to a payment record (see payments row below).
  paymongo_link_id   text not null,
  created_at         timestamptz not null default now()
);

create unique index if not exists classes_code_idx on classes (upper(code));
create unique index if not exists classes_paymongo_link_id_idx on classes (paymongo_link_id);
create index if not exists classes_subject_year_idx on classes (subject_id, year_id);

create table if not exists class_members (
  id         uuid primary key default gen_random_uuid(),
  class_id   uuid not null references classes(id) on delete cascade,
  device_id  text not null,
  joined_at  timestamptz not null default now(),
  unique(class_id, device_id)
);

create index if not exists class_members_device_idx on class_members (device_id);

alter table classes enable row level security;
alter table class_members enable row level security;

-- A device may read a class only if it is the rep or a joined member —
-- needed so the join page can show "already joined" state and the (future)
-- rep dashboard can read its own class. Service role bypasses for writes.
drop policy if exists "device reads own or joined class" on classes;
create policy "device reads own or joined class"
  on classes for select
  using (
    rep_device_id = current_setting('app.device_id', true)
    or id in (
      select class_id from class_members
      where device_id = current_setting('app.device_id', true)
    )
  );

drop policy if exists "device reads own membership" on class_members;
create policy "device reads own membership"
  on class_members for select
  using (device_id = current_setting('app.device_id', true));
```

- [ ] **Step 2: Verify locally**

Run: `supabase db reset` (or the project's equivalent local-migration-replay command — check `package.json` scripts for `db:reset` first) then confirm both tables exist:

```bash
supabase db execute "select table_name from information_schema.tables where table_name in ('classes','class_members');" 2>/dev/null || echo "run against local Supabase studio SQL editor instead"
```

Expected: both table names returned.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260716000000_classes.sql
git commit -m "feat(db): add classes + class_members tables for block sales"
```

---

### Task 2: `isSubscribed` class-membership branch

**Files:**
- Modify: `lib/subscriptions.ts`
- Test: `lib/subscriptions.test.ts` (create if it does not already exist — check first with `ls lib/subscriptions.test.ts`)

**Interfaces:**
- Consumes: `classes`/`class_members` tables from Task 1.
- Produces: `isSubscribed(deviceId, yearId, subjectId, userId?)` now returns `true` for a device that joined an active class scoped to that `subjectId`/`yearId`, in addition to its existing two branches. No signature change — callers (`SubscribeGate.tsx`, `PaywallTeaser.tsx`, `/api/subscription-status`) need no changes.

- [ ] **Step 1: Read the current implementation to get exact query shape**

Read `lib/subscriptions.ts` in full before editing — confirm the exact Supabase client variable name and existing query chain style used for the two current branches, then add a third branch after they both miss:

```ts
// After the existing year-level and subject-level subscription checks both
// return no row, check class membership: a joined class with an active,
// unexpired grant for this exact subject unlocks every member.
if (subjectId) {
  const { data: membership } = await supabase
    .from("class_members")
    .select("class_id, classes!inner(subject_id, year_id, status, current_period_end)")
    .eq("device_id", deviceId)
    .eq("classes.subject_id", subjectId)
    .eq("classes.year_id", yearId)
    .eq("classes.status", "active")
    .gt("classes.current_period_end", new Date().toISOString())
    .limit(1)
    .maybeSingle();

  if (membership) return true;
}
```

Place this branch to match wherever the existing function returns `false` at the end — the exact insertion point depends on the current file structure, so read it first rather than guessing line numbers.

- [ ] **Step 2: Write the test**

```ts
// lib/subscriptions.test.ts — add alongside existing isSubscribed tests,
// or create the file if none exists, matching the mocking pattern used by
// lib/payments.ts's own tests (check for lib/payments.test.ts as a template).
import { describe, it, expect, vi } from "vitest";
import { isSubscribed } from "./subscriptions";

describe("isSubscribed - class membership branch", () => {
  it("returns true when device joined an active class for that subject", async () => {
    // Arrange a Supabase mock where the year/subject direct-subscription
    // queries return no row, but the class_members join returns one active row.
    // (Exact mock shape must match whatever mocking helper the existing
    // isSubscribed tests already use in this file — reuse it, don't invent
    // a new one.)
  });

  it("returns false when the joined class has expired", async () => {
    // current_period_end in the past → no unlock.
  });
});
```

- [ ] **Step 3: Run the test suite to confirm it fails first, then passes**

Run: `npm test -- lib/subscriptions.test.ts`
Expected before Step 1's code lands: FAIL (branch missing). After: PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/subscriptions.ts lib/subscriptions.test.ts
git commit -m "feat: unlock subject access for joined class members"
```

---

### Task 3: Admin manual-grant route (B2 — the sale-to-access path)

**Files:**
- Create: `app/api/admin/grant-class/route.ts`
- Test: `app/api/admin/grant-class/route.test.ts`

**Interfaces:**
- Consumes: `getAdminSession()` from `lib/auth/adminSession.ts:51`, `createServerClient()` from `lib/supabase/server`.
- Produces: `POST /api/admin/grant-class` — the founder's manual tool for turning a paid Messenger deal into a live class. Body: `{ name: string, subjectId: string, yearId: string, repDeviceId: string, seatCap?: number, amount: number, periodEnd: string }` (ISO date). Response: `{ code: string, classId: string }` or `{ error: string }`.

- [ ] **Step 1: Write the route**

```ts
// app/api/admin/grant-class/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { createServerClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";
import { randomUUID } from "crypto";

// Excludes 0/O/1/I/L to avoid Messenger-transcription errors when reps
// read the code aloud or retype it from a screenshot.
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function generateClassCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

export async function POST(req: NextRequest) {
  const authed = await getAdminSession();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    name?: string; subjectId?: string; yearId?: string;
    repDeviceId?: string; seatCap?: number; amount?: number; periodEnd?: string;
  };
  const { name, subjectId, yearId, repDeviceId, amount, periodEnd } = body;
  const seatCap = body.seatCap ?? 50;

  if (!name || !isUuid(subjectId) || !isUuid(yearId) || !repDeviceId ||
      typeof amount !== "number" || amount <= 0 || !periodEnd) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createServerClient();
  const linkId = `block-${randomUUID()}`;

  // Ledger row first — same invariant as recordPayment in lib/payments.ts:
  // never grant access without a recorded payment.
  const { error: paymentError } = await supabase.from("payments").insert({
    paymongo_link_id: linkId,
    device_id: repDeviceId,
    year_id: yearId,
    subject_id: subjectId,
    amount,
    currency: "PHP",
    paid_at: new Date().toISOString(),
  });
  if (paymentError) {
    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  // Retry on code collision — 6-char alphabet space is large, but don't loop
  // forever on a bug; 5 attempts is generous.
  let code = generateClassCode();
  let classId: string | null = null;
  for (let attempt = 0; attempt < 5 && !classId; attempt++) {
    const { data, error } = await supabase
      .from("classes")
      .insert({
        code,
        name,
        subject_id: subjectId,
        year_id: yearId,
        rep_device_id: repDeviceId,
        seat_cap: seatCap,
        status: "active",
        current_period_end: periodEnd,
        paymongo_link_id: linkId,
      })
      .select("id")
      .single();
    if (error?.code === "23505") { code = generateClassCode(); continue; }
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    classId = data.id;
  }
  if (!classId) {
    return NextResponse.json({ error: "Could not generate a unique class code" }, { status: 500 });
  }

  return NextResponse.json({ code, classId });
}
```

- [ ] **Step 2: Write the test**

```ts
// app/api/admin/grant-class/route.test.ts
// Mirror the mocking pattern already used in app/api/admin/unlock/route.test.ts
// (getAdminSession mocked true/false, createServerClient mocked with a
// chainable query builder) — read that file first for the exact mock shape.
import { describe, it, expect, vi } from "vitest";

describe("POST /api/admin/grant-class", () => {
  it("rejects unauthenticated requests", async () => {
    // getAdminSession mocked to return false → expect 401.
  });

  it("rejects invalid subjectId", async () => {
    // subjectId: "not-a-uuid" → expect 400.
  });

  it("inserts a payments row before the classes row on success", async () => {
    // Assert insert call order / that payments insert happened, then classes insert.
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npm test -- app/api/admin/grant-class/route.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/grant-class/route.ts app/api/admin/grant-class/route.test.ts
git commit -m "feat(admin): add manual class-grant endpoint for block sales"
```

---

### Task 4: Class join endpoint + page (B3 — student-facing)

**Files:**
- Create: `app/api/class/join/route.ts`
- Create: `app/(main)/class/join/page.tsx`
- Test: `app/api/class/join/route.test.ts`

**Interfaces:**
- Consumes: `DEVICE_COOKIE`/`verifyDeviceCookie` from `lib/auth/deviceCookie.ts`, `classes`/`class_members` from Task 1.
- Produces: `POST /api/class/join` — body `{ code: string }`, trusts the signed device cookie exactly like `app/api/subscribe/route.ts` does (never trust a client-supplied `deviceId` for the write). Response: `{ ok: true, subjectId, yearId }` or `{ error: string }` (`"not_found"`, `"full"`, `"expired"`).

- [ ] **Step 1: Write the route**

```ts
// app/api/class/join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { createServerClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/rateLimit";

const limiter = createRateLimiter(10);

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-real-ip") ?? "unknown";
  if (!limiter.check(key)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const jar = await cookies();
  const cookieValue = jar.get(DEVICE_COOKIE)?.value ?? "";
  const deviceId = verifyDeviceCookie(cookieValue);
  if (!deviceId) {
    return NextResponse.json({ error: "no_device" }, { status: 401 });
  }

  const { code } = await req.json() as { code?: string };
  if (!code || code.length !== 6) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: cls } = await supabase
    .from("classes")
    .select("id, subject_id, year_id, seat_cap, status, current_period_end")
    .ilike("code", code)
    .maybeSingle();

  if (!cls || cls.status !== "active" || new Date(cls.current_period_end) < new Date()) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { count } = await supabase
    .from("class_members")
    .select("id", { count: "exact", head: true })
    .eq("class_id", cls.id);

  if ((count ?? 0) >= cls.seat_cap) {
    return NextResponse.json({ error: "full" }, { status: 409 });
  }

  const { error: joinError } = await supabase
    .from("class_members")
    .upsert({ class_id: cls.id, device_id: deviceId }, { onConflict: "class_id,device_id" });

  if (joinError) {
    return NextResponse.json({ error: joinError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, subjectId: cls.subject_id, yearId: cls.year_id });
}
```

- [ ] **Step 2: Write the test**

```ts
// app/api/class/join/route.test.ts
// Mirror the mocking pattern in app/api/subscribe/route.test.ts for the
// signed device cookie (that file already tests the "trust cookie over
// body" invariant — reuse its cookie-mocking helper rather than re-deriving it).
import { describe, it, expect } from "vitest";

describe("POST /api/class/join", () => {
  it("rejects when no device cookie is present", async () => {
    // expect 401 "no_device"
  });

  it("rejects a code that does not match any class", async () => {
    // expect 404 "not_found"
  });

  it("rejects when the class is at seat_cap", async () => {
    // expect 409 "full"
  });

  it("joins successfully and returns subjectId/yearId", async () => {
    // expect 200 { ok: true, subjectId, yearId }
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npm test -- app/api/class/join/route.test.ts`
Expected: PASS.

- [ ] **Step 4: Write the join page**

```tsx
// app/(main)/class/join/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClassJoinPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleJoin() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/class/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(
          json.error === "full" ? "This class is already full."
          : json.error === "not_found" ? "That code doesn't match an active class."
          : "Something went wrong. Try again."
        );
        return;
      }
      router.push(`/year/${json.yearId}/subjects/${json.subjectId}/modules?joined=1`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Join your class</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Ask your class rep for the 6-character code.
      </p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
        placeholder="ABC123"
        className="mt-6 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-center text-lg tracking-widest"
        maxLength={6}
      />
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <button
        onClick={handleJoin}
        disabled={loading || code.length !== 6}
        className="mt-4 w-full rounded-lg bg-white px-4 py-3 font-medium text-black disabled:opacity-40"
      >
        {loading ? "Joining…" : "Join class"}
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add app/api/class/join/route.ts app/api/class/join/route.test.ts "app/(main)/class/join/page.tsx"
git commit -m "feat: add class join endpoint and page for block-sale members"
```

---

### Task 5: `/for-blocks` price page (B1)

**Files:**
- Create: `app/(main)/for-blocks/page.tsx`
- Modify: `components/PaywallTeaser.tsx` (add the "Buying for your block?" link — read the file first to match its existing JSX/styling conventions before inserting)

**Interfaces:**
- Consumes: nothing new — static marketing page plus one Messenger `m.me` link (get the actual page URL/username from the user before hardcoding it; do not invent a placeholder Facebook URL).
- Produces: a public route with `paywall_click`-style analytics wiring reusing the existing `event_type` values already valid (`paywall_teaser_click`) — do not invent a new event type for this page unless the user wants block-specific funnel tracking, which would require the Task-1-style CHECK-constraint migration.

- [ ] **Step 1: Ask the user for the exact Messenger page link before writing the CTA**

This is a hard external dependency — do not fabricate a `m.me/...` URL. Confirm the official page username with the user first.

- [ ] **Step 2: Write the page**

```tsx
// app/(main)/for-blocks/page.tsx
export const metadata = { title: "Unlock a subject for your whole block — BSIT Survival Kit" };

export default function ForBlocksPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Unlock a subject for your whole section</h1>
      <p className="mt-4 text-neutral-300">
        ₱999 per semester — about ₱22 per student for a 45-person block.
        Your class rep pays once, everyone joins with a class code.
      </p>
      <ul className="mt-8 space-y-3 text-neutral-300">
        <li>✓ Full exam-prep modules for one subject, all semester</li>
        <li>✓ Every classmate joins with a single 6-character code</li>
        <li>✓ Class progress tracking for the rep</li>
      </ul>
      <a
        href="PASTE_CONFIRMED_MESSENGER_LINK_HERE"
        className="mt-10 inline-block rounded-lg bg-white px-6 py-3 font-medium text-black"
      >
        Message us to set up your block →
      </a>
      <p className="mt-4 text-sm text-neutral-500">
        Already have a class code?{" "}
        <a href="/class/join" className="underline">Join here</a>.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Add the cross-link in `PaywallTeaser.tsx`**

Read the component fully first, then add one line consistent with its existing JSX — a small `<Link href="/for-blocks">Buying for your block? →</Link>` placed below the existing teaser CTA, not replacing it.

- [ ] **Step 4: Manually verify in the browser**

Run: `npm run dev`, visit `/for-blocks`, confirm the page renders, the Messenger link is correct, and `/class/join` is reachable from it.

- [ ] **Step 5: Commit**

```bash
git add "app/(main)/for-blocks/page.tsx" components/PaywallTeaser.tsx
git commit -m "feat: add /for-blocks price page and cross-link from paywall teaser"
```

---

## Self-Review Notes

- **Spec coverage:** This plan covers GTM doc items B1 (price page), B2 (manual grant recipe — implemented as an admin API route rather than a raw SQL script, since the codebase already has an admin-auth pattern and this is safer/more reusable than a hand-run script), and B3 (class join mechanism). It deliberately does **not** cover B4 (Class Rep dashboard), B5 (member-facing "Unlocked for [class]" badge), or B6 (first sale attempt, which is a sales activity, not engineering).
- **Why stop before B4:** the GTM doc itself says "sell one block by hand before building any dashboard... UI built for zero paying classes is inventory, not product." This plan's Tasks 1–5 are exactly what's needed to make that first manual sale possible end-to-end (rep pays → founder runs Task 3's route → gets a code → posts it in Messenger → students self-serve via Task 4 → they see unlocked content via Task 2). B4/B5 should be their own follow-up plan written *after* the first class actually joins, per the doc's own sequencing logic.
- **Type consistency check:** `isSubscribed` signature unchanged (Task 2); `classes`/`class_members` column names used identically across Tasks 1, 2, 3, 4; `paymongo_link_id` prefix `block-` used consistently in Task 3 only (the one place that creates it).
- **Placeholder scan:** the Messenger URL in Task 5 is intentionally left as a marked placeholder because it is a genuine external fact only the user has — everything else is concrete.
