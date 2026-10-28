# MVP Monetization — PayMongo Subscriptions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the manual GCash unlock flow with automated PayMongo monthly subscriptions (₱50/month per year level), grant access instantly via webhook, wire the two missing funnel events, and update the admin dashboard with subscription metrics.

**Architecture:** A `subscriptions` table in Supabase tracks active subscribers by `device_id` + `year_id`. PayMongo handles recurring billing and fires a webhook on payment success; the webhook handler grants access by upserting a row. Access checks replace the per-module `unlocks` lookup with a per-year-level `subscriptions` check. The existing `LockedSection` component becomes a `SubscribeGate` that shows a PayMongo checkout redirect instead of the old GCash form.

**Tech Stack:** Next.js 15 App Router, Supabase (Postgres + RLS), PayMongo Links/Subscriptions API, TypeScript, Tailwind CSS, Vitest.

## Global Constraints

- Never add `Co-Authored-By` to commit messages — lauurnce is sole contributor
- PayMongo API base URL: `https://api.paymongo.com/v1`
- PayMongo secret key stored in env var `PAYMONGO_SECRET_KEY` (never exposed client-side)
- PayMongo webhook secret stored in env var `PAYMONGO_WEBHOOK_SECRET`
- Subscription price: ₱50/month = 5000 centavos in PayMongo API
- Access is granted per `year_id`, not per module — one subscription unlocks all modules in the year
- `section_view` event must debounce 2s (already implemented in `lib/analytics.ts` — just wire the call)
- `subscribe_click` event fires when student taps the subscribe button (before redirect)
- All new API routes must verify `PAYMONGO_SECRET_KEY` is set before doing anything
- Vitest is the test runner (`npx vitest run`)

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/20260623100000_subscriptions.sql` | Create | `subscriptions` table + RLS |
| `lib/supabase/types.ts` | Modify | Add `subscriptions` table type + `SubscriptionStatus` |
| `lib/subscriptions.ts` | Create | `isSubscribed(deviceId, yearId)` — server-side access check |
| `lib/paymongo.ts` | Create | `createPaymongoLink(yearId, deviceId)` — creates PayMongo payment link |
| `app/api/subscribe/route.ts` | Create | POST — creates PayMongo link, returns checkout URL |
| `app/api/webhooks/paymongo/route.ts` | Create | POST — receives PayMongo webhook, grants subscription |
| `components/SubscribeGate.tsx` | Create | Replaces `LockedSection` paywall UI — shows subscribe CTA |
| `components/SectionRenderer.tsx` | Modify | Pass `isSubscribed` flag; render `SubscribeGate` instead of `LockedSection` |
| `app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx` | Modify | Fetch subscription status server-side, pass to `SectionRenderer` |
| `components/AdminDashboard.tsx` | Modify | Add subscriber count, active subs, revenue stats |
| `app/admin/page.tsx` | Modify | Fetch subscription stats, pass to `AdminDashboard` |
| `lib/analytics.ts` | No change | `logSectionView` already exists — just needs to be called |
| `components/SectionRenderer.tsx` | Modify | Call `logSectionView` on content sections |

---

## Task 1: Subscriptions Table Migration

**Files:**
- Create: `supabase/migrations/20260623100000_subscriptions.sql`
- Modify: `lib/supabase/types.ts`

**Interfaces:**
- Produces: `subscriptions` table with columns `id`, `device_id`, `year_id`, `paymongo_link_id`, `status`, `current_period_end`, `created_at`
- Produces: `SubscriptionStatus` type and `subscriptions` entry in `Database` interface

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260623100000_subscriptions.sql`:

