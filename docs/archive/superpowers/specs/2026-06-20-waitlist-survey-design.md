# Waitlist + Survey System — Design Spec

**Date:** 2026-06-20  
**Status:** Approved

---

## Overview

Capture emails, names, and willingness-to-pay signals from two distinct high-intent user groups before committing to a monetization model. All submissions are tied to the existing anonymous `device_id` so reading behavior can be cross-referenced with intent data.

---

## Goals

- Collect `email`, `name`, `device_id`, and `device_type` from interested users
- Distinguish between two user intents: waiting for missing content vs. blocked by a paywall
- Ask one focused survey question per group — no redundant data collection
- Show a privacy notice passively in the footer
- Surface waitlist data in the existing admin dashboard

---

## Data Model

### New Supabase table: `waitlist`

| column | type | constraints | notes |
|---|---|---|---|
| `id` | uuid | primary key, default gen_random_uuid() | |
| `email` | text | not null | |
| `name` | text | not null | |
| `device_id` | text | not null | ties to `counter_log`, `events` |
| `source` | text | not null, check in ('coming_soon','paywall') | which trigger fired |
| `willing_to_pay` | text | nullable, check in ('yes','no','maybe') | only set for `source = 'paywall'` |
| `needs_capstone` | boolean | nullable | only set for `source = 'coming_soon'` |
| `device_type` | text | not null, check in ('mobile','desktop') | detected server-side from User-Agent |
| `created_at` | timestamptz | default now() | |

**Unique constraint:** `(email, source)` — one entry per person per trigger point. A user can appear in both `coming_soon` and `paywall` rows.

---

## UI Components

### 1. `ComingSoonModal` (extended)

**File:** `components/ComingSoonModal.tsx`

The existing modal gains an inline two-screen flow:

**Screen 1 (current):** "Coming Soon" heading + year label + close button  
**Screen 2 (new, below existing content):** Waitlist form

Form fields:
- Name (text input)
- Email (email input)
- "Are you working on a capstone or thesis project?" — Yes / No toggle buttons

On submit:
- POST to `/api/waitlist` with `source: 'coming_soon'`, `needs_capstone`, `name`, `email`, `device_id`
- Swap entire modal content to thank-you message: *"Thanks! We'll let you know when content is ready."*
- Auto-close after 3 seconds

On duplicate (409 or silent success from API): show thank-you anyway, no error.

### 2. Paywall Banner (new)

**File:** `components/WaitlistBanner.tsx` (new)  
**Used in:** `components/LockedSection.tsx`

Rendered inline below the existing "Coming soon" chip when `status === "locked"`.

Layout: a bordered card in the existing app aesthetic (`border border-ink-faint/30`).

Content:
- Heading: *"Want access to activities?"*
- Name + Email fields
- "Would you be willing to pay for full access?" — Yes / No / Maybe (three toggle buttons, maps to `willing_to_pay`: `'yes'` / `'no'` / `'maybe'`)
- Submit button

On submit:
- POST to `/api/waitlist` with `source: 'paywall'`, `willing_to_pay`, `name`, `email`, `device_id`
- Swap card content to: *"Thanks! We'll keep you posted."*
- No auto-close (it's inline, not a modal)

### 3. Footer Privacy Notice

**File:** `app/page.tsx` (landing page footer)

Add a third line to the existing footer below the two current spans:

```
We collect emails only to notify you when content is ready. We don't sell or share your data.
```

Style: `font-mono text-label-sm text-ink-faint` — matches existing footer aesthetic. Centered or left-aligned consistent with footer layout.

---

## API Route

### `POST /api/waitlist`

**File:** `app/api/waitlist/route.ts` (new)

**Request body:**
```json
{
  "email": "string",
  "name": "string",
  "device_id": "string",
  "source": "coming_soon" | "paywall",
  "willing_to_pay": "yes" | "no" | "maybe" | null,
  "needs_capstone": true | false | null
}
```

**Server-side behavior:**
1. Validate required fields (`email`, `name`, `device_id`, `source`)
2. Detect `device_type` from `User-Agent` header using `getDeviceType()` utility — `"mobile"` or `"desktop"`
3. Upsert into `waitlist` table — on conflict `(email, source)` do nothing (silent dedup)
4. Return `{ success: true }` — always 200, even on duplicate

**Validation errors:** Return 400 with `{ error: "..." }` only for missing required fields.

---

## Device Detection Utility

**File:** `lib/device.ts` (extended)

Add `getDeviceType(userAgent: string): "mobile" | "desktop"` — regex check against common mobile UA strings (`Android`, `iPhone`, `iPad`, `Mobile`). Server-only usage (API route).

---

## Admin Dashboard

**File:** `components/AdminDashboard.tsx` (extended)

Add a **Waitlist** tab alongside existing stats.

**Summary cards:**
- Total signups
- Coming soon signups vs. paywall signups
- Mobile vs. desktop split
- Willing to pay: Yes / No / Maybe counts (paywall entries only)
- Needs capstone: Yes / No counts (coming_soon entries only)

**Table:** Name, Email, Source, Device type, Date — sorted by `created_at` desc

**Export:** "Download CSV" button that generates a client-side CSV from the fetched data. No new API route needed — admin already has authenticated access.

---

## Migration

New Supabase migration file: `supabase/migrations/YYYYMMDDHHMMSS_create_waitlist.sql`

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

-- Only service role can read/write (admin dashboard uses service role)
create policy "service role only" on public.waitlist
  using (false)
  with check (false);
```

---

## Supabase Types

`lib/supabase/types.ts` — add `waitlist` table definition to `Database` interface.

---

## Out of Scope

- Email confirmation / transactional email (no Resend or SMTP setup)
- User accounts or login
- Unsubscribe flow
- Push notifications
- Any change to the existing ₱20 GCash unlock flow
