# BSIT Survival Kit — MVP Monetization & Go/No-Go Signal Design

**Date:** 2026-06-23
**Author:** lauurnce
**Status:** Approved

---

## 1. Problem & Goal

4,000 users have engaged with the app in 9 days (driven by 80k+ TikTok views) but zero revenue has been collected. The funnel breaks at step 5 — `section_view` is not tracked — and there is no payment path yet. Willingness-to-pay is unproven.

**Goal:** Validate willingness-to-pay within 15 days by launching a monthly subscription on the existing Next.js web app. No new platform. No native app yet.

**Success threshold:** 50 paid subscriptions in 15 days, supported by active TikTok posting during semester enrollment season.

---

## 2. Subscription Model

### Pricing

| Plan | Price | Billing |
|------|-------|---------|
| Monthly | ₱50/month | Auto-charged every 30 days via PayMongo |

- Cancel anytime
- No semester plan for now — keeps commitment short while validating the market
- Semester plans and promo codes are post-go-signal features

### Access

A paid subscription unlocks all subjects and modules under the student's selected year level. Coming-soon subjects remain visible but locked until content is published.

---

## 3. Payment Flow (PayMongo)

PayMongo is the payment gateway — supports GCash, Maya, and cards. Individual account signup, no business registration required. ₱100,000/month payout cap (2,000 subs) — more than enough for this sprint.

### Student flow

1. Student taps **Subscribe** on a locked module or subject
2. `subscribe_click` event fires (funnel tracking)
3. Student is redirected to PayMongo hosted checkout
4. Student pays via GCash, Maya, or card
5. PayMongo confirms payment and fires a webhook to the app
6. Webhook handler grants access instantly — no manual approval
7. Student lands back on the app with full year-level access

### Recurring billing

- PayMongo auto-charges the student on the same date each month
- On failed charge: subscription status set to `paused`, student sees an in-app banner prompting them to update payment details
- On cancellation: access remains until end of current billing period

### Admin

- Manual approval queue is removed
- Replaced by a subscriptions table in the admin dashboard

---

## 4. Funnel Fixes

Two missing events must be wired before launch so the full funnel is visible:

| Event | Trigger | Priority |
|-------|---------|----------|
| `section_view` | Student scrolls and reads a section | High |
| `subscribe_click` | Student taps the Subscribe button | High |

The existing funnel steps 1–4 already work. With these two additions the full funnel becomes:

**Opened App → Selected Year → Opened Subject → Opened Module → Read Section → Tapped Subscribe → Paid**

---

## 5. Admin Dashboard Changes

### New: Subscriptions table

| Column | Description |
|--------|-------------|
| Student device ID / email | Identifier |
| Year level | Which year level they subscribed to |
| Status | `active`, `paused`, or `cancelled` |
| Start date | When they first subscribed |
| Next billing date | When PayMongo charges next |

### New: Revenue counters (alongside existing DAU chart)

- Total active subscribers
- Total revenue collected (₱)
- New subscribers today / this week

### Removed

- Manual payment approval queue

---

## 6. Go/No-Go Decision Framework

### The 15-day sprint

Starts the day PayMongo goes live and the first TikTok post drops. Target: ~4 new paid subscribers per day to hit 50 in 15 days.

### Go signal — build the real app

**50+ paid subscribers in 15 days**

Next steps:
- Plan a PWA wrapper (Add to Home Screen, offline support) — 1–2 days of work on the existing Next.js app
- Add semester subscription plans
- Add promo/referral codes for TikTok-driven signups
- Investigate React Native or a dedicated mobile app build

### No-go — diagnose and adjust, do not build the real app yet

**Under 50 paid subscribers in 15 days**

Use the funnel to find the break:

| Symptom | Likely cause | Action |
|---------|-------------|--------|
| High TikTok views, low app opens | Landing page or link friction | Fix the CTA / link in bio |
| High app opens, low module opens | Content or onboarding issue | Improve first-run experience |
| High module opens, low subscribe taps | Paywall placement or value unclear | Move paywall earlier, add preview hook |
| High subscribe taps, low payments | Pricing too high | Try ₱29/month |
| Low TikTok views | Marketing issue | Try different video hooks, post more |

---

## 7. What Is NOT in Scope

These are explicitly deferred until after the go signal:

- Native iOS / Android app
- Semester subscription plans
- Promo / referral codes
- Auto-renewal reminders / push notifications
- School affiliation tracking (which university students are from)
- PayMongo business account upgrade
- Content for additional year levels beyond what's already seeded

---

## 8. Daily Metrics to Watch

Track these every day in the admin dashboard during the 15-day sprint:

- **New subscribers** — are we on pace for 4/day?
- **Subscribe tap → payment conversion rate** — if this is low, pricing or checkout UX is the problem
- **DAU trend** — are TikTok posts driving spikes in app opens?
- **Funnel drop-off** — which step loses the most users each day?
