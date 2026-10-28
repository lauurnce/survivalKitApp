# Coming Soon — 3rd & 4th Year Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3rd Year and 4th Year cards to the year-selection page that open a "Coming Soon" modal instead of navigating.

**Architecture:** A `coming_soon` boolean column on the `years` table gates behaviour. The server component fetches data and passes pre-shaped props to a new `YearGrid` client component, which manages modal state. A separate `ComingSoonModal` component renders the overlay.

**Tech Stack:** Next.js 14 App Router, React `useState`, Supabase (Postgres), Tailwind CSS, TypeScript.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `supabase/migrations/20260618000002_coming_soon_years.sql` | Adds `coming_soon` column to `years` |
| Create | `supabase/migrations/20260618000003_seed_3rd_4th_year.sql` | Inserts 3rd & 4th year rows |
| Modify | `supabase/seed.sql` | Keeps local seed in sync |
| Modify | `lib/supabase/types.ts` | Adds `coming_soon` to years Row/Insert/Update |
| Create | `components/ComingSoonModal.tsx` | Overlay modal with dismiss |
| Create | `components/YearGrid.tsx` | Client grid — renders cards, manages modal state |
| Modify | `app/year/page.tsx` | Passes shaped data to YearGrid; stays server component |

---

## Task 1: Add `coming_soon` column to `years` table

**Files:**
- Create: `supabase/migrations/20260618000002_coming_soon_years.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260618000002_coming_soon_years.sql
alter table years
  add column if not exists coming_soon boolean not null default false;
```

- [ ] **Step 2: Apply the migration to the remote DB via Supabase MCP**

Use the `mcp__plugin_supabase_supabase__apply_migration` tool (or `supabase db push` locally).
The migration should complete with no errors.

- [ ] **Step 3: Verify the column exists**

Run in Supabase SQL editor or via MCP `execute_sql`:
```sql
select column_name, data_type, column_default, is_nullable
from information_schema.columns
where table_name = 'years' and column_name = 'coming_soon';
```
Expected: one row — `coming_soon`, `boolean`, `false`, `NO`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260618000002_coming_soon_years.sql
git commit -m "feat(db): add coming_soon column to years table"
```

---

## Task 2: Seed 3rd and 4th year as coming soon

**Files:**
- Create: `supabase/migrations/20260618000003_seed_3rd_4th_year.sql`
- Modify: `supabase/seed.sql`

- [ ] **Step 1: Create the seed migration**

```sql
-- supabase/migrations/20260618000003_seed_3rd_4th_year.sql
insert into years (id, label, sort_order, coming_soon) values
  ('00000000-0000-0000-0000-000000000003', '3rd Year', 3, true),
  ('00000000-0000-0000-0000-000000000004', '4th Year', 4, true)
on conflict (id) do nothing;
```

- [ ] **Step 2: Apply the migration to the remote DB**

Use `mcp__plugin_supabase_supabase__apply_migration` or `supabase db push`.

- [ ] **Step 3: Verify rows were inserted**

```sql
select id, label, sort_order, coming_soon from years order by sort_order;
```
Expected: 4 rows — 1st Year (false), 2nd Year (false), 3rd Year (true), 4th Year (true).

- [ ] **Step 4: Update `supabase/seed.sql` to keep local resets in sync**

Open `supabase/seed.sql`. The current Years block is:
```sql
insert into years (id, label, sort_order) values
  ('00000000-0000-0000-0000-000000000001', '1st Year', 1),
  ('00000000-0000-0000-0000-000000000002', '2nd Year', 2)
on conflict do nothing;
```

Replace it with:
```sql
insert into years (id, label, sort_order, coming_soon) values
  ('00000000-0000-0000-0000-000000000001', '1st Year', 1, false),
  ('00000000-0000-0000-0000-000000000002', '2nd Year', 2, false),
  ('00000000-0000-0000-0000-000000000003', '3rd Year', 3, true),
  ('00000000-0000-0000-0000-000000000004', '4th Year', 4, true)
