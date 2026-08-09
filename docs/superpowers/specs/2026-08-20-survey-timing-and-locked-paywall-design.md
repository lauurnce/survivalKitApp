# Survey Timing and Locked Paywall — Design

**Date:** 2026-08-20
**Branch:** `feat/survey-timing-and-locked-paywall`
**Mockup:** `docs/mockups/2026-08-20-survey-and-paywall.html`

## Problem

Two upsell surfaces interrupt readers before they have received anything.

**The survey fires on mount.** `components/ModuleReaderClient.tsx` calls
`trackModuleView(moduleId)` inside a mount `useEffect`. Once the random 3–5 module
counter in `hooks/useFeedbackPrompt.ts` trips, a full-screen modal covers the lesson
before the reader has read a word. Asking someone to rate a module they have not read
produces noise, not signal.

**Pricing repeats per section.** `components/SectionRenderer.tsx` renders a full
three-card `SubscribeGate` (₱49 / ₱99 / ₱299) for *every* locked activity section. A
module with three locked reviewers shows the same pricing table three times, and
`components/PaywallTeaser.tsx` quotes ₱99/₱299 in prose above them. Seven peso figures
on one page reads as pressure, not as an offer.

## Non-goals

- No change to server-side content gating. Locked activity bodies must keep never
  reaching the client.
- No change to the free-sample rule (`lib/freeSample.ts`): a locked visitor still gets
  the subject's first reviewer in full.
- No pricing changes. ₱49 / ₱99 / ₱299 stay as they are.
- No new event types, and no change to the events CHECK constraint.

## Design

### 1. Survey — inline, on confirmed completion

The survey stops being a modal and stops firing on mount. It renders as an inline card
in the module footer, between the "Mark done" row and the "Up next" link, and only
after the reader marks the module done.

`components/ModuleDoneToggle.tsx` already has the correct trigger point:

```ts
if (share && result === true) showPrompt();
```

`result === true` is a *server-acknowledged* completion, not the optimistic local
update, and the branch already excludes un-marking. The survey rides that same signal.

`ModuleDoneToggle` is also used on the modules-list page, where no survey exists, so the
trigger travels through a React context whose default is a no-op. The existing
share-card toast keeps firing from the same branch; the two do not collide because the
toast is `position: fixed` and the survey is in normal flow.

**Eligibility gates**, all of which must pass:

| Gate | Source |
|---|---|
| Confirmed completion just happened | new |
| No prompt in the last 24h | existing `last-feedback-prompt` key |
| This module not already rated | new, per-module suppression |
| Not previously dismissed | existing key, see bug below |

The random 3–5 module counter is **removed**. Mark-as-done is already a rare,
high-intent action; stacking a counter on top would silence the survey almost entirely.

**Bug fixed in passing:** `closeFeedback` in `hooks/useFeedbackPrompt.ts` never persists
`isOpen: false` back to localStorage, so dismissing the survey today re-opens it on the
next module. The dismissal is now persisted.

The form itself is unchanged — same `/api/feedback` POST, same coupon-code response,
same anonymous checkbox, same 500-character limit. Only the chrome changes: no backdrop,
no overlay, and "Cancel" becomes a quieter "Not now".

### 2. Paywall — locked strips plus one pricing page

Each locked reviewer becomes a compact `LockedReviewer` strip: a lock glyph, a
`REVIEWER — LOCKED` label, one line of body copy, and an "Unlock →" button. No prices.

Pricing moves to a new route:

```
/unlock?year=<uuid>&subject=<uuid>&from=/year/<uuid>/subjects/<uuid>/modules/<uuid>
```

`PaywallTeaser` keeps its value message ("N reviewers … The first one's free") and its
CTA but drops the peso figures, so pricing lives in exactly one place.

