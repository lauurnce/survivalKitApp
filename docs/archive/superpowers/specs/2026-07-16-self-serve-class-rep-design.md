# Self-Serve Class Rep System — Design Spec

**Status:** Approved (visual mockups confirmed by user 2026-07-16) · supersedes the manual-grant flow shipped 2026-07-16
**Companion doc:** [implementation-plan-ay2026-27.md](../../gtm/implementation-plan-ay2026-27.md) (Track B)

## Why this pivot

The first version of Track B (merged 2026-07-16, commits `9153877..30c1bc6`) required the founder to personally negotiate every class deal over Messenger and manually call an admin API to grant access. That was the deliberate, correct MVP move — "sell one block by hand before building any dashboard" — but the user now wants this fully autonomous: real self-serve checkout with tiered pricing, a rep-gated approval flow instead of a Messenger conversation, and a rep-facing dashboard with progress visualization, so classes can scale without the founder being in the loop for every sale.

This spec **replaces** the admin-driven grant path with a real payment flow, and **adds** two new pieces: a join-request/approval step (instead of auto-join), and a rep dashboard.

## Pricing model

Confirmed with the user, no ambiguity remains:

| Scope | Base price | Seats included | Extra seat cost |
|---|---|---|---|
| 1 subject, whole semester | ₱799 | 11 (rep + 10 classmates) | +₱59 each |
| All subjects (that year), whole semester | ₱999 | 11 (rep + 10 classmates) | +₱59 each |

Formula: `total = (scope === 'all' ? 999 : 799) + max(0, declaredSeats - 11) * 59`, where `declaredSeats` includes the rep. `declaredSeats` has a UI-enforced minimum of 11 (i.e. minimum 10 classmates + the rep) and becomes the class's `seat_cap` at purchase time — there is no later top-up flow in this spec (buying more seats after the fact is out of scope; a rep who undershoots must be told to contact support or re-purchase, not designed here).

Duration is always "whole semester" — no monthly option for blocks. `current_period_end` is computed the same way solo semester plans are: `periodEndFor` in `lib/paymongo.ts` already floors semester plans at `SEMESTER_END`, and the class purchase should use that same constant rather than inventing a second expiry rule.

## Confirmed UX decisions (from brainstorming + visual review)

