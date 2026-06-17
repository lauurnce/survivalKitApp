# Admin Dashboard Enhancements — Design Spec

**Date:** 2026-06-16  
**Status:** Approved

---

## Goal

Make the admin dashboard more informative and actionable by surfacing:
- Currently active users (last 15 minutes)
- New users (first seen within last 3 days)
- Recurring users (first seen more than 3 days ago)
- Total revenue derived from approved unlocks

---

## Data Model Context

- Users are anonymous devices identified by `device_id` (no accounts)
- Activity is tracked via the `events` table with `event_type` and `created_at`
- "Active" = device that fired an `enter` event recently
- "First seen" = earliest `enter` event for a given `device_id`

---

## Changes

### 1. `app/admin/page.tsx`

Add two new queries inside the existing `Promise.all`:

**Query A — Active Now:**
```ts
supabase
  .from("events")
  .select("device_id")
  .eq("event_type", "enter")
  .gte("created_at", fifteenMinutesAgo)
```
Yields: `activeNow` = count of distinct device_ids

**Query B — All-time enter events (for new/recurring classification):**
```ts
supabase
  .from("events")
  .select("device_id, created_at")
  .eq("event_type", "enter")
  .order("created_at", { ascending: true })
  .limit(50000)
```
In JS: build `Map<device_id, first_seen>` (first occurrence wins due to ascending order).  
Then:
- `newUsers` = devices where `first_seen >= threeDaysAgo`
- `recurringUsers` = devices where `first_seen < threeDaysAgo`

**Derived — Revenue:**
```ts
const totalRevenue = approvedUnlocks * 20  // ₱20 per unlock
```
No extra query needed.

**New constants:**
```ts
const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
```

**New props passed to `<AdminDashboard />`:**
- `activeNow: number`
- `newUsers: number`
- `recurringUsers: number`
- `totalRevenue: number`

---

### 2. `components/AdminDashboard.tsx`

**Props interface** — add `activeNow`, `newUsers`, `recurringUsers`, `totalRevenue`.

**Overview section** — expand from 4-stat to 8-stat grid (2 rows of 4):

| Row 1 | Row 2 |
|---|---|
| Active Now (15 min) | Today |
| Total Users | 7-day Sessions |
| New Users (3d) | Revenue ₱ |
| Recurring Users | Pending Unlocks ⚠ |

Visual treatments:
- "Active Now" shows a green pulsing dot (CSS `animate-pulse`) to signal live-ish data
- "Pending Unlocks" retains accent color when > 0
- Revenue shows ₱ prefix in the label

**`Stat` component** — add optional `dot` prop (renders animated green dot beside value).

---

## What Does NOT Change

- Onboarding funnel
- DAU chart
- Content engagement bar charts
- Unlock funnel
- Pending unlocks action table

---

## Acceptance Criteria

- [ ] Active Now shows distinct device count for enter events in last 15 min
- [ ] New Users shows devices first seen within last 3 days
- [ ] Recurring Users shows devices first seen more than 3 days ago
- [ ] New + Recurring ≤ Total Users (recurring doesn't double-count new)
- [ ] Revenue = approvedUnlocks × 20
- [ ] Overview grid renders cleanly on mobile (2×4) and desktop (4×2 or 2×4)
- [ ] No regressions in existing sections
