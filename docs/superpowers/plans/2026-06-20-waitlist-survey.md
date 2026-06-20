# Waitlist + Survey System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture email, name, and intent signals from two high-intent user groups (coming-soon visitors and paywall-blocked readers), tie them to existing device analytics, and surface the data in the admin dashboard.

**Architecture:** A single `POST /api/waitlist` route handles both sources with server-side device detection. Two UI entry points — an extended `ComingSoonModal` and a new inline `WaitlistBanner` — each POST with a different `source` value. The admin dashboard gains a new Waitlist section fed by a new query in the existing admin page.

**Tech Stack:** Next.js 14 App Router, Supabase (postgres + RLS), TypeScript, Tailwind CSS.

## Global Constraints

- Never add `Co-Authored-By` to commit messages — lauurnce is sole contributor
- Follow existing Tailwind token conventions: `font-mono`, `font-serif`, `font-sans`, `text-ink`, `text-ink-muted`, `text-ink-faint`, `text-taupe`, `text-paper`, `bg-paper`, `bg-navy`, `border-ink-faint/30`, `text-accent`
- Match existing label class pattern: `font-mono text-label-sm uppercase tracking-[0.12em]`
- All client components must have `"use client"` at top
- Migration filename format: `20260620HHMMSS_<name>.sql`
- No new dependencies — use only what is already in `package.json`
- `lib/device.ts` has `"use client"` at top — the new `getDeviceType` export must NOT carry that directive (it runs server-side only); add it as a separate server-only utility

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `supabase/migrations/20260620000000_create_waitlist.sql` | Create | DB table + RLS |
| `lib/supabase/types.ts` | Modify | Add `waitlist` table type |
| `lib/deviceType.ts` | Create | `getDeviceType(ua)` server util |
| `app/api/waitlist/route.ts` | Create | POST handler |
| `components/WaitlistBanner.tsx` | Create | Inline paywall banner |
| `components/LockedSection.tsx` | Modify | Render `WaitlistBanner` when locked |
| `components/ComingSoonModal.tsx` | Modify | Add waitlist form as second screen |
| `app/page.tsx` | Modify | Add footer privacy notice |
| `app/admin/page.tsx` | Modify | Fetch waitlist rows |
| `components/AdminDashboard.tsx` | Modify | Render Waitlist section |

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260620000000_create_waitlist.sql`
- Modify: `lib/supabase/types.ts`

**Interfaces:**
- Produces: `waitlist` table with columns `id`, `email`, `name`, `device_id`, `source`, `willing_to_pay`, `needs_capstone`, `device_type`, `created_at`; unique constraint on `(email, source)`

- [ ] **Step 1: Write the migration file**

Create `supabase/migrations/20260620000000_create_waitlist.sql`:

```sql
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null,
  device_id text not null,
  source text not null check (source in ('coming_soon', 'paywall')),
  willing_to_pay text check (willing_to_pay in ('yes', 'no', 'maybe')),
  needs_capstone boolean,
  device_type text not null check (device_type in ('mobile', 'desktop')),
  created_at timestamptz not null default now(),
  unique (email, source)
);

alter table public.waitlist enable row level security;

create policy "service role only" on public.waitlist
  using (false)
  with check (false);
```

- [ ] **Step 2: Apply the migration**

```bash
npx supabase db push
```

Expected: migration applies cleanly, `waitlist` table appears in Supabase dashboard.

- [ ] **Step 3: Add the type to `lib/supabase/types.ts`**

Inside the `Tables` object in the `Database` interface, add after the `module_progress` entry:

```typescript
      waitlist: {
        Row: {
          id: string;
          email: string;
          name: string;
          device_id: string;
          source: "coming_soon" | "paywall";
          willing_to_pay: "yes" | "no" | "maybe" | null;
          needs_capstone: boolean | null;
          device_type: "mobile" | "desktop";
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          device_id: string;
          source: "coming_soon" | "paywall";
          willing_to_pay?: "yes" | "no" | "maybe" | null;
          needs_capstone?: boolean | null;
          device_type: "mobile" | "desktop";
          created_at?: string;
        };
        Update: Partial<{
          willing_to_pay: "yes" | "no" | "maybe" | null;
          needs_capstone: boolean | null;
        }>;
      };
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260620000000_create_waitlist.sql lib/supabase/types.ts
git commit -m "feat(db): add waitlist table with source, survey fields, and RLS"
```

---

## Task 2: Device Type Utility

**Files:**
- Create: `lib/deviceType.ts`

**Interfaces:**
- Produces: `getDeviceType(userAgent: string): "mobile" | "desktop"` — pure function, no side effects, server-safe (no `"use client"`)

- [ ] **Step 1: Write the failing test**

Create `lib/deviceType.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { getDeviceType } from "./deviceType";