on conflict do nothing;
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260618000003_seed_3rd_4th_year.sql supabase/seed.sql
git commit -m "feat(db): seed 3rd and 4th year as coming soon"
```

---

## Task 3: Add `coming_soon` to TypeScript types

**Files:**
- Modify: `lib/supabase/types.ts`

- [ ] **Step 1: Update the `years` table type**

In `lib/supabase/types.ts`, find the `years` block (currently at line 49–53):
```ts
      years: {
        Row: { id: string; label: string; sort_order: number };
        Insert: { id?: string; label: string; sort_order: number };
        Update: Partial<{ label: string; sort_order: number }>;
      };
```

Replace it with:
```ts
      years: {
        Row: { id: string; label: string; sort_order: number; coming_soon: boolean };
        Insert: { id?: string; label: string; sort_order: number; coming_soon?: boolean };
        Update: Partial<{ label: string; sort_order: number; coming_soon: boolean }>;
      };
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/types.ts
git commit -m "feat(types): add coming_soon to years type"
```

---

## Task 4: Add ComingSoonModal, YearGrid, and update year page

**Files:**
- Create: `components/ComingSoonModal.tsx`
- Create: `components/YearGrid.tsx`
- Modify: `app/year/page.tsx`

### Step group A — ComingSoonModal

- [ ] **Step 1: Create `components/ComingSoonModal.tsx`**

```tsx
"use client";

interface Props {
  yearLabel: string;
  onClose: () => void;
}

export function ComingSoonModal({ yearLabel, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-navy text-paper mx-4 max-w-sm w-full p-10 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe">
          {yearLabel}
        </p>
        <h2 className="font-serif text-display-md text-paper leading-none">
          Coming Soon
        </h2>
        <p className="font-sans text-sm text-taupe leading-relaxed">
          Content for this year is being written. Check back soon.
        </p>
        <button
          onClick={onClose}
          className="self-start font-sans text-sm uppercase tracking-widest text-taupe hover:text-paper transition-colors duration-150"
        >
          Close ×
        </button>
      </div>
    </div>
  );
}
```

### Step group B — YearGrid

- [ ] **Step 2: Create `components/YearGrid.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCount } from "@/lib/counters";
import { ComingSoonModal } from "@/components/ComingSoonModal";

export interface YearCardData {
  id: string;
  label: string;
  coming_soon: boolean;
  stats: { total: number; sem1: number; sem2: number; major: number; minor: number };
  readers: number;
}

interface Props {
  cards: YearCardData[];
}

