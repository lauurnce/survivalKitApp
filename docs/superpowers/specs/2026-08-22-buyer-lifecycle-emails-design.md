# Buyer Lifecycle Emails — Design

**Date:** 2026-08-22
**Status:** Approved, ready for implementation plan
**Branch:** `feat/buyer-lifecycle-emails`

## Problem

The app has never sent an email. Not one.

Grepping the repo for `resend|nodemailer|sendgrid|postmark|sendEmail` returns a single
`mailto:` in `app/(main)/privacy/page.tsx`. The PayMongo webhook
(`app/api/webhooks/paymongo/route.ts`) verifies the signature, writes the ledger row,
grants the subscription, and returns `{ ok: true }`. There is no notification of any
kind, and there are no cron jobs (no `vercel.json` crons, no `vercel.ts`).

The entire post-purchase experience today is:

```
PayMongo redirect → buildSuccessUrl() → module page ?payment=success
   → SubscribeGate polls → content unlocks in place → [END]
```

### Measured state (2026-08-21)

| Metric | Value | Source |
|---|---|---|
| Payment links generated | 115 | PayMongo dashboard |
| Links paid | 9 (7.8%) | `payments` table |
| Distinct payers | 7 | `payments.user_id` |
| Lifetime revenue | ₱994.00 | `sum(payments.amount)` |
| Accounts with confirmed email | 331 | `auth.users` |
| Emails ever sent to them | 0 | — |

The sharpest consequence: `periodEndFor()` in `lib/paymongo.ts` grants `subject_month`
exactly 31 days, after which access silently dies. Nobody is told it is ending, and
nobody is told it ended. A payer simply finds the content re-locked with no explanation.

### Explicitly out of scope

This spec covers **buyer lifecycle email only**. Three adjacent problems were identified
and deliberately deferred, each needing its own spec:

- **Paywall funnel leak** — `paywall_teaser_view` 18,493 → `paywall_teaser_click` 205
  (1.1%). By far the largest loss, and needs no email.
- **Reactivating the 331 dormant accounts** — depends on the infrastructure built here.
- **Dead coupon incentive** — 97 feedback rows, 91 quality-approved, **0 coupons issued**,
  because `app/api/feedback/route.ts:123` requires `!is_anonymous && authenticatedUserId`
  and all 97 submissions are anonymous. `validateCouponCode()` in the subscribe route is
  therefore unreachable in practice.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Provider | **Resend** (`resend/resend-email`) | Only messaging provider returned by `vercel integration discover --category messaging` |
| From address | `BSIT Survival Kit <noreply@mail.lawrenceigen.me>` | Only domain under DNS control. Subdomain isolates the root domain's sending reputation. `.vercel.app` cannot send — no DNS access |
| Account required to buy | **Yes** | Guarantees an email address and a portable, device-independent purchase |
| Delivery architecture | Outbox + immediate send (hybrid) | Instant receipts without losing mail to webhook idempotency |
| Expiry warning | 4 days before `current_period_end` | Survives a once-daily cron with margin |
| Win-back | 3 days after expiry, once, never repeated | — |

### The idempotency trap this design exists to avoid

The naive approach — send inline from the webhook — is broken. `recordPayment` is
idempotent on `linkId`; on a replay it returns `{ deduped: true }` and the handler
returns early. So if Resend is unavailable during the first delivery, PayMongo's retry
hits the dedupe branch and returns **before reaching any email code**. The receipt is
lost permanently, and the more reliable the payment path is, the more completely it
swallows the failure.

Writing the outbox row in the same path as the payment, and retrying from a cron that is
independent of PayMongo's retry behaviour, is the point of the design.

## Architecture

```
PayMongo webhook ──┬─→ recordPayment (existing, unchanged semantics)
                   ├─→ INSERT email_outbox (receipt, welcome)
                   └─→ best-effort send now → mark sent | failed
                                                    │
Vercel cron (daily) ───────────────────────────────┴─→ retry unsent
                   └─→ scan subscriptions.current_period_end
                          → enqueue expiry warnings (T-4d)
                          → enqueue win-back (T+3d)
```