describe("getDeviceType", () => {
  it("detects iPhone as mobile", () => {
    expect(getDeviceType("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe("mobile");
  });

  it("detects Android as mobile", () => {
    expect(getDeviceType("Mozilla/5.0 (Linux; Android 14; Pixel 8)")).toBe("mobile");
  });

  it("detects iPad as mobile", () => {
    expect(getDeviceType("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe("mobile");
  });

  it("detects generic Mobile token as mobile", () => {
    expect(getDeviceType("Mozilla/5.0 (Linux; Mobile)")).toBe("mobile");
  });

  it("detects Windows desktop as desktop", () => {
    expect(getDeviceType("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")).toBe("desktop");
  });

  it("detects Mac desktop as desktop", () => {
    expect(getDeviceType("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15")).toBe("desktop");
  });

  it("returns desktop for empty string", () => {
    expect(getDeviceType("")).toBe("desktop");
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx vitest run lib/deviceType.test.ts
```

Expected: FAIL — `Cannot find module './deviceType'`

- [ ] **Step 3: Write the implementation**

Create `lib/deviceType.ts`:

```typescript
const MOBILE_RE = /Android|iPhone|iPad|Mobile/i;

export function getDeviceType(userAgent: string): "mobile" | "desktop" {
  return MOBILE_RE.test(userAgent) ? "mobile" : "desktop";
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run lib/deviceType.test.ts
```

Expected: 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/deviceType.ts lib/deviceType.test.ts
git commit -m "feat(lib): add getDeviceType server utility"
```

---

## Task 3: API Route

**Files:**
- Create: `app/api/waitlist/route.ts`

**Interfaces:**
- Consumes: `getDeviceType(ua: string)` from `lib/deviceType.ts`; `createServerClient()` from `lib/supabase/server.ts`; `Database["public"]["Tables"]["waitlist"]["Insert"]` from `lib/supabase/types.ts`
- Produces: `POST /api/waitlist` — accepts JSON body, returns `{ success: true }` on 200, `{ error: string }` on 400

**Request body shape:**
```typescript
{
  email: string;
  name: string;
  device_id: string;
  source: "coming_soon" | "paywall";
  willing_to_pay?: "yes" | "no" | "maybe" | null;
  needs_capstone?: boolean | null;
}
```

- [ ] **Step 1: Create the API route**

Create `app/api/waitlist/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getDeviceType } from "@/lib/deviceType";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, name, device_id, source, willing_to_pay, needs_capstone } = body;

  if (!email || !name || !device_id || !source) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (source !== "coming_soon" && source !== "paywall") {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  }

  const ua = req.headers.get("user-agent") ?? "";
  const device_type = getDeviceType(ua);

  const supabase = createServerClient();

  await supabase.from("waitlist").upsert(
    {
      email,
      name,
      device_id,
      source,
      willing_to_pay: willing_to_pay ?? null,
      needs_capstone: needs_capstone ?? null,
      device_type,
    },
    { onConflict: "email,source", ignoreDuplicates: true }
  );

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Smoke-test the route manually**

Start dev server: `npm run dev`

In another terminal:
```bash
curl -s -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test","device_id":"test-device-1","source":"paywall","willing_to_pay":"yes"}' \
  | jq .
```

Expected output:
```json
{ "success": true }
```

Run again with same email+source — should still return `{ "success": true }` (silent dedup).

Check Supabase dashboard → Table Editor → `waitlist` — one row should exist.

- [ ] **Step 4: Test missing field validation**

```bash
curl -s -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' \
  | jq .
```

Expected: `{ "error": "Missing required fields" }` with HTTP 400.

- [ ] **Step 5: Commit**

```bash
git add app/api/waitlist/route.ts
git commit -m "feat(api): add POST /api/waitlist with dedup and device detection"
```

---

## Task 4: WaitlistBanner Component

**Files:**
- Create: `components/WaitlistBanner.tsx`
- Modify: `components/LockedSection.tsx` (lines 98–115 — the `"locked"` return block)

**Interfaces:**
- Consumes: `getDeviceId()` from `lib/device.ts`; `POST /api/waitlist`
- Produces: `<WaitlistBanner />` — no props needed (reads device_id internally)

- [ ] **Step 1: Create `components/WaitlistBanner.tsx`**

```typescript
"use client";

import { useState } from "react";
import { getDeviceId } from "@/lib/device";

type WillingToPay = "yes" | "no" | "maybe";

export function WaitlistBanner() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [willingToPay, setWillingToPay] = useState<WillingToPay | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !willingToPay) return;
    setLoading(true);
    await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        device_id: getDeviceId(),
        source: "paywall",
        willing_to_pay: willingToPay,
      }),
    });
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="border border-ink-faint/30 px-6 py-5 mt-4 max-w-sm">
        <p className="font-sans text-sm text-ink-muted">Thanks! We'll keep you posted.</p>
      </div>
    );
  }

  const toggleBtnBase =
    "font-mono text-label-sm uppercase tracking-[0.12em] px-4 py-2 border transition-colors duration-150";
  const activeBtn = "border-ink bg-ink text-paper";
  const inactiveBtn = "border-ink-faint/30 text-ink-muted hover:border-ink hover:text-ink";

  return (
    <form onSubmit={handleSubmit} className="border border-ink-faint/30 px-6 py-5 mt-4 max-w-sm flex flex-col gap-4">
      <p className="font-serif text-lg text-ink leading-tight">Want access to activities?</p>

      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="font-sans text-sm text-ink bg-transparent border-b border-ink-faint/40 pb-1 outline-none placeholder:text-ink-faint focus:border-ink transition-colors duration-150"
      />

      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="font-sans text-sm text-ink bg-transparent border-b border-ink-faint/40 pb-1 outline-none placeholder:text-ink-faint focus:border-ink transition-colors duration-150"
      />

      <div className="flex flex-col gap-2">
        <p className="font-sans text-xs text-ink-muted">Would you be willing to pay for full access?</p>
        <div className="flex gap-2">
          {(["yes", "no", "maybe"] as WillingToPay[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setWillingToPay(opt)}
              className={`${toggleBtnBase} ${willingToPay === opt ? activeBtn : inactiveBtn}`}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!name || !email || !willingToPay || loading}
        className="self-start font-mono text-label-sm uppercase tracking-[0.12em] bg-navy text-paper px-6 py-2 hover:bg-ink transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Sending…" : "Join waitlist"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Add `WaitlistBanner` to `LockedSection.tsx`**

In `components/LockedSection.tsx`, find the final return block (the "Coming soon" state, around line 98). Replace it:

```typescript
// Before (the locked return):
  return (
    <section>
      <div className="flex items-baseline gap-4 mb-6">
        <span className="label-sm shrink-0">{String(index + 1).padStart(2, "0")}</span>
        <h2 className="font-serif text-2xl md:text-3xl text-ink leading-tight">{section.heading}</h2>
      </div>
      <div className="pl-10 md:pl-12">
        <div className="inline-flex items-center gap-2 border border-ink-faint/30 px-4 py-2">
          <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">Coming soon</span>
        </div>
      </div>
    </section>
  );
```

Replace with:

```typescript
  return (
    <section>
      <div className="flex items-baseline gap-4 mb-6">
        <span className="label-sm shrink-0">{String(index + 1).padStart(2, "0")}</span>
        <h2 className="font-serif text-2xl md:text-3xl text-ink leading-tight">{section.heading}</h2>
      </div>
      <div className="pl-10 md:pl-12">
        <div className="inline-flex items-center gap-2 border border-ink-faint/30 px-4 py-2 mb-4">
          <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">Coming soon</span>
        </div>
        <WaitlistBanner />
      </div>
    </section>
  );
```

Also add the import at the top of `LockedSection.tsx`:

```typescript
import { WaitlistBanner } from "@/components/WaitlistBanner";
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Test in browser**

Navigate to any module that has a locked activity section. Confirm:
- "Coming soon" chip still shows
- Waitlist form appears below it
- Submitting with name, email, and a Yes/No/Maybe choice shows the thank-you message
- Check Supabase `waitlist` table — row exists with `source = 'paywall'`

- [ ] **Step 5: Commit**

```bash
git add components/WaitlistBanner.tsx components/LockedSection.tsx
git commit -m "feat(ui): add WaitlistBanner to locked activity sections"
```

---

## Task 5: Extend ComingSoonModal

**Files:**
- Modify: `components/ComingSoonModal.tsx`

**Interfaces:**
- Consumes: `getDeviceId()` from `lib/device.ts`; `POST /api/waitlist`
- Produces: same `ComingSoonModal` props interface — no prop changes needed

- [ ] **Step 1: Rewrite `components/ComingSoonModal.tsx`**

Replace the entire file contents with:

```typescript
"use client";

import { useState } from "react";
import { getDeviceId } from "@/lib/device";

interface Props {
  yearLabel: string;
  onClose: () => void;
}

export function ComingSoonModal({ yearLabel, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [needsCapstone, setNeedsCapstone] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || needsCapstone === null) return;
    setLoading(true);
    await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        device_id: getDeviceId(),
        source: "coming_soon",
        needs_capstone: needsCapstone,
      }),
    });
    setLoading(false);
    setSubmitted(true);
    setTimeout(onClose, 3000);
  }

  const toggleBtnBase =
    "font-mono text-label-sm uppercase tracking-[0.12em] px-4 py-2 border transition-colors duration-150";
  const activeBtn = "border-ink bg-ink text-paper";
  const inactiveBtn = "border-ink-faint/30 text-ink-muted hover:border-ink hover:text-ink";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="coming-soon-title"
        className="bg-navy text-paper mx-4 max-w-sm w-full p-10 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <>
            <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe">{yearLabel}</p>
            <h2 className="font-serif text-display-md text-paper leading-none">You're in.</h2>
            <p className="font-sans text-sm text-taupe leading-relaxed">
              Thanks! We'll let you know when content is ready.
            </p>
          </>
        ) : (
          <>
            <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe">{yearLabel}</p>
            <h2 id="coming-soon-title" className="font-serif text-display-md text-paper leading-none">
              Coming Soon
            </h2>
            <p className="font-sans text-sm text-taupe leading-relaxed">
              Content for this year is being written. Leave your email and we'll notify you when it's ready.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="font-sans text-sm text-paper bg-transparent border-b border-taupe/40 pb-1 outline-none placeholder:text-taupe/60 focus:border-paper transition-colors duration-150"
              />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="font-sans text-sm text-paper bg-transparent border-b border-taupe/40 pb-1 outline-none placeholder:text-taupe/60 focus:border-paper transition-colors duration-150"
              />

              <div className="flex flex-col gap-2">
                <p className="font-sans text-xs text-taupe">Are you working on a capstone or thesis project?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNeedsCapstone(true)}
                    className={`${toggleBtnBase} ${needsCapstone === true ? activeBtn : inactiveBtn}`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setNeedsCapstone(false)}
                    className={`${toggleBtnBase} ${needsCapstone === false ? activeBtn : inactiveBtn}`}
                  >
                    No
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!name || !email || needsCapstone === null || loading}
                className="self-start font-mono text-label-sm uppercase tracking-[0.12em] bg-paper text-navy px-6 py-2 hover:bg-taupe transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Sending…" : "Notify me"}
              </button>
            </form>

            <button
              onClick={onClose}
              aria-label="Close"
              className="self-start font-sans text-sm uppercase tracking-widest text-taupe hover:text-paper transition-colors duration-150"
            >
              Close ×
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Test in browser**

