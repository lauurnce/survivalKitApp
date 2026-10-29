# Reader & Read Counters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add public reader counts per year card and read counts per subject/module row, backed by a deduplicated Supabase counter system.

**Architecture:** Two new Supabase tables (`counters`, `counter_log`) and a `record_visit` RPC handle all deduplication atomically. The existing `/api/events` route calls the RPC after logging each event — no new API routes needed. All pages fetch counter rows server-side inside their existing `Promise.all` calls and render counts inline using a shared `formatCount` utility.

**Tech Stack:** Next.js 15 App Router (SSR, `force-dynamic`), Supabase (PostgreSQL + RPC via `supabase-js`), Tailwind CSS, TypeScript, Vitest

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `supabase/migrations/20260615000000_counters.sql` | Create | Tables + RPC SQL |
| `lib/supabase/types.ts` | Modify | Add `counters`, `counter_log`, `record_visit` to Database type |
| `lib/counters.ts` | Create | `formatCount(n)` utility |
| `lib/counters.test.ts` | Create | Unit tests for `formatCount` |
| `app/api/events/route.ts` | Modify | Call `record_visit` RPC after inserting event |
| `app/year/page.tsx` | Modify | Fetch + display year reader counts on cards |
| `app/year/[yearId]/subjects/page.tsx` | Modify | Fetch + display subject read counts inline |
| `app/year/[yearId]/subjects/[subjectId]/modules/page.tsx` | Modify | Fetch + display module read counts below title |

---

## Task 1: Database migration + TypeScript types

**Files:**
- Create: `supabase/migrations/20260615000000_counters.sql`
- Modify: `lib/supabase/types.ts`

- [ ] **Step 1: Write the migration file**

Create `supabase/migrations/20260615000000_counters.sql`:

```sql
-- counters: one row per tracked resource, stores running totals
create table if not exists counters (
  resource_type text not null,
  resource_id   text not null,
  reader_count  int  not null default 0,
  read_count    int  not null default 0,
  primary key (resource_type, resource_id)
);

-- counter_log: one row per device per resource, used for deduplication
create table if not exists counter_log (
  device_id     text        not null,
  resource_type text        not null,
  resource_id   text        not null,
  first_seen_at timestamptz not null default now(),
  last_read_at  timestamptz not null default now(),
  primary key (device_id, resource_type, resource_id)
);

-- index for fast dedup lookups
create index if not exists counter_log_resource_idx
  on counter_log (resource_type, resource_id);

-- record_visit: atomically increments the right counter with dedup logic
create or replace function record_visit(
  p_device_id     text,
  p_resource_type text,
  p_resource_id   text
) returns void language plpgsql security definer as $$
declare
  v_log counter_log%rowtype;
begin
  select * into v_log
  from counter_log
  where device_id     = p_device_id
    and resource_type = p_resource_type
    and resource_id   = p_resource_id;

  if not found then
    -- First visit: insert log, increment the relevant counter only
    insert into counter_log (device_id, resource_type, resource_id)
    values (p_device_id, p_resource_type, p_resource_id);

    if p_resource_type = 'year' then
      insert into counters (resource_type, resource_id, reader_count, read_count)
      values (p_resource_type, p_resource_id, 1, 0)
      on conflict (resource_type, resource_id)
      do update set reader_count = counters.reader_count + 1;
    else
      insert into counters (resource_type, resource_id, reader_count, read_count)
      values (p_resource_type, p_resource_id, 0, 1)
      on conflict (resource_type, resource_id)
      do update set read_count = counters.read_count + 1;
    end if;

  elsif p_resource_type = 'year' then
    null; -- year reader_count: 1 per device ever, never re-increment

  elsif v_log.last_read_at < now() - interval '10 minutes' then
    -- Subject/module: outside 10-min window, count again
    update counter_log
    set last_read_at = now()
    where device_id     = p_device_id
      and resource_type = p_resource_type
      and resource_id   = p_resource_id;

    update counters
    set read_count = read_count + 1
    where resource_type = p_resource_type
      and resource_id   = p_resource_id;

  end if;
  -- else: within 10-min window → do nothing
end;
$$;

-- grant execute to anon and authenticated roles
grant execute on function record_visit(text, text, text) to anon, authenticated;
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Use the Supabase MCP tool `list_projects` to get your project ID, then call `apply_migration` with the SQL above (copy the full SQL from the file). Name the migration `counters_and_record_visit`.

- [ ] **Step 3: Verify tables and RPC exist**

Use Supabase MCP `execute_sql`:
```sql
select table_name from information_schema.tables
where table_schema = 'public'
  and table_name in ('counters', 'counter_log')
