# Payment Redirect-Unlock Fix — Design

**Date:** 2026-06-25
**Branch:** feat/user-accounts
**Status:** Approved design → implementation

## Problem

A real ₱50 payment never appeared on the admin dashboard. Investigation (Vercel logs + live DB) found:

1. PayMongo received the money (₱49.25 payout) but logged **zero webhook delivery attempts**, and `/api/subscribe` was **never called** — the payment came through a **static GCash QR**, not the in-app Subscribe button. A static QR carries no `device_id`/`year`/`subject`/`user`, so it can never produce a `link.payment.paid` event tied to the app, and can never be recorded.
2. Separately, even a *correct* Subscribe-button payment does not reliably auto-unlock on return, because:
   - `/api/subscribe` builds `successUrl = /year/{yearId}/subjects` with **no `?payment=success`** marker.
   - `SubscribeGate` only auto-starts its unlock poll when it sees `?payment=success` (`SubscribeGate.tsx:100`).
   - The redirect target (`/year/{yearId}/subjects`, the subject **list**) is **not** where `SubscribeGate` is mounted (the **module** page). So the marker, even if present, would land where the gate doesn't exist.
   - The only thing that ever started the poll was the manual **"I already paid"** button (`SubscribeGate.tsx:290-301`), which was added for static-QR payers.

The decision (confirmed with the product owner): **drop the QR / "I already paid" path** and make Subscribe-button payments auto-unlock on return.

## What is already correct (do NOT change)

The account/payment backend is fully wired and verified against the live DB:

- `lib/paymongo.ts` embeds `user:<userId>` in remarks when logged in.
- `/api/webhooks/paymongo` parses `year:/subject:/device:/user:` and calls `recordPayment`.
- `lib/payments.ts#recordPayment` writes the `payments` ledger row + upserts `subscriptions`, idempotent on `paymongo_link_id`, with `user_id`.
- `lib/subscriptions.ts#isSubscribed` reads by `user_id` when logged in, else `device_id`.
- `lib/auth/claim.ts#claimDeviceRows` backfills `user_id` onto device-keyed rows on login.
- `subscriptions` and `payments` both have nullable `user_id` columns in the **live** DB (`20260624200000_accounts_user_id.sql` applied). **No migration required.**

## Design

### Change 1 — Redirect back to the exact module page with `?payment=success`

`SubscribeGate` knows its own path (it renders on the module page). It will send a `returnPath` to `/api/subscribe`. The route validates `returnPath` against a strict allowlist regex and builds the success URL from it.

- **Client** (`SubscribeGate.tsx`): include `returnPath: window.location.pathname` in the POST body to `/api/subscribe`.
- **Server** (`/api/subscribe`): accept optional `returnPath`. Validate it by splitting on `/` and checking the route shape `year/<uuid>/subjects/<uuid>/modules/<uuid>`, running the existing `isUuid` helper on each id segment (stricter and consistent with the rest of the codebase than a hand-rolled char class). The path's `yearId`/`subjectId` segments must also equal the request's `yearId`/`subjectId` so a payer cannot craft a return path for content they did not pay for. If it validates, `successUrl = ${origin}${returnPath}?payment=success`. If it is missing or fails validation, fall back to `${origin}/year/${yearId}/subjects?payment=success`. This prevents open-redirect (no free-form paths, no external origins — `origin` is still chosen from the existing `ALLOWED_ORIGINS` allowlist).
- The `failed` redirect stays on the same page **without** `?payment=success` (so a cancelled payment doesn't trigger a doomed poll).

### Change 2 — Remove the QR / "I already paid" path

Delete the "Manual trigger for QR code payers" button and its comment (`SubscribeGate.tsx:290-301`). Its only legitimate function (starting the poll) is now handled automatically by the `?payment=success` detection in Change 1. The "Paid via GCash, Maya, or card. Cancel anytime." helper line stays.

### Change 3 — Clarify the poll-timeout message

If polling exhausts `MAX_POLLS` without confirmation (webhook lag), the copy should clearly tell the user to refresh in a moment rather than read as an error. Adjust the existing string only; no behavior change.

## Components and data flow

```
[Subscribe button] --POST /api/subscribe { yearId, subjectId?, deviceId, returnPath }-->
  validate returnPath (allowlist) -> createPaymongoLink(..., successUrl = returnPath?payment=success)
  --> PayMongo checkout --> user pays
  --> (a) PayMongo redirects browser to successUrl (?payment=success)
        --> SubscribeGate mounts on module page, sees ?payment=success, polls /api/subscription-status
        --> isSubscribed() true once webhook recorded --> unlock in place
  --> (b) PayMongo fires link.payment.paid --> /api/webhooks/paymongo --> recordPayment (unchanged)
```

(a) and (b) race; the poll (up to 30s) covers webhook latency. Idempotent recording means double-processing is safe.

## Error handling

- Invalid/missing `returnPath` → safe fallback URL (subjects list + marker). No open-redirect possible.
- Payment cancelled/failed → redirect without marker → no poll, gate stays as-is.
- Webhook slow beyond 30s poll → friendly "refresh in a moment" message; a manual refresh re-runs the initial `checkSubscription()` on mount and unlocks.

## Testing

- **Unit (new):** `successUrl` builder / `returnPath` validation —
  - valid module path → `${origin}${path}?payment=success`
  - missing path → fallback `${origin}/year/{yearId}/subjects?payment=success`
  - non-module path (e.g. `/admin`, `/year/x`) → rejected → fallback
  - external/protocol-relative attempt (e.g. `//evil.com`, `https://evil`) → rejected → fallback
- **Existing suites must stay green:** `lib/paymongo.test.ts`, `lib/payments.test.ts`, `lib/subscriptions.test.ts`.
- **Manual:** load a module page with `?payment=success` and confirm the gate shows the polling banner and unlocks once a subscription row exists.

## Out of scope

- Reconciling the specific past QR payment (handled separately, on request).
- Any migration (none needed).
- Auth/login flow and dark-mode work currently in flight.
- A persistent admin "manual grant" UI (could be a later enhancement if QR payments continue).