```sql
create type subscription_status as enum ('active', 'paused', 'cancelled');

create table subscriptions (
  id             uuid primary key default gen_random_uuid(),
  device_id      text not null,
  year_id        uuid not null references years(id),
  paymongo_link_id text not null,
  status         subscription_status not null default 'active',
  current_period_end timestamptz not null,
  created_at     timestamptz not null default now()
);

-- One active subscription per device per year
create unique index subscriptions_device_year_active_idx
  on subscriptions (device_id, year_id)
  where status = 'active';

-- RLS: devices can only read their own subscriptions
alter table subscriptions enable row level security;

create policy "device reads own subscriptions"
  on subscriptions for select
  using (device_id = current_setting('app.device_id', true));

-- Service role bypasses RLS for webhook inserts
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

Use the Supabase MCP tool `apply_migration` with the SQL above against the project. Confirm success.

- [ ] **Step 3: Add types to `lib/supabase/types.ts`**

Add `SubscriptionStatus` type and extend `EventType` and `Database`:

```typescript
export type SubscriptionStatus = "active" | "paused" | "cancelled";
```

Add to `EventType` union (line 5):
```typescript
export type EventType =
  | "enter"
  | "year_select"
  | "subject_open"
  | "module_open"
  | "section_view"
  | "subscribe_click"      // ← new
  | "unlock_click"
  | "unlock_submitted";
```

Add to `Database.public.Tables` after `unlocks`:
```typescript
subscriptions: {
  Row: {
    id: string;
    device_id: string;
    year_id: string;
    paymongo_link_id: string;
    status: SubscriptionStatus;
    current_period_end: string;
    created_at: string;
  };
  Insert: {
    id?: string;
    device_id: string;
    year_id: string;
    paymongo_link_id: string;
    status?: SubscriptionStatus;
    current_period_end: string;
    created_at?: string;
  };
  Update: Partial<{ status: SubscriptionStatus; current_period_end: string }>;
};
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260623100000_subscriptions.sql lib/supabase/types.ts
git commit -m "feat(db): add subscriptions table and types"
```

---

## Task 2: Server-Side Access Check

**Files:**
- Create: `lib/subscriptions.ts`
- Create: `lib/subscriptions.test.ts`

**Interfaces:**
- Produces: `isSubscribed(deviceId: string, yearId: string): Promise<boolean>`
- Consumed by: `app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx` (Task 5)

- [ ] **Step 1: Write the failing test**

Create `lib/subscriptions.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the supabase server client
vi.mock("./supabase/server", () => ({
  createServerClient: vi.fn(),
}));

import { createServerClient } from "./supabase/server";
import { isSubscribed } from "./subscriptions";

describe("isSubscribed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.UNLOCK_ALL;
  });

  it("returns true when UNLOCK_ALL=true in non-production", async () => {
    process.env.UNLOCK_ALL = "true";
    process.env.NODE_ENV = "test";
    const result = await isSubscribed("device-1", "year-1");
    expect(result).toBe(true);
  });

  it("returns true when active subscription exists", async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: "sub-1" }, error: null }),
          }),
        }),
      }),
    });
    vi.mocked(createServerClient).mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as never);

    const result = await isSubscribed("device-1", "year-1");
    expect(result).toBe(true);
  });

  it("returns false when no active subscription", async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    });
    vi.mocked(createServerClient).mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as never);

    const result = await isSubscribed("device-1", "year-1");
    expect(result).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run lib/subscriptions.test.ts
```

Expected: FAIL — `isSubscribed` is not defined.

- [ ] **Step 3: Implement `lib/subscriptions.ts`**

```typescript
import { createServerClient } from "./supabase/server";

export async function isSubscribed(deviceId: string, yearId: string): Promise<boolean> {
  if (process.env.UNLOCK_ALL === "true") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("UNLOCK_ALL must not be set in production");
    }
    return true;
  }

  const supabase = createServerClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("device_id", deviceId)
    .eq("year_id", yearId)
    .eq("status", "active")
    .limit(1)
    .single();

  return !!data;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run lib/subscriptions.test.ts
```

Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add lib/subscriptions.ts lib/subscriptions.test.ts
git commit -m "feat(subscriptions): add isSubscribed access check"
```

---

## Task 3: PayMongo Client

**Files:**
- Create: `lib/paymongo.ts`
- Create: `lib/paymongo.test.ts`

**Interfaces:**
- Produces: `createPaymongoLink(yearId: string, deviceId: string, successUrl: string): Promise<{ checkoutUrl: string; linkId: string }>`
- Produces: `verifyPaymongoWebhook(rawBody: string, signature: string): boolean`
- Consumed by: `app/api/subscribe/route.ts` (Task 4), `app/api/webhooks/paymongo/route.ts` (Task 4)