### Components

| Path | Responsibility |
|---|---|
| `lib/email/client.ts` | Resend wrapper. Single `send()`. Never throws into the caller — returns a result |
| `lib/email/templates/*.ts` | Pure functions → `{ subject, html, text }`. No I/O, trivially testable |
| `lib/email/outbox.ts` | Enqueue + drain logic, isolated from both the webhook and the cron |
| `supabase/migrations/*_email_outbox.sql` | Table + indexes |
| `app/api/cron/email/route.ts` | Drains unsent, generates scheduled sends |
| `app/api/webhooks/paymongo/route.ts` | Enqueue + attempt send. **Must never fail a payment because of an email error** |
| `/api/subscribe` + unlock page | Require sign-in before a link is created |

### Data model

```sql
create table email_outbox (
  id uuid primary key default gen_random_uuid(),
  kind text not null,              -- receipt | welcome | expiry_warning | winback
  user_id uuid not null,
  to_email text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',   -- pending | sent | failed
  attempts int not null default 0,
  last_error text,
  send_after timestamptz not null default now(),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
```

**Deduplication:** a partial unique index on `(kind, user_id, payload->>'scope_key')`
prevents the cron from enqueueing a second expiry warning for the same subscription on a
later run. This is the mechanism that makes win-back "once, never repeated" true rather
than aspirational.

## Email specifications

| Kind | Trigger | Content |
|---|---|---|
| `receipt` | Webhook, on payment | Plan bought, amount paid, exact access-end date, link back to the content |
| `welcome` | Webhook, alongside receipt | What was unlocked, where the answer keys are, how to return |
| `expiry_warning` | Cron, 4 days before `current_period_end` | What is about to lock, when, one-click renew |
| `winback` | Cron, 3 days after expiry | What they lost access to, renew link |

All four are transactional consequences of a purchase, so they carry no marketing
unsubscribe requirement — but every template still includes a plain-text part and an
unambiguous sender identity, because HTML-only mail is a deliverability liability.

## Error handling

- An email failure **must never** turn a successful payment into a failed webhook.
  All email work in the webhook is wrapped and swallowed; failures land in
  `email_outbox.last_error` instead.
- The cron caps `attempts` (5) and stops retrying, leaving the row queryable as `failed`.
- A payment whose `user_id` is null cannot be emailed. With sign-in now required this
  should be unreachable, but the code must handle it rather than assume — legacy links
  created before this change are still live and can still be paid.
- The cron endpoint authenticates via `CRON_SECRET`; an unauthenticated call is a 401.

## Testing

- **Templates:** pure functions — snapshot subject/text/html for each of the four.
- **Outbox:** enqueue dedupes on repeat; drain marks sent; drain records `last_error` and
  increments `attempts` on failure; attempts cap halts retries.
- **Webhook:** a payment still succeeds (200, ledger row written, subscription granted)
  when the email client throws. This is the single most important test in the spec.
- **Cron:** enqueues at exactly T-4d and T+3d; does not double-enqueue across two runs;
  rejects unauthenticated callers.
- **Checkout gate:** anonymous request to `/api/subscribe` is refused; signed-in succeeds.

Resend is mocked throughout. No test performs a live send.

## Assumptions to verify at build time

1. **Cron frequency.** Vercel Hobby permits one cron per day; the design tolerates this.
   Plan tier could not be read back from the CLI (`plan: None`) and should be confirmed.
2. **DNS.** `mail.lawrenceigen.me` needs Resend's DKIM/SPF records. The domain is on
   Vercel nameservers, so this is a dashboard task, not a registrar transfer.
3. **Provisioning.** `vercel integration add resend/resend-email` is interactive on CLI
   58.5.1 and must be run by the user.