Navigate to `/year`, click a coming-soon year (3rd or 4th year). Confirm:
- Modal opens with "Coming Soon" + year label
- Form shows name, email, and Yes/No capstone toggle
- Submitting with all fields filled shows "You're in." message
- Modal auto-closes after 3 seconds
- Check Supabase `waitlist` table — row exists with `source = 'coming_soon'`
- Submitting same email again shows thank-you without error

- [ ] **Step 4: Commit**

```bash
git add components/ComingSoonModal.tsx
git commit -m "feat(ui): extend ComingSoonModal with waitlist form and capstone survey"
```

---

## Task 6: Footer Privacy Notice

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- No new interfaces. Modifies the existing footer JSX in `LandingPage`.

- [ ] **Step 1: Add privacy notice to footer in `app/page.tsx`**

Find the footer section (near bottom of `LandingPage`):

```typescript
      {/* Footer */}
      <div className="mt-auto flex items-center justify-between">
        <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
          For BSIT students
        </span>
        <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent">
          Free to read
        </span>
      </div>
```

Replace with:

```typescript
      {/* Footer */}
      <div className="mt-auto flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
            For BSIT students
          </span>
          <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent">
            Free to read
          </span>
        </div>
        <p className="font-mono text-label-sm text-ink-faint">
          We collect emails only to notify you when content is ready. We don't sell or share your data.
        </p>
      </div>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Check in browser**

Visit `/`. Confirm the privacy notice appears below the "For BSIT students" / "Free to read" line in the footer, in the existing faint mono style.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat(ui): add footer privacy notice for email collection"
```