- [ ] **Step 1: Write the failing tests**

Create `lib/paymongo.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createPaymongoLink, verifyPaymongoWebhook } from "./paymongo";
import crypto from "crypto";

const FAKE_SECRET = "sk_test_fakesecretkey";
const FAKE_WEBHOOK_SECRET = "whsec_fakewebhooksecret";

describe("createPaymongoLink", () => {
  beforeEach(() => {
    process.env.PAYMONGO_SECRET_KEY = FAKE_SECRET;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.PAYMONGO_SECRET_KEY;
  });

  it("throws if PAYMONGO_SECRET_KEY is missing", async () => {
    delete process.env.PAYMONGO_SECRET_KEY;
    await expect(
      createPaymongoLink("year-1", "device-1", "https://example.com/success")
    ).rejects.toThrow("PAYMONGO_SECRET_KEY");
  });

  it("calls PayMongo links API with correct amount and returns checkout URL", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: "link_abc123",
          attributes: { checkout_url: "https://checkout.paymongo.com/abc" },
        },
      }),
    } as Response);

    const result = await createPaymongoLink("year-1", "device-1", "https://example.com/success");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.paymongo.com/v1/links",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: expect.stringContaining("Basic"),
        }),
      })
    );
    expect(result.checkoutUrl).toBe("https://checkout.paymongo.com/abc");
    expect(result.linkId).toBe("link_abc123");
  });

  it("throws on PayMongo API error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ errors: [{ detail: "Invalid API key" }] }),
    } as Response);

    await expect(
      createPaymongoLink("year-1", "device-1", "https://example.com/success")
    ).rejects.toThrow("PayMongo error");
  });
});

describe("verifyPaymongoWebhook", () => {
  beforeEach(() => {
    process.env.PAYMONGO_WEBHOOK_SECRET = FAKE_WEBHOOK_SECRET;
  });

  afterEach(() => {
    delete process.env.PAYMONGO_WEBHOOK_SECRET;
  });

  it("returns true for a valid signature", () => {
    const body = JSON.stringify({ data: { type: "link.payment.paid" } });
    const sig = crypto
      .createHmac("sha256", FAKE_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    expect(verifyPaymongoWebhook(body, sig)).toBe(true);
  });

  it("returns false for an invalid signature", () => {
    const body = JSON.stringify({ data: { type: "link.payment.paid" } });
    expect(verifyPaymongoWebhook(body, "badsignature")).toBe(false);
  });

  it("returns false if PAYMONGO_WEBHOOK_SECRET is missing", () => {
    delete process.env.PAYMONGO_WEBHOOK_SECRET;
    expect(verifyPaymongoWebhook("body", "sig")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run lib/paymongo.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/paymongo.ts`**

```typescript
import crypto from "crypto";

export async function createPaymongoLink(
  yearId: string,
  deviceId: string,
  successUrl: string
): Promise<{ checkoutUrl: string; linkId: string }> {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) throw new Error("PAYMONGO_SECRET_KEY is not set");

  const encoded = Buffer.from(`${secretKey}:`).toString("base64");

  const res = await fetch("https://api.paymongo.com/v1/links", {
    method: "POST",
    headers: {
      Authorization: `Basic ${encoded}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: 5000, // ₱50.00 in centavos
          description: "BSIT Survival Kit — Monthly Subscription",
          remarks: `year:${yearId} device:${deviceId}`,
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

