# Discovery & Re-engagement — Spec B

**Date:** 2026-06-18
**Status:** Approved

## Problem

Returning users land on the home page with no signal of where they left off or what content is popular. There is no pull to re-enter the app and no cross-subject discovery mechanism.

## Goal

Two targeted additions to the home page (`app/page.tsx`):
1. **"Continue reading"** — surfaces the last module a user visited so they can resume in one click.
2. **"Popular right now"** — shows the top 5 most-read modules across all subjects, giving new and returning users a discovery hook.

Both are additive — first-time visitors and users with no read history see the home page exactly as it is today.

---

## Feature 1: Continue Reading

### Last-visited tracking — `components/LastModuleTracker.tsx`

A `"use client"` component that renders nothing visually. On mount (`useEffect`), it writes to `localStorage` under key `bsit_last_module`:

```ts
{
  moduleId: string;
  subjectId: string;
  yearId: string;
  moduleTitle: string;
  subjectTitle: string;
}
```

This component is rendered inside the module reader page (`app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx`). The server component already has all five values; they are passed as props to `LastModuleTracker`.

### Display — `components/ContinueReading.tsx`

A `"use client"` component. On mount, reads `bsit_last_module` from `localStorage`. 

- **If data exists:** renders a card with label `"Continue reading"`, the module title as a `<Link>` to `/year/${yearId}/subjects/${subjectId}/modules/${moduleId}`, and the subject title as secondary context below.
- **If no data:** renders `null` — the home page is unchanged for first-time visitors.

Placed in `app/page.tsx` between the hero block and the footer, above `PopularModules`.

---

## Feature 2: Popular Right Now

### Data — server-side in `app/page.tsx`

Three sequential Supabase queries (all server-side, results cached via `revalidate = 300`):

1. Top 5 rows from `counters` where `resource_type = 'module'`, ordered by `read_count` desc, filtered `read_count > 0`, limit 5. Extract the `resource_id` list.
2. Fetch those modules: `modules.select("id, title, subject_id").in("id", topModuleIds)`.
3. Fetch the subjects for those modules: `subjects.select("id, title, year_id").in("id", subjectIds)`, then fetch `years.select("id, label").in("id", yearIds)`.

If step 1 returns zero rows, skip steps 2–3 and pass an empty array to `PopularModules`.

### Display — `components/PopularModules.tsx`

A server component (no `"use client"`). Receives a typed array:

```ts
interface PopularModule {
  moduleId: string;
  moduleTitle: string;
  subjectTitle: string;
  yearLabel: string;
  subjectId: string;
  yearId: string;
}
```

- **If array is empty:** returns `null` — section hidden entirely.
- **If non-empty:** renders a section labelled `"Popular right now"` with up to 5 rows. Each row: module title as a `<Link>` to the reader page, breadcrumb `yearLabel · subjectTitle` in small monospace text below.

---

## Commit Plan

| # | Commit | Files |
|---|--------|-------|
| 1 | `feat(ui): add LastModuleTracker to module reader page` | `components/LastModuleTracker.tsx` (new), `app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx` |
| 2 | `feat(ui): add ContinueReading component to home page` | `components/ContinueReading.tsx` (new), `app/page.tsx` |
| 3 | `feat(ui): add PopularModules section to home page` | `components/PopularModules.tsx` (new), `app/page.tsx` |
| 4 | `feat(ui): add revalidate cache and wire final home page layout` | `app/page.tsx` — add `export const revalidate = 300`, finalize section order (ContinueReading above PopularModules), verify tsc |

---

## Out of Scope

- Spec A features (next-module CTA, accordion) — already shipped.
- Notification or email re-engagement ("notify me when 3rd year is ready").
- Personalised recommendations beyond last-visited and global read counts.
- Sorting popular modules by recency rather than total reads.