---

## Task 7: Admin Dashboard — Waitlist Section

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `components/AdminDashboard.tsx`

**Interfaces:**
- Consumes: `waitlist` table via Supabase server client
- Produces: new `waitlistEntries` prop on `AdminDashboard`; new `WaitlistEntry` interface

- [ ] **Step 1: Add `WaitlistEntry` interface and fetch in `app/admin/page.tsx`**

Add this interface near the top of `app/admin/page.tsx` (after existing imports, before `getTitle`):

```typescript
// No import needed — already uses createServerClient
```

Add the waitlist fetch inside the existing `Promise.all` block. The current array has 9 entries `[...]`. Add a tenth:

```typescript
    supabase
      .from("waitlist")
      .select("id, email, name, source, device_type, willing_to_pay, needs_capstone, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
```

So the destructured result gains a tenth variable:

```typescript
  const [
    { data: funnelRaw },
    { data: dauRaw },
    { data: subjectCounters },
    { data: moduleCounters },
    { data: sectionEventRaw },
    { data: pendingRaw },
    { data: approvedRaw },
    { data: activeRaw },
    { data: allEnterRaw },
    { data: waitlistRaw },         // ← add this
  ] = await Promise.all([
    // ... existing 9 queries ...
    supabase                        // ← add this as 10th
      .from("waitlist")
      .select("id, email, name, source, device_type, willing_to_pay, needs_capstone, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);
```

