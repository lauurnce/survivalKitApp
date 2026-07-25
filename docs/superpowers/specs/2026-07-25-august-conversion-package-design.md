# August Conversion Package — Design

**Date:** 2026-07-25
**Status:** Approved (brainstorm with Lawrence, acting-CEO session)

## Problem

4,702 signed-up users, daily new signups, healthy actives — but users who reach
the unlock screen (`SubscribeGate`) almost never click an Unlock button. Revenue
is far below the ₱20–50k/month target.

Diagnosis: the offer has no urgency (free lessons forever + non-expiring unlock
means "buy later" always wins), no social proof, and the free taste (a single
activity per subject) is too thin for students to feel what they'd be paying
for. July timing makes it worse: classes start ~Aug 10, so nobody needs practice
drills yet.

Strategy sequence agreed: **A** (this package) → **B** (semester-pricing
messaging at semester start — plans are already semester-based in
`lib/paymongo.ts`) → **C** (class-block/B2B sales — `classCode` and
dynamic-price link plumbing already exist).

## Scope

Four workstreams. Everything rides on existing infrastructure; no new services.

### 1. Enrollment-season sale (urgency)

- A date-driven sale on the gate: `year_sem` shows ~~₱299~~ **₱199** with copy
  "Enrollment-season price — ends when classes start (Aug 10)".
- Sale definition (label, discounted amounts per plan, end date ISO string)
  lives in one config module (e.g. `lib/sale.ts`), server-validated — the
  client never decides the price.
- Checkout uses the existing dynamic-price link path (already used for coupon
  discounts in `app/api/subscribe/route.ts`) when a sale is active; the fixed
  `PLANS` path when not.
- After the end date the gate silently reverts to regular prices. The config
  is reusable for future seasons (prelims, finals).
- No countdown timers beyond a plain end-date line; no fake scarcity.

### 2. Social proof on the gate (trust)

- "Join **4,700+ BSIT students**" line, sourced from the real user count
  (rounded down to the nearest hundred; `lib/counters.ts` formatting). Never
  show paid-unlock counts — too small to help.
- 2–3 short real testimonials with school names, hand-picked by Lawrence from
  the feedback table. Stored as a curated constant in code (quote, first name,
  school), not auto-pulled. Implementation lists candidate quotes from the
  feedback table for Lawrence to approve before they ship.

### 3. Deeper free sample (value proof)

- Replace "first activity per subject" (`pickFirstActivity` in
  `lib/freeSample.ts`) with "**all activity sections of the first module** per
  subject": drills, quiz, and code lab of module 1 are fully usable while
  locked.
- Gate placement is unchanged — it now appears from module 2 onward, after the
  user has experienced the full paid loop once.
- RLS/server checks that enforce the free-sample boundary must be updated in
  the same change; the client and server definitions of "free" stay in sync.

### 4. Exam-calendar urgency hooks (timing)

- A dismissible dashboard banner keyed to a small static season table derived
  from `docs/gtm/academic-calendars-ay2026-27.md` (e.g. "Classes start Aug 10 —
  be ready before day one", later "Prelims season").
- Gate headline copy swaps per season from the same table.
- No email/push infrastructure in this round. TikTok-side timing follows the
  existing campaign doc (`docs/marketing/2026-07-tiktok-revenue-campaign.md`).

## Out of scope

- Option B messaging/repricing (handled at semester start).
- Option C class-block sales motion (founder legwork; code exists).
- Email, push notifications, new analytics infrastructure.

## Success criteria

- Unlock-button click-through on the gate becomes measurably nonzero (existing
  analytics events on the gate buttons are enough to observe this).
- At least one season cycle (enrollment → classes-start) runs without manual
  price edits.
- July–August: paid unlocks trend toward the campaign's ~1.1 sales/day pace.

## Testing

- Unit tests: sale-config resolution (active/expired/boundary dates), price
  selection server-side, free-sample section selection (first module, multiple
  activities, empty-module fallback), season-table lookup.
- Follow existing Vitest patterns (`lib/*.test.ts`).