order by table_name;
```
Expected: two rows — `counter_log` and `counters`.

```sql
select routine_name from information_schema.routines
where routine_schema = 'public' and routine_name = 'record_visit';
```
Expected: one row.

- [ ] **Step 4: Update TypeScript types**

Open `lib/supabase/types.ts`. Add `counters` and `counter_log` to the `Tables` object, and replace `Functions: Record<string, never>` with the `record_visit` signature.

The updated file should look like this — add the two new table entries inside `Tables` and update `Functions`:

```ts
export type SectionKind = "content" | "activity";
export type UnlockStatus = "pending" | "approved" | "rejected";
export type EventType =
  | "enter"
  | "year_select"
  | "subject_open"
  | "module_open"
  | "section_view"
  | "unlock_click"
  | "unlock_submitted";

export interface Database {
  public: {
    Tables: {
      counters: {
        Row: {
          resource_type: string;
          resource_id: string;
          reader_count: number;
          read_count: number;
        };
        Insert: {
          resource_type: string;
          resource_id: string;
          reader_count?: number;
          read_count?: number;
        };
        Update: Partial<{ reader_count: number; read_count: number }>;
      };
      counter_log: {
        Row: {
          device_id: string;
          resource_type: string;
          resource_id: string;
          first_seen_at: string;
          last_read_at: string;
        };
        Insert: {
          device_id: string;
          resource_type: string;
          resource_id: string;
          first_seen_at?: string;
          last_read_at?: string;
        };
        Update: Partial<{ last_read_at: string }>;
      };
      years: {
        Row: { id: string; label: string; sort_order: number };
        Insert: { id?: string; label: string; sort_order: number };
        Update: Partial<{ label: string; sort_order: number }>;
      };
      subjects: {
        Row: { id: string; year_id: string; title: string; slug: string; sort_order: number };
        Insert: { id?: string; year_id: string; title: string; slug: string; sort_order: number };
        Update: Partial<{ year_id: string; title: string; slug: string; sort_order: number }>;
      };
      modules: {
        Row: { id: string; subject_id: string; title: string; slug: string; sort_order: number };
        Insert: { id?: string; subject_id: string; title: string; slug: string; sort_order: number };
        Update: Partial<{ subject_id: string; title: string; slug: string; sort_order: number }>;
      };
      sections: {
        Row: {
          id: string;
          module_id: string;
          kind: SectionKind;
          heading: string;
          body_md: string;
          sort_order: number;
          ide_language: "python" | "sql" | "java" | "c" | null;
          starter_code: string | null;
        };
        Insert: {
          id?: string;
          module_id: string;
          kind: SectionKind;
          heading: string;
          body_md: string;
          sort_order: number;
          ide_language?: "python" | "sql" | "java" | "c" | null;
          starter_code?: string | null;
        };
        Update: Partial<{
          module_id: string;
          kind: SectionKind;
          heading: string;
          body_md: string;
          sort_order: number;
          ide_language: "python" | "sql" | "java" | "c" | null;
          starter_code: string | null;
        }>;
      };
      unlocks: {
        Row: {
          id: string;
          module_id: string;
          device_id: string;
          gcash_ref: string;
          status: UnlockStatus;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          device_id: string;
          gcash_ref: string;
          status?: UnlockStatus;
          amount: number;
          created_at?: string;
        };
        Update: Partial<{ status: UnlockStatus }>;
      };
      events: {
        Row: {
          id: string;
          device_id: string;
          event_type: EventType;
          year_id: string | null;
          subject_id: string | null;
          module_id: string | null;
          section_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          event_type: EventType;
          year_id?: string | null;
          subject_id?: string | null;
          module_id?: string | null;
          section_id?: string | null;
          created_at?: string;
        };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: {
      record_visit: {
        Args: {
          p_device_id: string;
          p_resource_type: string;
          p_resource_id: string;
        };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
  };
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260615000000_counters.sql lib/supabase/types.ts
git commit -m "feat(counters): add counters tables, record_visit RPC, and TS types"
```

---

## Task 2: formatCount utility

**Files:**
- Create: `lib/counters.ts`
- Create: `lib/counters.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/counters.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { formatCount } from "./counters";

describe("formatCount", () => {
  it("returns the number as-is under 1000", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(1)).toBe("1");
    expect(formatCount(847)).toBe("847");
    expect(formatCount(999)).toBe("999");
  });

  it("formats thousands with k suffix, strips trailing zero", () => {
    expect(formatCount(1000)).toBe("1k");
    expect(formatCount(1200)).toBe("1.2k");
    expect(formatCount(1500)).toBe("1.5k");
    expect(formatCount(10000)).toBe("10k");
    expect(formatCount(100000)).toBe("100k");
  });

  it("formats millions with M suffix, strips trailing zero", () => {
    expect(formatCount(1000000)).toBe("1M");
    expect(formatCount(1500000)).toBe("1.5M");
    expect(formatCount(2300000)).toBe("2.3M");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run lib/counters.test.ts
```
Expected: FAIL — `Cannot find module './counters'`

- [ ] **Step 3: Implement formatCount**

Create `lib/counters.ts`:

```ts
export function formatCount(n: number): string {
  if (n >= 1_000_000) {
    return `${parseFloat((n / 1_000_000).toFixed(1))}M`;
  }
  if (n >= 1_000) {
    return `${parseFloat((n / 1_000).toFixed(1))}k`;
  }
  return String(n);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run lib/counters.test.ts
```
Expected: all 3 test cases PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/counters.ts lib/counters.test.ts
git commit -m "feat(counters): add formatCount utility with tests"
```

---

## Task 3: Wire record_visit into the events API route

**Files:**
- Modify: `app/api/events/route.ts`

- [ ] **Step 1: Add the record_visit call after the event insert**

Open `app/api/events/route.ts`. Replace the entire file content with the following (adds the `counterArgs` block after the `supabase.from("events").insert(...)` call, fire-and-forget so a counter failure never blocks the event response):

```ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { EventType } from "@/lib/supabase/types";

// Simple in-memory rate limiter: device_id -> last N timestamps
const rateLimitMap = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(key) ?? []).filter(
    (t) => now - t < WINDOW_MS
  );
  if (timestamps.length >= MAX_PER_WINDOW) return true;
  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      device_id,
      event_type,
      year_id = null,
      subject_id = null,
      module_id = null,
      section_id = null,
    } = body as {
      device_id: string;
      event_type: EventType;
      year_id?: string | null;
      subject_id?: string | null;
      module_id?: string | null;
      section_id?: string | null;
    };

    if (!device_id || !event_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (isRateLimited(device_id)) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }

    const supabase = createServerClient();

    await supabase.from("events").insert({
      device_id,
      event_type,
      year_id,
      subject_id,
      module_id,
      section_id,
    });

    // Determine which resource to count (fire-and-forget — never blocks response)
    const counterArgs = (() => {
      if (event_type === "subject_open" && year_id && !subject_id) {
        return { type: "year" as const, id: year_id };
      }
      if (event_type === "subject_open" && subject_id) {
        return { type: "subject" as const, id: subject_id };
      }
      if (event_type === "module_open" && module_id) {
        return { type: "module" as const, id: module_id };
      }
      return null;
    })();

    if (counterArgs) {
      supabase
        .rpc("record_visit", {
          p_device_id: device_id,
          p_resource_type: counterArgs.type,
          p_resource_id: counterArgs.id,
        })
        .then(null, () => null);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Manually verify the RPC fires**

Start the dev server:
```bash
npm run dev
```
Open `http://localhost:3000/year` and click into **1st Year**. Then use Supabase MCP `execute_sql`:
```sql
select * from counters;
```
Expected: one row with `resource_type = 'year'`, `reader_count = 1`, `read_count = 0`.

```sql
select * from counter_log;
```
Expected: one row for your device_id and the year resource.

- [ ] **Step 4: Commit**

```bash
git add app/api/events/route.ts
git commit -m "feat(counters): call record_visit RPC from events route"
```

---

## Task 4: Year page — reader count on each year card

**Files:**
- Modify: `app/year/page.tsx`

- [ ] **Step 1: Add the counter fetch and import**

Open `app/year/page.tsx`. Add the import at the top:

```ts
import { formatCount } from "@/lib/counters";
```

Replace the existing `Promise.all` block:

```ts
// Before:
const [{ data: years }, { data: subjects }] = await Promise.all([
  supabase.from("years").select("*").order("sort_order"),
  supabase.from("subjects").select("id, year_id, semester, kind"),
]);

// After:
const [{ data: years }, { data: subjects }, { data: yearCounters }] = await Promise.all([
  supabase.from("years").select("*").order("sort_order"),
  supabase.from("subjects").select("id, year_id, semester, kind"),
  supabase.from("counters").select("resource_id, reader_count").eq("resource_type", "year"),
]);
```

Add a lookup helper directly after the `subjectStats` function (before the `return`):

```ts
function readerCount(yearId: string): number {
  return yearCounters?.find((c) => c.resource_id === yearId)?.reader_count ?? 0;
}
```

- [ ] **Step 2: Add reader count row inside each year card**

Find the `<Link>` block for each year card. It currently ends with:

```tsx
<span className="font-sans text-sm text-ink-muted mt-auto group-hover:text-paper transition-colors duration-200">
  View subjects →
</span>
```

Add the reader count row immediately after that `<span>`:

```tsx
<div className="flex items-center gap-2 pt-3 border-t border-ink-faint/20 group-hover:border-taupe/20 transition-colors duration-200">
  <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
  <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint group-hover:text-taupe transition-colors duration-200">
    <span className="text-ink-muted group-hover:text-taupe/80 transition-colors duration-200">
      {formatCount(readerCount(year.id))}
    </span>{" "}
    readers
  </span>
</div>
```

- [ ] **Step 3: Check the page renders**

```bash
npm run dev
```
Open `http://localhost:3000/year`. Verify:
- Each year card has a thin divider with a red dot and `X readers` below it
- Hovering a card still works (dark bg, white text, the counter text shifts to taupe)
- No console errors

- [ ] **Step 4: Commit**

```bash
git add app/year/page.tsx
git commit -m "feat(counters): show reader count on year cards"
```

---

## Task 5: Subjects page — read count per subject row

**Files:**
- Modify: `app/year/[yearId]/subjects/page.tsx`

- [ ] **Step 1: Add import and fetch**

Open `app/year/[yearId]/subjects/page.tsx`. Add the import:

```ts
import { formatCount } from "@/lib/counters";
```

Replace the existing `Promise.all` block:

```ts
// Before:
const [{ data: year }, { data: rawSubjects }] = await Promise.all([
  supabase.from("years").select("*").eq("id", yearId).single(),
  supabase.from("subjects").select("*").eq("year_id", yearId).order("sort_order"),
]);

// After:
const [{ data: year }, { data: rawSubjects }, { data: subjectCounters }] = await Promise.all([
  supabase.from("years").select("*").eq("id", yearId).single(),
  supabase.from("subjects").select("*").eq("year_id", yearId).order("sort_order"),
  supabase.from("counters").select("resource_id, read_count").eq("resource_type", "subject"),
]);
```

Add a lookup helper after the `sem2` const (before the `return`):

```ts
function readCount(subjectId: string): number {
  return subjectCounters?.find((c) => c.resource_id === subjectId)?.read_count ?? 0;
}
```

- [ ] **Step 2: Add read count inline with the kind label**

Find the section inside the subject row that currently renders:

```tsx
<span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
  {subject.kind === "major" ? "Major" : "Minor"}
</span>
```

Replace it with:

```tsx
<div className="flex items-center gap-2">
  <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
    {subject.kind === "major" ? "Major" : "Minor"}
  </span>
  <span className="font-mono text-label-sm text-ink-faint/40">·</span>
  <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
    <span className="text-ink-muted">{formatCount(readCount(subject.id))}</span> reads
  </span>
</div>
```

- [ ] **Step 3: Check the page renders**

Open `http://localhost:3000/year/[any-year-id]/subjects`. Verify:
- Each subject row shows `Major · X reads` or `Minor · X reads`
- Numbers are `0` until someone visits that subject's modules page
- No console errors

- [ ] **Step 4: Commit**

```bash
git add "app/year/[yearId]/subjects/page.tsx"
git commit -m "feat(counters): show read counts on subject rows"
```

---

## Task 6: Modules page — read count per module row

**Files:**
- Modify: `app/year/[yearId]/subjects/[subjectId]/modules/page.tsx`

- [ ] **Step 1: Add import and fetch**

Open `app/year/[yearId]/subjects/[subjectId]/modules/page.tsx`. Add the import:

```ts
import { formatCount } from "@/lib/counters";
```

Replace the existing `Promise.all` block:

```ts
// Before:
const [{ data: subject }, { data: modules }] = await Promise.all([
  supabase.from("subjects").select("*, years(label, sort_order)").eq("id", subjectId).single(),
  supabase.from("modules").select("*").eq("subject_id", subjectId).order("sort_order"),
]);

// After:
const [{ data: subject }, { data: modules }, { data: moduleCounters }] = await Promise.all([
  supabase.from("subjects").select("*, years(label, sort_order)").eq("id", subjectId).single(),
  supabase.from("modules").select("*").eq("subject_id", subjectId).order("sort_order"),
  supabase.from("counters").select("resource_id, read_count").eq("resource_type", "module"),
]);
```

Add a lookup helper after the `year` const (before the `return`):

```ts
function readCount(moduleId: string): number {
  return moduleCounters?.find((c) => c.resource_id === moduleId)?.read_count ?? 0;
}
```

- [ ] **Step 2: Add read count below each module title**

Find the module row body which currently renders:

```tsx
<div className="flex-1">
  <h2 className="font-serif text-2xl text-ink group-hover:text-accent transition-colors duration-150">
    {mod.title}
  </h2>
</div>
```

Replace it with:

```tsx
<div className="flex-1">
  <h2 className="font-serif text-2xl text-ink group-hover:text-accent transition-colors duration-150">
    {mod.title}
  </h2>
  <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
    <span className="text-ink-muted">{formatCount(readCount(mod.id))}</span> reads
  </span>
</div>
```

- [ ] **Step 3: Check the page renders**

Open `http://localhost:3000/year/[yearId]/subjects/[subjectId]/modules`. Verify:
- Each module row shows `X reads` below the title
- Numbers are `0` until someone opens that specific module
- No console errors

- [ ] **Step 4: Commit**

```bash
git add "app/year/[yearId]/subjects/[subjectId]/modules/page.tsx"
git commit -m "feat(counters): show read counts on module rows"
```

---

## Task 7: Full test suite + end-to-end smoke test

- [ ] **Step 1: Run the full test suite**

```bash
npx vitest run
```
Expected: all tests pass including `lib/counters.test.ts`.

- [ ] **Step 2: Smoke test the full counter flow**

Start the dev server:
```bash
npm run dev
```

Walk through this sequence in the browser:

1. Open `http://localhost:3000/year` — note both year cards show `0 readers`
2. Click **1st Year** → lands on subjects page, subjects show `0 reads`
3. Go back to `http://localhost:3000/year` — **1st Year** card should now show `1 readers`
4. Click into any subject (e.g. Introduction to Computing) → modules page loads
5. Go back to subjects page — that subject should now show `1 reads`
6. Click into any module → module content page loads
7. Go back to modules page — that module should now show `1 reads`

- [ ] **Step 3: Verify dedup — revisit within 10 minutes**

Click the same subject immediately again. Go back to subjects list. Read count should still be `1 reads` — not `2 reads`.

- [ ] **Step 4: Verify year reader count dedup — revisit same year**

Click into 1st Year again. Go back to year page. Reader count for 1st Year should still be `1 readers` — not `2 readers`.

- [ ] **Step 5: Verify 2nd Year is tracked separately**

Click into 2nd Year. Go back to year page. 2nd Year should now show `1 readers`, 1st Year still shows its own count.

- [ ] **Step 6: Push to main**

```bash
git push https://lauurnce:$(gh auth token)@github.com/lauurnce/survivalKitApp.git main
```