1. **Checkout control:** a **slider** (11 to 55+ seats) with the price recomputing live as the rep drags it, plus a scope toggle (1 Subject / All Subjects). Confirmed via browser mockup — user picked Variant A over a plain number-input and a fixed-tier-package alternative.
2. **Payment:** real PayMongo Payment Link, amount computed server-side from the declared scope+seats at link-creation time (not billed incrementally later).
3. **Join flow:** classmate clicks a shareable link (no manual code typing), submits a join request bound to their device cookie, sees a "waiting for approval" state that **auto-updates** (polling) the moment the rep approves — confirmed via the 3-state mockup (request → pending spinner → approved checkmark).
4. **Rep notification:** dashboard-only. No email/push. The rep is expected to check their own dashboard for pending requests — deliberately simple for v1, matches the app's existing no-email-infra reality.
5. **Rep identity/auth:** device-bound, no password, no account system. Whichever device completed the checkout automatically has dashboard access at `/class/[code]/rep`, identical in spirit to how every other device-scoped feature in this app already works (no login anywhere else in the product). **Accepted risk:** if the rep loses that device or clears cookies, there is no recovery path in this spec — explicitly deferred, not a gap to fix now.
6. **Dashboard content:** confirmed via mockup — (a) three summary stats (seats filled/cap, class average completion %, expiry date), (b) a pending-requests list with Approve/Reject buttons, (c) a roster list with one progress bar per classmate (% of that subject's modules completed) plus a "copy invite link" action. No names are collected or shown — classmates are ordered by join date and shown as "Classmate N."

## Data model changes

### `classes` table — modify (existing table from the prior iteration)

```sql
-- subject_id becomes nullable: null = "all subjects for this year_id" (mirrors
-- the existing subscriptions.subject_id convention where null = whole-year).
alter table classes alter column subject_id drop not null;

-- Declared seat count is renamed conceptually but the column already exists
-- (seat_cap) — no rename needed, it just now comes from the checkout form
-- instead of an admin's arbitrary choice.

-- New: tracks whether this class was purchased with a real PayMongo payment
-- (this iteration) vs an admin-granted one (prior iteration, if any live rows
-- exist). Not required for new rows, but lets old rows stay valid without a
-- backfill: any existing 'block-<uuid>' paymongo_link_id rows are simply
-- prior-generation data, still valid, not migrated.
```

No new column is strictly required — `paymongo_link_id` already exists and will now hold a **real** PayMongo link ID instead of the `block-<uuid>` placeholder, exactly like the existing `subscriptions`/`payments` tables already do for solo purchases. The only schema change is relaxing `subject_id` to nullable.

### `class_join_requests` — new table

```sql
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
```

Approving a request is the operation that creates the actual `class_members` row (moving the existing seat-cap-enforcement trigger from Task 4's `join` endpoint to this new "approve" endpoint — the trigger itself is unchanged, just triggered by a different code path). Rejecting just flips `status` to `'rejected'`; the row stays for audit/idempotency (a rejected classmate can submit a new request, which the `unique(class_id, device_id)` constraint requires handling via upsert-on-conflict-update, not a fresh insert).

## API surface changes

### Deprecate: `POST /api/admin/grant-class`

No longer the primary path. Not necessarily deleted immediately (existing admin muscle memory / manual override for edge cases may still be useful), but no longer linked from any UI. Decision on removal timing: leave it in place as an admin escape hatch, revisit removal once the self-serve path has run for a semester.

### New: `POST /api/class/checkout`

Public. Body: `{ scope: 'subject' | 'all', subjectId?: string (required if scope='subject'), yearId: string, seats: number (>= 11) }`. Trusts the device cookie for `repDeviceId` (never client-supplied), mirroring every other checkout-adjacent route in this app. Computes `amount` server-side from the pricing formula (never trust a client-supplied amount), builds `remarks` in a new vocabulary (e.g. `block:1 year:<id> [subject:<id>] seats:<n> rep:<deviceId>`), calls the existing `createPaymongoLink`-equivalent path (likely needs a small new function alongside it in `lib/paymongo.ts` since `createPaymongoLink` currently resolves amount from the fixed `PLANS` table, not a computed value — a class purchase needs to pass a raw amount through instead). Returns `{ checkoutUrl }`.

### Modify: `app/api/webhooks/paymongo/route.ts`

Add a branch: if parsed remarks contain `block:1`, treat this as a class purchase instead of a device subscription — parse `seats`/`rep` instead of the existing device/user fields, skip the `PLANS`/`resolvePlan` amount-validation path (class amounts are dynamic, not from the fixed table — validate instead that `paidAmount` matches the formula recomputed server-side from the parsed `seats`+scope, same "reject only underpayment" philosophy as the existing branch), then insert the `payments` ledger row (`device_id` = rep's device, real amount) and create the `classes` row (generating the 6-char join code exactly as the prior iteration's `grant-class` route already does — that code-generation function moves here, or into a shared `lib/classCode.ts` helper referenced by both).

### New: `POST /api/class/[code]/request` (classmate submits a join request)

Public, rate-limited (reuse `createRateLimiter`/`getClientIp` exactly as the current `join` endpoint does — the brute-force-defense reasoning from the prior iteration's security review still applies unchanged). Trusts device cookie. Looks up the class by code (exact match — carry forward the SQL-wildcard fix from the prior iteration; `.eq`, never `.ilike`, on unsanitized input). Upserts a `class_join_requests` row (`status: 'pending'`, or reset to `'pending'` if the device previously had a `'rejected'` row and is retrying). Returns `{ status: 'pending' | 'approved' }` (returns `'approved'` immediately if this device already has an approved request, so a returning classmate skips the waiting state entirely).

### New: `GET /api/class/[code]/request/status` (classmate polling endpoint)

Public, device-cookie-scoped. Returns `{ status: 'pending' | 'approved' | 'rejected' | 'none' }` for the calling device's request against that class code. Polled every few seconds by the join page while status is `'pending'`, matching the existing polling pattern already used by `SubscribeGate.tsx`'s payment-success check.

### New: `GET /api/class/[code]/rep` (dashboard data)

Device-cookie-scoped: 401 unless the calling device's cookie matches `classes.rep_device_id` for that code (enforced in the route, not relying on RLS alone, consistent with how every other privileged route in this app uses the service-role client and does its own authorization check in code). Returns: class summary (seats filled/cap, expiry, subject/year), pending requests list (id + submitted-at, no device_id exposed to the client), and roster (one entry per approved `class_members` row: an opaque ordinal "Classmate N" by join order, plus a single `completed / total` progress fraction per classmate). For a subject-scoped class, `total` = modules in that one subject. For an all-subjects class (`subject_id is null`), `total` = modules across every subject under that `year_id` combined into one fraction (not a per-subject breakdown in v1 — the roster bar stays one number per classmate either way, matching the mockup's single-bar-per-row layout). This is a heavier query for the all-subjects case; `module_progress(device_id)` is already indexed, but the join against `modules`/`subjects` scoped by `year_id` should be checked for a suitable index at plan-writing time (see open questions below).

### New: `POST /api/class/[code]/rep/decide` (approve/reject a pending request)

Device-cookie-scoped the same way as the dashboard route above. Body: `{ requestId: string, decision: 'approve' | 'reject' }`. On approve: flips the request to `'approved'`, inserts the `class_members` row (this is where the existing `class_members_seat_cap_trigger` Postgres trigger fires if the class is full — map its `P0001` error the same way the prior `join` endpoint did, returning a clear "class is full" error instead of a generic 500). On reject: flips to `'rejected'`, no `class_members` row created.

## Pages

- **`/for-blocks`** — becomes the checkout page. Replaces its current static "message us" copy with the live-pricing slider UI confirmed in the mockup (scope toggle + seat slider + computed total + a real "Pay" button hitting `/api/class/checkout`).
- **`/class/[code]/join`** — replaces the prior manual-code-entry `/class/join` page. No code-typing UI needed anymore since the link itself carries the code; the page just shows class name/subject and a single "Request to join" button, then the pending/approved states from the mockup.
- **`/class/[code]/rep`** — new. The dashboard from the mockup: summary stats, pending-requests list with approve/reject buttons, roster with progress bars, copy-invite-link action.

## What's explicitly out of scope (confirmed with user)

- Seat top-ups / buying more seats after initial purchase.
- Rep account recovery if their device/cookie is lost (accepted risk for v1).
- Email/push notifications for pending requests (dashboard-only).
- Collecting or displaying classmate names (stays fully anonymous/device-based, consistent with the rest of the app).
- Removing the old `POST /api/admin/grant-class` route (kept as a manual override, just unlinked from UI).

## Open implementation questions for the planning stage (not product questions — technical judgment calls for whoever writes the task plan)

- Whether `createPaymongoLink` in `lib/paymongo.ts` should be extended with an optional raw-amount parameter, or whether a parallel function is cleaner — a call this size affects how much of the existing subscribe/webhook code path is touched vs. left alone.
- Exact index needed for the "all subjects" dashboard progress query before it's used at any real scale (unindexed joins across `module_progress` × `modules` × `subjects` for an entire year could be slow for a 50-person class — worth a load-bearing index decision at plan-writing time, not guessed here).
