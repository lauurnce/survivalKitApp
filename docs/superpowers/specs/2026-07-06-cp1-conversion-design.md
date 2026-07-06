# CP1 Conversion Surgery — Design

**Date:** 2026-07-06
**Goal:** Lift paywall conversion (currently ~0.03% of exposed devices, 1 real sale) by reframing the offer around exam reviewers, adding a semester pricing ladder, and letting locked users taste one full activity per subject. Supports the ₱8,000 July revenue target.

## Background

- Both existing plans grant 31 days (`PERIOD_DAYS = 31` in `lib/payments.ts`). "Year Plan" means scope (all subjects in a year level), not duration — it is ₱299/month.
- Payments are one-time PayMongo Links, not recurring; the "Cancel anytime" gate copy is misleading.
- Locked visitors receive only activity headings — the paid value is invisible.
- Paywall funnel events flow as of 2026-07-06 (constraint fix, commit 9f4ab58), so this change's impact is measurable.

## 1. Pricing & payment plumbing

Three plans, defined once in `lib/paymongo.ts` as a typed `PLANS` map (replaces `SUBJECT_AMOUNT` / `YEAR_AMOUNT`):

| Plan key        | Price (centavos) | Scope                          | current_period_end               |
|-----------------|------------------|--------------------------------|----------------------------------|
| `subject_month` | 4900             | one subject                    | paid_at + 31 days (unchanged)    |
| `subject_sem`   | 9900             | one subject                    | `SEMESTER_END`                   |
| `year_sem`      | 29900            | all subjects in the year level | `SEMESTER_END`                   |

- `SEMESTER_END = 2026-12-31 23:59 PH time` (`2026-12-31T15:59:59Z`), a named constant beside `PLANS`. Bumped once per semester.
- **Stale-constant floor:** semester plans grant `max(SEMESTER_END, paid_at + 31 days)` so an outdated constant can never grant less than a month.
- PayMongo link `remarks` gains a `plan:<key>` token. `parseLinkRemarks` parses it. **Legacy inference:** remarks without `plan:` map to `subject_month` (subject present) or legacy year-month behavior at 29900 (no subject), so in-flight links, webhook replays, and the admin reconcile view keep working.
- Webhook keeps underpayment-only rejection: `paidAmount < PLANS[plan].amount` → reject; equal-or-higher → grant.
- `POST /api/subscribe` accepts `plan` (`subject_month` | `subject_sem` | `year_sem`), validates it against scope (subject plans require `subjectId`, `year_sem` forbids it). The existing two-button request shape maps to defaults during rollout (no `plan` field → legacy behavior) but the new UI always sends `plan`.
- `recordPayment` accepts the plan (or a resolved `periodEnd`) instead of hardcoding 31 days. Upgrade path needs no special code: an active ₱49 row upgrading to ₱99 hits the existing update branch and gets its `current_period_end` pushed to `SEMESTER_END`.
- **No DB migration.** Plan is derivable from `payments.amount`; `subscriptions` schema unchanged.

## 2. Gate & teaser reframe

**Vocabulary:** paid content is called **reviewers with answer keys** everywhere a locked user sees it.

`SubscribeGate` — 3-card ladder:

- ₱49 / month — one subject
- ₱99 / semester — one subject — **★ Most Popular** — "access until Dec 31 — covers prelims, midterms, and finals"
- ₱299 / semester — all subjects in the year level — **Best Value**

Copy changes:
- Header: "Reviewers with answer keys — drills, code labs, and full solutions."
- Replace "Cancel anytime" with: "One-time payment via GCash, Maya, or card. No auto-renew — access simply ends with the semester." plus "Instant unlock after payment."

`PaywallTeaser` — same vocabulary, with a concrete count passed from the server page:
> "N reviewers with answer keys in {subject}. The first one's free — unlock the rest for ₱99 until end of semester."

`SectionRenderer` locked heading label: "Activity — Subscribers Only" → "Reviewer — locked".

`AccountSidebar` price labels synced to the new ladder (third display surface).

## 3. Free first reviewer per subject

On the module reader page (`app/(main)/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx`), for locked visitors:

- Compute the subject's **first activity section**: lowest module `sort_order`, then lowest section `sort_order` within it. One extra query, cacheable per subject.
- If the current module contains that section, fetch it in full and render it unlocked (drill, starter code, IDE, answers).
- Immediately after it, an inline upsell banner: "That was 1 of N reviewers in {subject}. Unlock all N →" linking to `#subscribe`.
- Every other activity stays headings-only. The server-side rule is unchanged for all other sections: locked requests never receive gated bodies except this one designated section.

Giveaway cost: ≤ 1 activity per subject (~36 sections app-wide).

## 4. Error handling & edge cases

- Unknown/missing `plan` in `/api/subscribe` → 400.
- Underpaid webhook → rejected (existing behavior, per-plan expected amount).
- Overpaid / manual promo links → grant (existing anti-strand rule).
- Semester purchase after `SEMESTER_END` passes → floor grants 31 days.
- Free-section lookup failing (no activities in subject) → no free section, no upsell banner; page renders as today.

## 5. Testing

TDD on money paths:
- `PLANS` map + `parseLinkRemarks` plan token + legacy inference.
- Webhook expected-amount per plan (under / exact / over).
- `recordPayment` period end per plan, including the stale-constant floor.
- `/api/subscribe` plan validation (scope mismatches → 400).
- First-free-section selection (ordering, subject with no activities).

UI verified by build + manual pass on a locked device. Funnel events (`paywall_teaser_view/click`, `subscribe_click`, payments ledger) provide before/after conversion within days.

## Out of scope

- Recurring billing, promo codes, block/group sales tooling (separate initiative).
- Renaming "activity" in the DB (`sections.kind` stays `activity`).
- 2nd–4th year content changes.
