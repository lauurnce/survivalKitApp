# PayMongo Transaction Ledger + Dashboard Visibility — Design

**Date:** 2026-06-24
**Status:** Approved (design), pending spec review

## Problem

A successful PayMongo payment is recorded only as a row in `subscriptions`, which is an
access-control table keyed on `(device_id, year_id)` and upserted on every payment. This
means:

- **No per-transaction record.** Renewals overwrite the same subscription row, so individual
  payments cannot be reconstructed.
- **No amount stored.** The webhook validates the paid amount, then discards it. Dashboard
  revenue is estimated as `active_subscribers × ₱50`, not summed from real payments.
- **No transaction visibility.** The admin cannot see, list, or reconcile any individual
  PayMongo payment (amount, reference, timestamp, payer device).

Connectivity from PayMongo → dashboard works (paid events are verified and durably written,
and the dashboard reads live). Auditability does not.

## Goal

Introduce an append-only payments ledger so every successful `link.payment.paid` is recorded
immutably, make dashboard revenue reflect real money, and give the admin a transactions table.
`subscriptions` remains the access-control table, unchanged.

## Non-Goals

- Refunds / chargebacks / payment reversals.
- Changing the PayMongo signature, livemode, amount, or status trust checks (they stay as-is).
- Subscription expiry reconciliation (separate concern).

## Data Model

New append-only table. Migration: `supabase/migrations/20260624120000_payments_ledger.sql`.

```sql
create table payments (
  id                uuid primary key default gen_random_uuid(),
  paymongo_link_id  text not null,
  device_id         text not null,
  year_id           uuid not null references years(id),
  amount            integer not null,            -- centavos; 5000 = ₱50.00
  currency          text not null default 'PHP',
  paid_at           timestamptz not null,
  created_at        timestamptz not null default now()
);

-- Single-use link => unique. Makes the replay/dedup check race-safe, mirroring
-- the existing subscriptions_paymongo_link_id_idx guard.
create unique index payments_paymongo_link_id_idx on payments (paymongo_link_id);

-- Dashboard reads by recency.
create index payments_paid_at_idx on payments (paid_at desc);

alter table payments enable row level security;

-- Mirror the subscriptions select policy: a device may read only its own payments.
-- The webhook writes via the service role, which bypasses RLS.
create policy "device reads own payments"
  on payments for select
  using (device_id = current_setting('app.device_id', true));
```

`lib/supabase/types.ts` gains a `payments` table type (Row/Insert/Update) alongside
`subscriptions`. `Update` is intentionally empty/`never`-like — the ledger is append-only.

## Webhook Changes — `app/api/webhooks/paymongo/route.ts`

All existing guards stay in front, unchanged and in the same order: rate limit → signature
verify → JSON parse → livemode check → event-type check → linkId presence → amount match →
status check → remarks UUID validation.

After validation, the grant logic changes to:

1. **Replay check:** select from `payments` by `paymongo_link_id`. If a row exists, return
   `{ ok: true, deduped: true }`. (Idempotency is now keyed on `paymongo_link_id` only —
   each link is single-use, so a renewal carrying a *new* link is correctly processed instead
   of being blocked by a device+year match.)
2. **Insert ledger row first** (so access is never granted without a recorded payment):
   - `paymongo_link_id` = linkId
   - `device_id`, `year_id` = validated remarks values
   - `amount` = validated `paidAmount ?? SUBSCRIPTION_AMOUNT`
   - `currency` = `'PHP'`
   - `paid_at` = PayMongo payload paid timestamp if present, else `new Date()`. The current
     `PaymongoEvent` type does not parse a timestamp; add an optional `paid_at?: number`
     (Unix seconds) to `resource.attributes` and convert it, falling back to now when absent.
     Treat it as untrusted display metadata only — it never gates access.
   - On a unique-violation here (concurrent duplicate delivery), treat as a dedup and return
     `{ ok: true, deduped: true }` rather than 500.
3. **Upsert subscription** as today: `status: 'active'`, `current_period_end` = now + 31 days,
   `onConflict: 'device_id,year_id'`. A renewal extends the period; a first payment creates it.

On a genuine DB error (not a dedup), keep the current behavior: log server-side, return a
generic `{ error: "Internal error" }` 500.

## Dashboard Changes — `app/admin/page.tsx` + `components/AdminDashboard.tsx`

Add a query for `payments` (`id, device_id, year_id, amount, paymongo_link_id, paid_at`),
ordered by `paid_at desc`, capped at 100 rows, plus the year labels needed for display.

- **Revenue tile:** replace `activeSubscribers × ₱50` with the real sum of `amount` for payments
  in the current **PH calendar month**, divided by 100 and formatted as `₱`.
- **New Today tile:** switch from subscription-created-today to **payments with `paid_at` today
  (PH)** so renewals are counted.
- **Active Subscribers tile:** unchanged (still counts active subscription rows).
- **New "Transactions" section:** a table, most recent first, columns:
  - Date — `paid_at`, PH locale
  - Device — first 8 chars of `device_id`
  - Year — year label
  - Amount — `₱{amount/100}`
  - Ref — truncated `paymongo_link_id`

  Empty state: "No transactions yet."

## Error Handling

- Webhook unique-violation on the ledger insert → dedup response, not 500.
- Webhook other DB error → generic 500, detail logged server-side (unchanged).
- Dashboard: a null/empty `payments` query result degrades to ₱0 revenue and an empty
  transactions table; no throw.

## Testing

- **Webhook handler tests** (extend the existing `lib/paymongo.test.ts` or a sibling test):
  1. First payment → one `payments` row inserted + subscription upserted.
  2. Replayed link (same `paymongo_link_id`) → deduped, no second ledger row.
  3. Renewal (same device+year, *new* link) → second `payments` row + subscription period
     extended.
- **Revenue aggregation** — unit test the pure PH-month-sum helper over a fixture of payment
  rows (correct month boundary, centavos→peso).

## Files Touched

- `supabase/migrations/20260624120000_payments_ledger.sql` (new)
- `lib/supabase/types.ts` (add `payments` type)
- `app/api/webhooks/paymongo/route.ts` (ledger insert + dedup re-key)
- `app/admin/page.tsx` (payments query, real revenue, new-today, transactions data)
- `components/AdminDashboard.tsx` (Transactions table, revenue tile wiring)
- test file(s) for the webhook + revenue helper
