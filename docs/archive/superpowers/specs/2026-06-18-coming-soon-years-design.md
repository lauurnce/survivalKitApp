# Coming Soon — 3rd & 4th Year Cards

**Date:** 2026-06-18
**Status:** Approved

## Overview

Add 3rd Year and 4th Year to the year-selection page. Because content for these years is not yet written, clicking their cards opens an inline modal overlay ("Coming Soon") instead of navigating. A single `coming_soon` boolean on the `years` table controls this — flipping it to `false` later unlocks a year with no UI changes.

## Database & Types

- **Migration:** Add `coming_soon BOOLEAN NOT NULL DEFAULT false` to the `years` table.
- **Seed migration:** Insert two rows — `3rd Year` (sort_order 3) and `4th Year` (sort_order 4) — both with `coming_soon = true`. Also add them to `supabase/seed.sql` for local resets.
- **Types:** Add `coming_soon: boolean` to the `years.Row` interface in `lib/supabase/types.ts`.

## Component Architecture

### `app/year/page.tsx` (server component — unchanged fetch logic)
Fetches years, subjects, counters as before. Passes the `years` array and `subjectStats` / `readerCount` results as props to `YearGrid`.

### `components/YearGrid.tsx` (new, client component)
- Receives `years`, pre-computed stats, and reader counts as props.
- Manages modal state: `useState<string | null>(null)` — stores the label of the selected coming-soon year (or `null` when closed).
- For each year:
  - `coming_soon === false` → renders existing `<Link>` card (no change).
  - `coming_soon === true` → renders `<button>` card, same visual style, with a `Coming Soon` badge replacing `"View subjects →"`. Reader-count row is hidden. Clicking sets modal state to the year label.

### `components/ComingSoonModal.tsx` (new, client component)
Props: `yearLabel: string`, `onClose: () => void`.

Renders:
- Fixed full-screen dark backdrop (`bg-ink/60 backdrop-blur-sm`).
- Centered card (navy background, cream text) containing:
  - Small label: the year name (e.g. `3rd Year`)
  - Headline: `Coming Soon`
  - Body: `Content for this year is being written. Check back soon.`
  - Dismiss button: `Close` (calls `onClose`)
- Closes on backdrop click or the dismiss button.

## Commit Plan

| # | Commit message | Files touched |
|---|----------------|---------------|
| 1 | `feat(db): add coming_soon column to years table` | `supabase/migrations/20260618000002_coming_soon_years.sql` |
| 2 | `feat(db): seed 3rd and 4th year as coming soon` | `supabase/migrations/20260618000003_seed_3rd_4th_year.sql`, `supabase/seed.sql` |
| 3 | `feat(types): add coming_soon to years type` | `lib/supabase/types.ts` |
| 4 | `feat(ui): add coming soon modal for 3rd and 4th year cards` | `components/YearGrid.tsx` (new), `components/ComingSoonModal.tsx` (new), `app/year/page.tsx` |

## Out of Scope

- No content seeded for 3rd/4th year subjects or modules.
- No analytics events for coming-soon card clicks (can be added later).
- No email / notification sign-up ("notify me when ready") feature.
