# User Accounts — Design Spec

**Date:** 2026-06-24
**Status:** Approved (design), pending implementation plan

## Overview

The BSIT Survival Kit currently gates paid activities by a **signed `device_id`
cookie** — no real accounts exist. With real money now flowing, paid access must
attach to a **person**, not a browser, so it survives cleared cookies and follows
users across devices. This spec adds email + password accounts (via Supabase
Auth), an account dashboard showing unlocked subjects and progress, and a
migration path that preserves access for everyone who has **already paid**.

Free content (modules/reading) stays open to everyone, logged in or not. Only the
*paid activity* flow changes: it now requires an account.

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Existing device-based payments | **Link device → account** — on login, claim the current device's paid rows onto the account (Option 1). |
| When is an account required | **Before paying.** Subscribe prompt stays the first layer; clicking Subscribe while logged out routes to login/signup, then back to pay. |
| Auth method | **Supabase Auth, email + password.** Google can be added later via Supabase dashboard with ~0 code. |
| Email confirmation | **Disabled tonight** — instant login on signup. Can be enabled later. |
| Dashboard | **Subjects grid + progress rings**, header with plan status + overall progress. No streaks/badges (out of scope). |

## Architecture

### Auth
- Supabase Auth (email + password) via `@supabase/ssr`.
- Sessions stored in secure, httpOnly cookies managed by Supabase.
- `middleware.ts` gains a Supabase `updateSession` step so server components and
  API routes can read `auth.uid()`. The existing admin-session guard is preserved
  and continues to run; the matcher is widened to cover the app (excluding static
  assets) while still protecting `/admin`.

### Data model — the "claim" model

Add a nullable `user_id uuid references auth.users(id)` to each device-keyed table:
- `subscriptions`
- `payments`
- `module_progress`
- `unlocks`

On **signup/login**, a server-side `claimDeviceRows(userId, deviceId)` runs:
> For each table, set `user_id = :userId` WHERE `device_id = :deviceId` AND
> `user_id IS NULL`.

This is how already-paid customers (Option 1) keep access automatically the first
time they log in on the browser they paid from. It only ever claims rows that are
unclaimed (`user_id IS NULL`) and match the caller's own signed device cookie, so
it cannot steal another account's rows.

### Access checks (user-first, device fallback)

`isSubscribed` and `isUnlocked` change to:
1. If logged in (`auth.uid()` present): match on `user_id`.
2. Else (anonymous): fall back to matching on `device_id` (today's behavior).

This keeps free flows and not-yet-claimed states working while making accounts the
primary key for paid access.

### Payment binding

Payment-link `remarks` embed `user:<userId>` in addition to the existing
`device:<deviceId>`. The PayMongo webhook writes `user_id` onto the
subscription/payment rows directly, so a payment made while logged in attaches to
the account immediately — no orphaned payments. The webhook still validates
amounts, livemode, signature, and link-id uniqueness exactly as today.

### RLS

For each table, add a `user_id`-based select policy alongside the existing device
policy:
```sql
create policy "user reads own <table>" on <table>
  for select using (user_id = auth.uid());
```
The service role (webhook, progress API) continues to bypass RLS for writes.
Run `get_advisors` after migration to confirm no new advisories.

## Routes & UI

### New routes
- `/login` — email + password form. Server action: `signInWithPassword` →
  `claimDeviceRows` → redirect to `next` param or `/account`.
- `/signup` — email + password form. Server action: `signUp` (no confirmation) →
  `claimDeviceRows` → redirect.
- `/account` — dashboard (server component, reads via `auth.uid()`):
  - Header: greeting, plan status (e.g. "1st Year · ₱300 plan" or per-subject),
    overall progress ring (modules completed / total across unlocked subjects).
  - Subjects grid: each subject shows a progress ring + "Continue" if unlocked,
    or a lock + "Unlock ₱50" if locked.
- Logout — server action / `/api/auth/logout`, signs out and redirects home.

### Wiring
- Layout header: an account control next to `ThemeToggle` — "Log in" when
  anonymous, "My Account" when signed in.
- `SubscribeGate`: on "Subscribe" click, if logged out → redirect to
  `/login?next=<current path>`; if logged in → proceed to payment as today.

### Progress rings
Computed from `module_progress` row counts vs. total modules per subject (data
already available). No new tracking tables.

## Security

- Passwords are handled entirely by Supabase Auth (bcrypt). We never store or
  hash passwords ourselves.
- All access decisions remain **server-side**; the client never gates paid
  content.
- Login/signup server actions validate inputs (`lib/validation.ts`) and are
  rate-limited (`lib/rateLimit.ts`).
- `claimDeviceRows` only updates rows with `user_id IS NULL` matching the caller's
  signed device cookie — verified by test.
- New migrations are idempotent and RLS-enabled, matching existing conventions.

## Testing

- `claimDeviceRows`: claims only NULL + matching-device rows; never reassigns rows
  already owned by another user; is idempotent.
- `isSubscribed` / `isUnlocked`: user-first match when logged in; device fallback
  when anonymous.
- Webhook: writes `user_id` when `user:` present in remarks; still works with
  device-only remarks (backward compatible); amount/livemode/signature guards
  unchanged.
- Auth server actions: invalid credentials rejected; rate limiting enforced.

## Out of scope (tonight)

- Google / OAuth sign-in (enable later via Supabase dashboard).
- Email confirmation, password reset emails.
- Streaks, badges, gamification beyond progress rings.
- Hard cutover of existing device-only payers (we link, not force-migrate).