export function verifyPaymongoWebhook(rawBody: string, signature: string): boolean {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run lib/paymongo.test.ts
```

Expected: PASS — all tests passing.

- [ ] **Step 5: Commit**

```bash
git add lib/paymongo.ts lib/paymongo.test.ts
git commit -m "feat(paymongo): add PayMongo link creation and webhook verification"
```

---

## Task 4: API Routes — Subscribe + Webhook

**Files:**
- Create: `app/api/subscribe/route.ts`
- Create: `app/api/webhooks/paymongo/route.ts`

**Interfaces:**
- Consumes: `createPaymongoLink` from `lib/paymongo.ts`
- Consumes: `verifyPaymongoWebhook` from `lib/paymongo.ts`
- Consumes: `createServerClient` from `lib/supabase/server.ts`
- `POST /api/subscribe` — body: `{ yearId: string; deviceId: string }` → response: `{ checkoutUrl: string }`
- `POST /api/webhooks/paymongo` — PayMongo sends this; grants subscription on `link.payment.paid`

- [ ] **Step 1: Create `app/api/subscribe/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createPaymongoLink } from "@/lib/paymongo";

export async function POST(req: NextRequest) {
  const body = await req.json() as { yearId?: string; deviceId?: string };
  const { yearId, deviceId } = body;

  if (!yearId || !deviceId) {
    return NextResponse.json({ error: "yearId and deviceId are required" }, { status: 400 });
  }

  const origin = req.headers.get("origin") ?? "https://bsitsurvivalkit.vercel.app";
  const successUrl = `${origin}/year/${yearId}/subjects`;

  try {
    const { checkoutUrl, linkId } = await createPaymongoLink(yearId, deviceId, successUrl);
    // Store pending link so the webhook can match it back to device+year
    // (PayMongo echoes the link id in the webhook payload)
    void linkId; // used by webhook handler via remarks field
    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment setup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create `app/api/webhooks/paymongo/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyPaymongoWebhook } from "@/lib/paymongo";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("paymongo-signature") ?? "";

  if (!verifyPaymongoWebhook(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    data: {
      attributes: {
        type: string;
        data: {
          attributes: {
            remarks: string;
            id: string;
          };
        };
      };
    };
  };

  const eventType = event.data.attributes.type;
  if (eventType !== "link.payment.paid") {
    // Acknowledge non-payment events without action
    return NextResponse.json({ ok: true });
  }

  const remarks = event.data.attributes.data.attributes.remarks ?? "";
  const linkId = event.data.attributes.data.attributes.id;

  // remarks format: "year:<yearId> device:<deviceId>"
  const yearMatch = remarks.match(/year:([^\s]+)/);
  const deviceMatch = remarks.match(/device:([^\s]+)/);

  if (!yearMatch || !deviceMatch) {
    return NextResponse.json({ error: "Missing remarks" }, { status: 400 });
  }

  const yearId = yearMatch[1];
  const deviceId = deviceMatch[1];

  // Grant 31 days of access
  const currentPeriodEnd = new Date();
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 31);

  const supabase = createServerClient();
  const { error } = await supabase.from("subscriptions").upsert(
    {
      device_id: deviceId,
      year_id: yearId,
      paymongo_link_id: linkId,
      status: "active",
      current_period_end: currentPeriodEnd.toISOString(),
    },
    { onConflict: "device_id,year_id" }
  );

  if (error) {
    console.error("Subscription upsert failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Required: disable body parsing so we can read raw body for signature verification
export const config = { api: { bodyParser: false } };
```

- [ ] **Step 3: Commit**

```bash
git add app/api/subscribe/route.ts app/api/webhooks/paymongo/route.ts
git commit -m "feat(api): add subscribe and PayMongo webhook routes"
```

---

## Task 5: Wire Subscription Gate into Module Page

**Files:**
- Create: `components/SubscribeGate.tsx`
- Modify: `app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx`
- Modify: `components/SectionRenderer.tsx`

**Interfaces:**
- Consumes: `isSubscribed(deviceId, yearId): Promise<boolean>` from `lib/subscriptions.ts`
- Consumes: `logEvent` from `lib/analytics.ts` (for `subscribe_click`)
- `SubscribeGate` props: `{ yearId: string; yearLabel?: string }`

- [ ] **Step 1: Create `components/SubscribeGate.tsx`**

```typescript
"use client";

import { useState } from "react";
import { getDeviceId } from "@/lib/device";
import { logEvent } from "@/lib/analytics";

interface Props {
  yearId: string;
  yearLabel?: string;
}

export function SubscribeGate({ yearId, yearLabel }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    const deviceId = getDeviceId();
    if (!deviceId) return;

    logEvent("subscribe_click", { year_id: yearId });
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yearId, deviceId }),
      });
      const data = await res.json() as { checkoutUrl?: string; error?: string };

      if (!res.ok || !data.checkoutUrl) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="border border-ink-faint/30 p-6 mt-4">
      <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mb-2">
        Activity — Subscribers Only
      </p>
      <p className="font-sans text-base text-ink-muted mb-6">
        Unlock all activities for {yearLabel ?? "this year"} with a monthly subscription.
      </p>
      <div className="flex items-baseline gap-3 mb-6">
        <span className="font-serif text-4xl text-ink">₱50</span>
        <span className="font-sans text-sm text-ink-muted">/ month</span>
      </div>
      {error && (
        <p className="font-sans text-sm text-red-500 mb-4">{error}</p>
      )}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="bg-accent text-paper font-sans text-sm px-6 py-3 hover:bg-ink transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Redirecting to payment…" : "Subscribe — ₱50/month"}
      </button>
      <p className="font-sans text-xs text-ink-faint mt-3">
        Paid via GCash, Maya, or card. Cancel anytime.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Modify `app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx`**

`getDeviceId()` reads from `localStorage` (client-only), so subscription status is checked client-side inside `SubscribeGate`. The server page just needs to pass `yearId` down to `SectionRenderer`.

Replace line 52:
```typescript
// Before:
const unlockAll = process.env.UNLOCK_ALL === "true";

// After:
const devUnlockAll = process.env.UNLOCK_ALL === "true";
```

In the JSX, update `SectionRenderer` props:
```tsx
<SectionRenderer
  key={section.id}
  section={section}
  index={i}
  moduleId={moduleId}
  yearId={yearId}           // ← add this
  unlockAll={devUnlockAll}  // ← rename
  yearLabel={year?.label}
  subjectTitle={subject.title}
  moduleTitle={mod.title}
/>
```

- [ ] **Step 3: Modify `components/SectionRenderer.tsx`**

Add `yearId` to the `Props` interface and replace `LockedSection` with `SubscribeGate`:

```typescript
// Add import:
import { SubscribeGate } from "./SubscribeGate";
import { useEffect } from "react";
import { logSectionView } from "@/lib/analytics";
```

Update `Props` interface:
```typescript
interface Props {
  section: Section;
  index: number;
  moduleId: string;
  yearId: string;       // ← add
  unlockAll: boolean;
  yearLabel?: string;
  subjectTitle?: string;
  moduleTitle?: string;
}
```

Replace the activity lock check at the top of `SectionRenderer`:
```typescript
// Before:
if (section.kind === "activity" && !unlockAll) {
  return <LockedSection section={section} index={index} moduleId={moduleId} yearLabel={yearLabel} subjectTitle={subjectTitle} moduleTitle={moduleTitle} />;
}

// After:
if (section.kind === "activity" && !unlockAll) {
  return (
    <section>
      <div className="flex items-baseline gap-4 mb-6">
        <span className="label-sm shrink-0">{String(index + 1).padStart(2, "0")}</span>
        <h2 className="font-serif text-2xl md:text-3xl text-ink leading-tight">{section.heading}</h2>
      </div>
      <div className="pl-10 md:pl-12">
        <SubscribeGate yearId={yearId} yearLabel={yearLabel} />
      </div>
    </section>
  );
}
```

Add `section_view` tracking inside the content render path. After the existing return statement opens `<section>`, add a `useEffect` call. Since `SectionRenderer` is already a client component, add at the top of the function body:

```typescript
useEffect(() => {
  if (section.kind === "content") {
    logSectionView(section.id, moduleId);
  }
}, [section.id, section.kind, moduleId]);
```

- [ ] **Step 4: Commit**

```bash
git add components/SubscribeGate.tsx components/SectionRenderer.tsx app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx
git commit -m "feat(paywall): replace LockedSection with SubscribeGate and wire section_view tracking"
```

---

## Task 6: Admin Dashboard — Subscription Metrics

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `components/AdminDashboard.tsx`

**Interfaces:**
- Consumes: `subscriptions` table from Supabase
- Produces: `activeSubscribers`, `totalRevenue`, `newSubscribersToday` props on `AdminDashboard`

- [ ] **Step 1: Fetch subscription stats in `app/admin/page.tsx`**

Add to the existing `Promise.all` array in `AdminPage`:

```typescript
supabase
  .from("subscriptions")
  .select("id, created_at, status")
  .order("created_at", { ascending: false }),
```

Destructure as `{ data: subscriptionRaw }` from the `Promise.all` result.

Then compute stats after the `Promise.all`:

```typescript
const subscriptions = subscriptionRaw ?? [];
const activeSubscribers = subscriptions.filter(s => s.status === "active").length;
const totalRevenue = activeSubscribers * 50; // ₱50/subscriber, simplified
const todayStr = new Date().toISOString().slice(0, 10);
const newSubscribersToday = subscriptions.filter(
  s => s.created_at.slice(0, 10) === todayStr
).length;
```

Pass to `AdminDashboard`:
```tsx
<AdminDashboard
  {...existingProps}
  activeSubscribers={activeSubscribers}
  totalRevenue={totalRevenue}
  newSubscribersToday={newSubscribersToday}
/>
```

- [ ] **Step 2: Add subscription stats to `AdminDashboard.tsx`**

Add to the `Props` interface:
```typescript
activeSubscribers: number;
totalRevenue: number;
newSubscribersToday: number;
```

Add a new stats row above the existing stats grid (find the stats grid and prepend):
```tsx
{/* Subscription metrics */}
<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
  <Stat value={activeSubscribers} label="Active Subscribers" accent />
  <Stat value={`₱${totalRevenue}`} label="Est. Monthly Revenue" />
  <Stat value={newSubscribersToday} label="New Today" />
</div>
```

Remove `pendingUnlocks` from the `Props` interface and remove the manual approval queue section from the JSX — it is no longer needed.

- [ ] **Step 3: Commit**

```bash
git add app/admin/page.tsx components/AdminDashboard.tsx
git commit -m "feat(admin): add subscription metrics, remove manual unlock queue"
```

---

## Task 7: Environment Variables

**Files:**
- No code files — Vercel env configuration only

- [ ] **Step 1: Add PayMongo keys to Vercel**

Run the following (you will be prompted to enter values):

```bash
vercel env add PAYMONGO_SECRET_KEY production
vercel env add PAYMONGO_WEBHOOK_SECRET production
```

For local development, add to `.env.local` (never commit this file):
```
PAYMONGO_SECRET_KEY=sk_test_YOUR_TEST_KEY
PAYMONGO_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

- [ ] **Step 2: Register the webhook in PayMongo dashboard**

In PayMongo dashboard → Webhooks → Add webhook:
- URL: `https://YOUR_PRODUCTION_DOMAIN/api/webhooks/paymongo`
- Events: `link.payment.paid`

Copy the webhook secret and set it as `PAYMONGO_WEBHOOK_SECRET`.

- [ ] **Step 3: Verify env vars are set**

```bash
vercel env ls
```

Expected: `PAYMONGO_SECRET_KEY` and `PAYMONGO_WEBHOOK_SECRET` listed for production.

---

## Task 8: End-to-End Smoke Test

- [ ] **Step 1: Run the full test suite**

```bash
npx vitest run
```

Expected: all existing tests pass plus the new ones from Tasks 2 and 3.

- [ ] **Step 2: Start the dev server and verify the subscribe flow**

```bash
npm run dev
```

Navigate to any module page with an activity section. Verify:
- Content sections show without a paywall
- Activity sections show the `SubscribeGate` with the ₱50/month CTA
- Clicking "Subscribe" calls `/api/subscribe` and redirects to PayMongo checkout URL (use test mode keys)

- [ ] **Step 3: Verify admin dashboard**

Navigate to `/admin`. Verify:
- Subscriber count stat is visible
- Revenue stat is visible
- Manual unlock queue is gone

- [ ] **Step 4: Final commit tag**

```bash
git tag v0.2.0-subscription
```