Then pass `waitlistEntries` to `<AdminDashboard>`:

```typescript
  const waitlistEntries = (waitlistRaw ?? []) as {
    id: string;
    email: string;
    name: string;
    source: "coming_soon" | "paywall";
    device_type: "mobile" | "desktop";
    willing_to_pay: "yes" | "no" | "maybe" | null;
    needs_capstone: boolean | null;
    created_at: string;
  }[];
```

Add `waitlistEntries={waitlistEntries}` to the `<AdminDashboard>` JSX.

- [ ] **Step 2: Update `AdminDashboard` props and add Waitlist section**

In `components/AdminDashboard.tsx`, add the `WaitlistEntry` interface and update the `Props` interface:

```typescript
interface WaitlistEntry {
  id: string;
  email: string;
  name: string;
  source: "coming_soon" | "paywall";
  device_type: "mobile" | "desktop";
  willing_to_pay: "yes" | "no" | "maybe" | null;
  needs_capstone: boolean | null;
  created_at: string;
}
```

Add `waitlistEntries: WaitlistEntry[];` to the `Props` interface.

Add `waitlistEntries` to the destructured function params.

Add a new `WaitlistSection` function component above `AdminDashboard`:

```typescript
function WaitlistSection({ entries }: { entries: WaitlistEntry[] }) {
  const total = entries.length;
  const comingSoon = entries.filter(e => e.source === "coming_soon").length;
  const paywall = entries.filter(e => e.source === "paywall").length;
  const mobile = entries.filter(e => e.device_type === "mobile").length;
  const desktop = entries.filter(e => e.device_type === "desktop").length;
  const wtp = { yes: 0, no: 0, maybe: 0 };
  entries.filter(e => e.source === "paywall" && e.willing_to_pay).forEach(e => {
    if (e.willing_to_pay) wtp[e.willing_to_pay]++;
  });
  const capstoneYes = entries.filter(e => e.source === "coming_soon" && e.needs_capstone === true).length;
  const capstoneNo  = entries.filter(e => e.source === "coming_soon" && e.needs_capstone === false).length;

  function downloadCSV() {
    const header = "Name,Email,Source,Device,Willing to Pay,Needs Capstone,Date";
    const rows = entries.map(e =>
      [
        `"${e.name}"`,
        `"${e.email}"`,
        e.source,
        e.device_type,
        e.willing_to_pay ?? "",
        e.needs_capstone === null ? "" : String(e.needs_capstone),
        new Date(e.created_at).toLocaleDateString("en-PH"),
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "waitlist.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (total === 0) {
    return (
      <section className="mb-16">
        <p className="label mb-2">Waitlist</p>
        <p className="font-sans text-xs text-ink-faint">No signups yet.</p>
      </section>
    );
  }

  return (
    <section className="mb-16">
      <div className="flex items-baseline gap-4 mb-6">
        <p className="label">Waitlist</p>
        <span className="font-mono text-xs text-ink-faint">{total} total</span>
        <button
          onClick={downloadCSV}
          className="font-mono text-xs text-ink-muted border border-ink-faint/30 px-3 py-1 hover:text-ink hover:border-ink transition-colors duration-150"
        >
          Download CSV
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-w-wide">
        <Stat value={comingSoon} label="Coming Soon Signups" />
        <Stat value={paywall} label="Paywall Signups" />
        <Stat value={mobile} label="Mobile" />
        <Stat value={desktop} label="Desktop" />
      </div>

      {paywall > 0 && (
        <div className="mb-6">
          <p className="label-sm text-ink-muted mb-3">Willing to Pay (paywall group)</p>
          <div className="flex gap-4">
            {(["yes", "no", "maybe"] as const).map(k => (
              <div key={k} className="border border-ink-faint/30 px-5 py-4 text-center min-w-[72px]">
                <p className="font-serif text-2xl text-ink mb-1">{wtp[k]}</p>
                <p className="label-sm text-ink-muted capitalize">{k}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {comingSoon > 0 && (
        <div className="mb-8">
          <p className="label-sm text-ink-muted mb-3">Needs Capstone Resources (coming-soon group)</p>
          <div className="flex gap-4">
            {([["Yes", capstoneYes], ["No", capstoneNo]] as [string, number][]).map(([label, count]) => (
              <div key={label} className="border border-ink-faint/30 px-5 py-4 text-center min-w-[72px]">
                <p className="font-serif text-2xl text-ink mb-1">{count}</p>
                <p className="label-sm text-ink-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto max-w-wide">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-ink-faint/30">
              {["Name", "Email", "Source", "Device", "Date"].map(h => (
                <th key={h} className="text-left py-2 pr-6 label-sm text-ink-muted font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id} className="border-b border-ink-faint/15">
                <td className="py-3 pr-6 font-sans text-sm text-ink">{e.name}</td>
                <td className="py-3 pr-6 font-sans text-sm text-ink-muted">{e.email}</td>
                <td className="py-3 pr-6 font-mono text-xs text-ink-muted">{e.source}</td>
                <td className="py-3 pr-6 font-mono text-xs text-ink-muted">{e.device_type}</td>
                <td className="py-3 pr-6 font-sans text-xs text-ink-muted">
                  {new Date(e.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
```