export function YearGrid({ cards }: Props) {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {cards.map((year, i) => {
          if (year.coming_soon) {
            return (
              <button
                key={year.id}
                onClick={() => setActiveLabel(year.label)}
                className="group border border-ink-faint hover:border-navy hover:bg-navy p-8 flex flex-col gap-4 transition-colors duration-200 text-left"
              >
                <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint group-hover:text-taupe transition-colors duration-200">
                  § 0{i + 1}
                </span>
                <h2 className="font-serif text-display-md text-ink group-hover:text-paper transition-colors duration-200">
                  {year.label}
                </h2>
                <span className="font-sans text-sm text-ink-faint mt-auto group-hover:text-taupe transition-colors duration-200">
                  Coming soon
                </span>
              </button>
            );
          }

          return (
            <Link
              key={year.id}
              href={`/year/${year.id}/subjects`}
              className="group border border-ink-faint hover:border-navy hover:bg-navy p-8 flex flex-col gap-4 transition-colors duration-200"
            >
              <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint group-hover:text-taupe transition-colors duration-200">
                § 0{i + 1}
              </span>
              <h2 className="font-serif text-display-md text-ink group-hover:text-paper transition-colors duration-200">
                {year.label}
              </h2>

              {year.stats.total > 0 && (
                <div className="flex flex-col gap-1 mt-1">
                  <p className="font-sans text-xs text-ink-muted group-hover:text-taupe transition-colors duration-200">
                    {year.stats.major} major · {year.stats.minor} minor
                  </p>
                  <p className="font-sans text-xs text-ink-faint group-hover:text-taupe/70 transition-colors duration-200">
                    Sem 1: {year.stats.sem1} subjects · Sem 2: {year.stats.sem2} subjects
                  </p>
                </div>
              )}

              <span className="font-sans text-sm text-ink-muted mt-auto group-hover:text-paper transition-colors duration-200">
                View subjects →
              </span>

              <div className="flex items-center gap-2 pt-3 border-t border-ink-faint/20 group-hover:border-taupe/20 transition-colors duration-200">
                <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint group-hover:text-taupe transition-colors duration-200">
                  <span className="text-ink-muted group-hover:text-taupe/80 transition-colors duration-200">
                    {formatCount(year.readers)}
                  </span>{" "}
                  readers
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {activeLabel && (
        <ComingSoonModal
          yearLabel={activeLabel}
          onClose={() => setActiveLabel(null)}
        />
      )}
    </>
  );
}
```

### Step group C — Update year page

- [ ] **Step 3: Update `app/year/page.tsx`**

Replace the entire file with:

```tsx
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { PageTracker } from "@/components/PageTracker";
import { YearGrid, type YearCardData } from "@/components/YearGrid";

export const revalidate = 300;

export default async function YearPage() {
  const supabase = createServerClient();
  const [{ data: years }, { data: subjects }, { data: yearCounters }] = await Promise.all([
    supabase.from("years").select("*").order("sort_order"),
    supabase.from("subjects").select("id, year_id, semester, kind"),
    supabase.from("counters").select("resource_id, reader_count").eq("resource_type", "year"),
  ]);

  const cards: YearCardData[] = (years ?? []).map((year) => {
    const rows = subjects?.filter((s) => s.year_id === year.id) ?? [];
    return {
      id: year.id,
      label: year.label,
      coming_soon: year.coming_soon,
      stats: {
        total: rows.length,
        sem1: rows.filter((s) => s.semester === 1).length,
        sem2: rows.filter((s) => s.semester === 2).length,
        major: rows.filter((s) => s.kind === "major").length,
        minor: rows.filter((s) => s.kind === "minor").length,
      },
      readers: yearCounters?.find((c) => c.resource_id === year.id)?.reader_count ?? 0,
    };
  });

  return (
    <main className="min-h-screen bg-paper flex flex-col">
      <PageTracker event="year_select" />

      {/* Page header — dark navy */}
      <div className="bg-navy px-6 py-12 md:px-16 md:py-16">
        <div className="flex items-center justify-between gap-4">
          <BackLink href="/" label="Home" className="text-taupe hover:text-paper" />
          <Link
            href="/search"
            className="inline-flex items-center gap-2 font-sans text-sm text-taupe hover:text-paper transition-colors duration-150"
          >
            <span className="text-accent">⌕</span>
            <span>Search</span>
          </Link>
        </div>
        <div className="mt-10">
          <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe mb-4">
            § 01 — Select Year
          </p>
          <h1 className="font-serif text-display-lg text-paper">
            Which year are you in?
          </h1>
        </div>
      </div>

      {/* Year cards — cream */}
      <div className="flex-1 px-6 py-12 md:px-16 md:py-16">
        <YearGrid cards={cards} />
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Smoke-test in the browser**

Start the dev server (`npm run dev`) and open `/year`. Verify:
- 4 cards appear in the grid.
- Clicking "1st Year" or "2nd Year" navigates to subjects as before.
- Clicking "3rd Year" or "4th Year" opens the modal overlay.
- Clicking the backdrop or "Close ×" dismisses the modal.

- [ ] **Step 6: Commit**

```bash
git add components/ComingSoonModal.tsx components/YearGrid.tsx app/year/page.tsx
git commit -m "feat(ui): add coming soon modal for 3rd and 4th year cards"
```