**The return trip is the constraint that shapes this.** `lib/subscribeRedirect.ts`
`buildSuccessUrl()` only accepts a `returnPath` matching
`/year/<uuid>/subjects/<uuid>/modules/<uuid>`, and verifies the year — and, for subject
plans, the subject — matches the plan purchased. Anything else falls back to
`/account?payment=success`.

`SubscribeGate` currently sends `window.location.pathname`. On `/unlock` that value is
`/unlock`, which would strand every payer on `/account` instead of returning them to
their lesson. So `/unlock` forwards its `from` param as `returnPath` instead.

`from` is attacker-controllable and is validated before use: same-origin relative path
only, rejecting `//evil.com`, absolute URLs, and anything not matching the module-route
shape. `buildSuccessUrl` is **not** weakened — its existing validation remains the
security boundary, and this is a second check in front of it.

### 3. One status request per page

`useSubscriptionStatus` extracts the `/api/subscription-status` check and the
`?payment=success` polling loop (10 polls, 3s apart) duplicated today across
`SubscribeGate` and `PaywallTeaser`. A module page with three locked sections currently
fires four identical status requests; a context provider reduces that to one.

After payment, PayMongo returns the reader to `…/modules/<id>?payment=success`. The
locked strips poll, and on confirmation reload the route — the content is server-gated,
so a reload is what actually swaps the strips for real reviewers.

## Analytics

No migration. `'unlock_click'` is already in the events CHECK constraint
(`supabase/migrations/20260713000000_events_add_share_card_types.sql`) and in the
`EventType` union, currently unused; the locked strip adopts it.

`paywall_teaser_view`, `paywall_teaser_click`, and `subscribe_click` keep firing
unchanged, so the funnel aggregate in
`supabase/migrations/20260808000001_growth_funnel_agg.sql` keeps working. `unlock_click`
becomes a new intermediate step the existing aggregate simply ignores.

## Accepted trade-off

Buying now costs a page navigation. Pricing is no longer unavoidable, so conversion may
drop. The `unlock_click` → `subscribe_click` ratio measures the cost directly, and the
existing funnel needs no changes to report it. This is a deliberate trade of conversion
pressure for reading calm, made by the owner.

## Scope

No per-subject work. Every subject renders through the same `SectionRenderer` and
`ModuleReaderClient`; there is no per-subject branching anywhere in the reader. The
change is roughly eight shared files plus two new ones, and it applies to every subject
at once.

| File | Change |
|---|---|
| `hooks/useFeedbackPrompt.ts` | drop counter and mount trigger; add per-module suppression; fix dismissal persistence |
| `components/ModuleReaderClient.tsx` | provide completion context; stop tracking on mount |
| `components/ModuleDoneToggle.tsx` | emit survey trigger on confirmed completion |
| `components/FeedbackPrompt.tsx` | inline card presentation; logic unchanged |
| `app/(main)/…/modules/[moduleId]/page.tsx` | render survey in footer; drop `ctaHref` |
| `components/LockedReviewer.tsx` | **new** — compact locked strip |
| `components/SectionRenderer.tsx` | render `LockedReviewer` instead of `SubscribeGate` |
| `components/SubscribeGate.tsx` | pricing UI moves to `/unlock`; checkout preserved |
| `components/PaywallTeaser.tsx` | strip prices; `ctaHref` optional with computed default |
| `hooks/useSubscriptionStatus.ts` | **new** — shared status check and payment polling |
| `app/(main)/unlock/page.tsx` | **new** — the single pricing surface |
| `app/(main)/…/modules/page.tsx` | update teaser call site |

## Testing

- Survey does not render on mount; renders after a confirmed completion; does not render
  on un-marking; is suppressed by the 24h cooldown, by prior rating of that module, and
  by a prior dismissal that survives remount.
- `from` validation rejects `//evil.com`, absolute URLs, `/account`, and mismatched
  years, and `buildSuccessUrl`'s existing tests keep passing.
- A locked module page renders N strips and zero peso figures.