Add `<WaitlistSection entries={waitlistEntries} />` inside the `AdminDashboard` return, after the pending unlocks section (before the closing `</main>`):

```typescript
      <WaitlistSection entries={waitlistEntries} />

    </main>
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Test in browser**

Visit `/admin`. Confirm:
- Waitlist section appears at the bottom of the dashboard
- Stats show correct counts matching what's in the Supabase `waitlist` table
- "Download CSV" button triggers a file download with all rows
- Table shows Name, Email, Source, Device, Date columns

- [ ] **Step 5: Commit**

```bash
git add app/admin/page.tsx components/AdminDashboard.tsx
git commit -m "feat(admin): add Waitlist section with stats, table, and CSV export"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] `waitlist` table with all columns — Task 1
- [x] `getDeviceType` utility, server-side UA detection — Task 2
- [x] `POST /api/waitlist` with dedup, validation, device detection — Task 3
- [x] `WaitlistBanner` inline under locked activity section — Task 4
- [x] `ComingSoonModal` extended with two-screen flow — Task 5
- [x] Footer privacy notice — Task 6
- [x] Admin dashboard Waitlist section with summary stats, table, CSV — Task 7
- [x] `device_id` collected from `getDeviceId()` in both forms — Tasks 4, 5
- [x] Silent dedup (same email + source) — Task 3

**Placeholder scan:** None found.

**Type consistency:**
- `WillingToPay` type: `"yes" | "no" | "maybe"` — consistent across Task 3 (API), Task 4 (banner), Task 7 (admin)
- `source`: `"coming_soon" | "paywall"` — consistent across all tasks
- `WaitlistEntry` interface: defined in Task 7 Step 2, matches DB schema from Task 1
- `getDeviceType` signature: `(userAgent: string): "mobile" | "desktop"` — consistent between Task 2 (impl) and Task 3 (usage)
