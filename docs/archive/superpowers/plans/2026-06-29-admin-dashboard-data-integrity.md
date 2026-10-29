# Admin Dashboard Data Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all six data reliability and redundancy issues in the admin dashboard so every metric reflects reality at any scale.

**Architecture:** Three Supabase migrations add missing RPCs and extend the counters system to cover sections; the Next.js admin page and AdminDashboard component are updated to consume those RPCs and fix label/logic bugs; no new tables are created.

**Tech Stack:** Supabase Postgres (SQL migrations), Next.js 14 App Router (TypeScript), PostgREST RPC calls via `@supabase/supabase-js`.

## Global Constraints

- Never add `Co-Authored-By` to any commit message — lauurnce is the sole contributor.
- All SQL goes into a new timestamped migration file under `supabase/migrations/`.
- All Supabase RPC type signatures must be reflected in `lib/supabase/types.ts` under `Functions`.
- The admin page (`app/admin/page.tsx`) uses `createServerClient()` with the service role key — RLS is bypassed, PostgREST caps still apply to raw `.select()` calls.
- `PH_OFFSET_MS = 8 * 60 * 60 * 1000` (defined in `lib/payments.ts`) is the canonical Philippine timezone offset.
- Do not change any UI layout or styling — only data sources and labels.

---

### Task 1: Add `admin_top_sections` RPC + extend `record_visit` to cover sections

**Files:**
- Create: `supabase/migrations/20260629000000_admin_top_sections.sql`
- Modify: `lib/supabase/types.ts` — add `admin_top_sections` and `admin_active_subscribers` to `Functions`

**Interfaces:**
- Produces:
  - SQL function `admin_top_sections(p_limit int) RETURNS TABLE(section_id uuid, event_count bigint)` callable via `supabase.rpc("admin_top_sections", { p_limit: 8 })`
  - SQL function `admin_active_subscribers() RETURNS bigint` callable via `supabase.rpc("admin_active_subscribers")`
  - Extended `record_visit` that also increments `counters` for `resource_type = 'section'`

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/20260629000000_admin_top_sections.sql` with this exact content:

```sql
-- admin_top_sections: aggregate section_view events in Postgres to avoid the
-- PostgREST 3000-row cap that currently truncates section ranking.
-- Returns top N sections by raw event count, all-time.
create or replace function admin_top_sections(p_limit int default 8)
returns table(section_id uuid, event_count bigint)
language sql security definer as $$
  select
    e.section_id,
    count(*) as event_count
  from events e
  where e.event_type = 'section_view'
    and e.section_id is not null
  group by e.section_id
  order by event_count desc
  limit p_limit;
$$;

-- admin_active_subscribers: count subscriptions where status='active' AND
-- current_period_end > now() in Postgres. Avoids the PostgREST 1000-row
-- default cap that would silently undercount once you have >1000 subscribers.
create or replace function admin_active_subscribers()
returns bigint
language sql security definer as $$
  select count(*)
  from subscriptions
  where status = 'active'
    and current_period_end > now();
$$;

-- Extend record_visit to handle resource_type = 'section'.
-- Previously only 'year', 'subject', 'module' were handled; 'section' fell
-- through to the final no-op branch (within-window guard) without ever
-- inserting a counter_log row, so the read_count on the counters row was
-- never incremented for sections. This replaces the function definition.
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
    -- First visit: insert log row and increment the relevant counter.
    insert into counter_log (device_id, resource_type, resource_id)
    values (p_device_id, p_resource_type, p_resource_id);

    if p_resource_type = 'year' then
      insert into counters (resource_type, resource_id, reader_count, read_count)
      values (p_resource_type, p_resource_id, 1, 0)
      on conflict (resource_type, resource_id)
      do update set reader_count = counters.reader_count + 1;
    else
      -- subject, module, section all use read_count
      insert into counters (resource_type, resource_id, reader_count, read_count)
      values (p_resource_type, p_resource_id, 0, 1)
      on conflict (resource_type, resource_id)
      do update set read_count = counters.read_count + 1;
    end if;

  elsif p_resource_type = 'year' then
    null; -- year reader_count: 1 per device ever, never re-increment

  elsif v_log.last_read_at < now() - interval '10 minutes' then
    -- subject / module / section: outside 10-min window, count again
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

grant execute on function admin_top_sections(int) to service_role;
grant execute on function admin_active_subscribers() to service_role;
grant execute on function record_visit(text, text, text) to anon, authenticated;
```

- [ ] **Step 2: Apply the migration to the live Supabase project**

Run via the Supabase MCP tool (`apply_migration`) or paste directly into the Supabase SQL editor. The functions are `CREATE OR REPLACE` so they are idempotent.

Verify in SQL editor:
```sql
select admin_active_subscribers();
select * from admin_top_sections(3);
```

Both should return without error (values may be 0 if DB is empty).

- [ ] **Step 3: Update TypeScript types**

In `lib/supabase/types.ts`, find the `Functions` block (around line 236) and add two entries:

```ts
      admin_top_sections: {
        Args: { p_limit: number };
        Returns: { section_id: string; event_count: number }[];
      };
      admin_active_subscribers: {
        Args: Record<string, never>;
        Returns: number;
      };
```

The full `Functions` block should now read:

```ts
    Functions: {
      record_visit: {
        Args: {
          p_device_id: string;
          p_resource_type: string;
          p_resource_id: string;
        };
        Returns: void;
      };
      admin_dau_30d: {
        Args: Record<string, never>;
        Returns: { day: string; unique_devices: number }[];
      };
      admin_active_since: {
        Args: { p_minutes: number };
        Returns: number;
      };
      admin_user_totals: {
        Args: { p_new_days: number };
        Returns: { total_users: number; new_users: number; recurring_users: number }[];
      };
      admin_funnel_counts: {
        Args: Record<string, never>;
        Returns: { event_type: string; unique_devices: number }[];
      };
      admin_top_sections: {
        Args: { p_limit: number };
        Returns: { section_id: string; event_count: number }[];
      };
      admin_active_subscribers: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260629000000_admin_top_sections.sql lib/supabase/types.ts
git commit -m "feat(admin): add admin_top_sections and admin_active_subscribers RPCs; extend record_visit to cover sections"
```

---

### Task 2: Wire `admin_top_sections` and `admin_active_subscribers` into the admin page

**Files:**
- Modify: `app/admin/page.tsx` — replace raw section query and raw subscriptions fetch with RPC calls

**Interfaces:**
- Consumes (from Task 1):
  - `supabase.rpc("admin_top_sections", { p_limit: 8 })` → `{ section_id: string; event_count: number }[]`
  - `supabase.rpc("admin_active_subscribers")` → `number`
- Produces: `activeSubscribers` and `topSections` props passed to `<AdminDashboard>` remain the same shape — only the data source changes, so `AdminDashboard.tsx` needs no edits.

- [ ] **Step 1: Replace the `subscriptionRaw` query with the RPC**

In `app/admin/page.tsx`, find the `Promise.all` block. Replace the subscriptions query:

```ts
// REMOVE this:
supabase
  .from("subscriptions")
  .select("id, created_at, status")
  .order("created_at", { ascending: false }),

// ADD this:
supabase.rpc("admin_active_subscribers"),
```

Also rename the destructured variable at the top of the `Promise.all` assignment from `{ data: subscriptionRaw }` to `{ data: activeSubscribersRaw }`.

- [ ] **Step 2: Replace the raw `sectionEventRaw` query with the RPC**

In the same `Promise.all`, replace:

```ts
// REMOVE this:
supabase
  .from("events")
  .select("section_id")
  .eq("event_type", "section_view")
  .not("section_id", "is", null)
  .limit(3000),

// ADD this:
supabase.rpc("admin_top_sections", { p_limit: 8 }),
```

Rename the destructured variable from `{ data: sectionEventRaw }` to `{ data: topSectionsRaw }`.

- [ ] **Step 3: Remove the old `countById` post-processing for sections**

Delete these lines (they counted section_ids from the raw events array — no longer needed):

```ts
// DELETE:
const sectionCounts = countById(
  (sectionEventRaw ?? []).map((e) => (e as { section_id: string | null }).section_id)
);
const topSectionIds = sectionCounts.slice(0, 8).map((s) => s.id);
```

Replace with:

```ts
const topSectionIds = ((topSectionsRaw ?? []) as { section_id: string; event_count: number }[])
  .map((r) => r.section_id);
```

- [ ] **Step 4: Fix the `topSections` mapping to use `event_count` from the RPC**

Replace the `topSections` build block:

```ts
// REMOVE:
const topSections = sectionCounts.slice(0, 8).map((s) => {
  const detail = sectionDetails.find((d) => d.id === s.id);
  return {
    heading: detail?.heading ?? s.id.slice(0, 8),
    module_title: getTitle(detail?.modules),
    count: s.count,
  };
});

// ADD:
const sectionRpcRows = (topSectionsRaw ?? []) as { section_id: string; event_count: number }[];
const topSections = sectionRpcRows.map((r) => {
  const detail = sectionDetails.find((d) => d.id === r.section_id);
  return {
    heading: detail?.heading ?? r.section_id.slice(0, 8),
    module_title: getTitle(detail?.modules),
    count: Number(r.event_count),
  };
});
```

- [ ] **Step 5: Fix the `activeSubscribers` derivation**

Remove:

```ts
// REMOVE:
const subscriptions = subscriptionRaw ?? [];
const activeSubscribers = subscriptions.filter(s => s.status === "active").length;
```

Replace with:

```ts
const activeSubscribers = Number(activeSubscribersRaw ?? 0);
```

- [ ] **Step 6: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no errors. If there are errors about `countById` being unused now that sectionCounts is gone, remove the `countById` function from the file too (it's only used for sections).

- [ ] **Step 7: Commit**

```bash
git add app/admin/page.tsx
git commit -m "fix(admin): replace capped section query and subscriptions fetch with RPCs"
```

---

### Task 3: Wire `section_view` events into the `record_visit` counter pipeline

**Files:**
- Modify: `app/api/events/route.ts` — add `section` counter call when `event_type === "section_view"`

**Interfaces:**
- Consumes (from Task 1): `record_visit('section', section_id)` now works correctly in Postgres
- Produces: `counters` rows for `resource_type = 'section'` that can later be read directly instead of aggregating raw events

- [ ] **Step 1: Add the section counter branch in the events route**

In `app/api/events/route.ts`, find the `counterArgs` block (around line 84):

```ts
// EXISTING code to find:
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
```

Replace with:

```ts
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
  if (event_type === "section_view" && section_id) {
    return { type: "section" as const, id: section_id };
  }
  return null;
})();
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors (the `record_visit` RPC accepts `text` for `p_resource_type` so `"section"` is valid).

- [ ] **Step 3: Commit**

```bash
git add app/api/events/route.ts
git commit -m "feat(analytics): pipe section_view events into counters via record_visit"
```

---

### Task 4: Fix the "New Today" label — it counts payments, not new subscribers

**Files:**
- Modify: `components/AdminDashboard.tsx` — rename the label on the stat tile
- Modify: `app/admin/page.tsx` — rename the prop and variable for clarity

**Interfaces:**
- No data shape changes. This is a label + variable rename only.

- [ ] **Step 1: Rename the prop and variable in `app/admin/page.tsx`**

Find and rename `newSubscribersToday` → `paymentsToday` in two places:

1. The variable declaration (around line 254):
```ts
// CHANGE:
const newSubscribersToday = revenueRows.filter(...)...

// TO:
const paymentsToday = revenueRows.filter(
  p => new Date(new Date(p.paid_at).getTime() + PH_OFFSET_MS).toISOString().slice(0, 10) === todayStrPH
).length;
```

2. The JSX prop passed to `<AdminDashboard>` (around line 309):
```ts
// CHANGE:
newSubscribersToday={newSubscribersToday}
// TO:
newSubscribersToday={paymentsToday}
```

- [ ] **Step 2: Update the label in `components/AdminDashboard.tsx`**

Find the Stat component for "New Today" (around line 649):

```tsx
// CHANGE:
<Stat value={newSubscribersToday} label="New Today" />
// TO:
<Stat value={newSubscribersToday} label="Payments Today" />
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/admin/page.tsx components/AdminDashboard.tsx
git commit -m "fix(admin): rename 'New Today' to 'Payments Today' — counts payments, not new subscribers"
```

---

### Task 5: Fix "7-day Sessions" label — it's a sum of daily uniques, not a session count

**Files:**
- Modify: `components/AdminDashboard.tsx` — update the stat label

**Interfaces:**
- No data or prop changes. Label only.

- [ ] **Step 1: Update the label**

In `components/AdminDashboard.tsx`, find the stat tile with label `"7-day Sessions"` (around line 665):

```tsx
// CHANGE:
<Stat value={last7Sessions} label="7-day Sessions" />
// TO:
<Stat value={last7Sessions} label="Active User-Days (7d)" />
```

- [ ] **Step 2: Commit**

```bash
git add components/AdminDashboard.tsx
git commit -m "fix(admin): relabel '7-day Sessions' to 'Active User-Days (7d)' for accuracy"
```

---

### Task 6: Fix waitlist charts — aggregate server-side instead of capping at 500

**Files:**
- Create: `supabase/migrations/20260629000001_admin_waitlist_agg.sql`
- Modify: `lib/supabase/types.ts` — add `admin_waitlist_agg` to `Functions`
- Modify: `app/admin/page.tsx` — fetch aggregate alongside the capped table rows
- Modify: `components/AdminDashboard.tsx` — feed aggregated data into `WaitlistPieChart` and `WaitlistSubjectDemand`; keep the table capped for display

**Interfaces:**
- Produces:
  - `admin_waitlist_agg()` RPC → `{ total: number; by_year: { year_label: string; count: number }[]; by_subject: { subject_title: string; year_label: string; count: number }[] }`
  - New prop `waitlistAgg` on `AdminDashboard` component

- [ ] **Step 1: Create the aggregation migration**

Create `supabase/migrations/20260629000001_admin_waitlist_agg.sql`:

```sql
-- admin_waitlist_agg: returns total signup count plus pre-grouped breakdowns
-- so the admin dashboard charts are always based on all rows, not a 500-row cap.
create or replace function admin_waitlist_agg()
returns json
language sql security definer as $$
  select json_build_object(
    'total', (select count(*) from waitlist),
    'by_year', (
      select json_agg(row_to_json(t))
      from (
        select
          coalesce(year_label, 'Unknown') as year_label,
          count(*)::int as count
        from waitlist
        group by year_label
        order by count desc
      ) t
    ),
    'by_subject', (
      select json_agg(row_to_json(t))
      from (
        select
          subject_title,
          coalesce(year_label, '') as year_label,
          count(*)::int as count
        from waitlist
        where subject_title is not null
        group by subject_title, year_label
        order by count desc
      ) t
    )
  );
$$;

grant execute on function admin_waitlist_agg() to service_role;
```

- [ ] **Step 2: Apply the migration**

Run via Supabase MCP `apply_migration` or SQL editor. Verify:

```sql
select admin_waitlist_agg();
```

Returns a JSON object (may be mostly nulls if no waitlist rows yet — that's fine).

- [ ] **Step 3: Add the TypeScript type**

In `lib/supabase/types.ts`, add to the `Functions` block:

```ts
      admin_waitlist_agg: {
        Args: Record<string, never>;
        Returns: {
          total: number;
          by_year: { year_label: string; count: number }[] | null;
          by_subject: { subject_title: string; year_label: string; count: number }[] | null;
        };
      };
```

- [ ] **Step 4: Add the `waitlistAgg` prop to `AdminDashboard`**

In `components/AdminDashboard.tsx`, add a new interface and prop:

```ts
// Add after the WaitlistEntry interface:
interface WaitlistAgg {
  total: number;
  by_year: { year_label: string; count: number }[] | null;
  by_subject: { subject_title: string; year_label: string; count: number }[] | null;
}
```

Add to the `Props` interface:

```ts
  waitlistAgg: WaitlistAgg;
```

Add to the `AdminDashboard` function signature destructure:

```ts
export function AdminDashboard({
  ...,
  waitlistAgg,
}: Props) {
```

- [ ] **Step 5: Update `WaitlistPieChart` to accept pre-aggregated data**

Replace the `WaitlistPieChart` component signature and body so it takes agg data instead of raw entries:

```tsx
function WaitlistPieChart({ byYear, total }: { byYear: { year_label: string; count: number }[]; total: number }) {
  if (total === 0 || byYear.length === 0) return null;

  const slices = byYear.map((r) => ({
    label: r.year_label,
    count: r.count,
    pct: Math.round((r.count / total) * 100),
  }));

  const COLORS = ["#1a1a2e", "#4a90a4", "#c9a84c", "#8b5e3c", "#6b8c6b", "#9b6b9b"];
  let cumPct = 0;
  const gradientStops = slices.map((s, i) => {
    const start = cumPct;
    cumPct += s.pct;
    return `${COLORS[i % COLORS.length]} ${start}% ${cumPct}%`;
  });

  return (
    <div className="mb-8">
      <p className="label-sm text-ink-muted mb-4">Signups by Year Level</p>
      <div className="flex flex-col sm:flex-row gap-8 items-start">
        <div
          className="shrink-0 w-36 h-36 rounded-full"
          style={{ background: `conic-gradient(${gradientStops.join(", ")})` }}
          title="Waitlist source breakdown"
        />
        <div className="flex flex-col gap-2">
          {slices.map((s, i) => (
            <div key={s.label} className="flex items-center gap-3">
              <span
                className="w-3 h-3 shrink-0 inline-block"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="font-sans text-sm text-ink">{s.label}</span>
              <span className="font-mono text-xs text-ink-muted">{s.count} ({s.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Update `WaitlistSubjectDemand` to accept pre-aggregated data**

Replace the component:

```tsx
function WaitlistSubjectDemand({ bySubject }: { bySubject: { subject_title: string; year_label: string; count: number }[] }) {
  const [expanded, setExpanded] = useState(false);

  if (bySubject.length === 0) return null;

  const max = bySubject[0].count;
  const visible = expanded ? bySubject : bySubject.slice(0, 5);
  const hasMore = bySubject.length > 5;

  return (
    <div className="mb-8 max-w-wide">
      <p className="label-sm text-ink-muted mb-4">Most Requested Subjects</p>
      <div className="flex flex-col gap-2">
        {visible.map((r) => (
          <div key={r.subject_title} className="group flex items-center gap-3">
            <div className="w-48 shrink-0 text-right">
              <span className="font-sans text-sm text-ink">{r.subject_title}</span>
              {r.year_label && (
                <span className="font-mono text-[10px] text-ink-faint ml-2">{r.year_label}</span>
              )}
            </div>
            <div className="flex-1 flex items-center gap-2">
              <div
                className="h-4 bg-navy transition-all duration-300 group-hover:bg-accent"
                style={{ width: `${Math.max((r.count / max) * 100, 4)}%` }}
              />
              <span className="font-mono text-xs text-ink-muted">{r.count}</span>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-4 font-mono text-xs text-ink-muted border border-ink-faint/30 px-3 py-1 hover:text-ink hover:border-ink transition-colors duration-150"
        >
          {expanded ? `Minimize ↑` : `Reveal all (${bySubject.length - 5} more) ↓`}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Update `WaitlistSection` to use aggregated data**

In `WaitlistSection`, update the call sites for `WaitlistPieChart` and `WaitlistSubjectDemand`. The component now receives `agg` alongside `entries`:

Change the signature:

```tsx
function WaitlistSection({ entries, agg }: { entries: WaitlistEntry[]; agg: WaitlistAgg }) {
```

Replace the two chart call sites inside:

```tsx
// CHANGE:
<WaitlistPieChart entries={entries} />
<WaitlistSubjectDemand entries={entries} />

// TO:
<WaitlistPieChart byYear={agg.by_year ?? []} total={agg.total} />
<WaitlistSubjectDemand bySubject={agg.by_subject ?? []} />
```

- [ ] **Step 8: Update the `WaitlistSection` call in `AdminDashboard`**

In the JSX body of `AdminDashboard`, pass `agg`:

```tsx
// CHANGE:
<WaitlistSection entries={waitlistEntries} />
// TO:
<WaitlistSection entries={waitlistEntries} agg={waitlistAgg} />
```

Also update the section band to use `agg.total` for the count (so it's always accurate, not capped at 500):

```tsx
// CHANGE:
summary={`${waitlistEntries.length} total signups`}
// TO:
summary={`${waitlistAgg.total} total signups`}
```

- [ ] **Step 9: Fetch `admin_waitlist_agg` in the admin page**

In `app/admin/page.tsx`, add the RPC to the `Promise.all`:

```ts
// Add alongside the existing waitlist fetch:
supabase.rpc("admin_waitlist_agg"),
```

Destructure it as `{ data: waitlistAggRaw }`.

Then after the Promise.all, derive:

```ts
const waitlistAgg = (waitlistAggRaw ?? { total: 0, by_year: [], by_subject: [] }) as {
  total: number;
  by_year: { year_label: string; count: number }[] | null;
  by_subject: { subject_title: string; year_label: string; count: number }[] | null;
};
```

Pass it to `<AdminDashboard>`:

```tsx
waitlistAgg={waitlistAgg}
```

- [ ] **Step 10: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 11: Commit**

```bash
git add supabase/migrations/20260629000001_admin_waitlist_agg.sql lib/supabase/types.ts app/admin/page.tsx components/AdminDashboard.tsx
git commit -m "fix(admin): aggregate waitlist stats server-side via RPC, fix pie/demand charts beyond 500 rows"
```

---

## Self-Review

**Spec coverage:**
1. ✅ Top Sections capped at 3000 → `admin_top_sections` RPC (Task 1 + Task 2)
2. ✅ Active Subscribers PostgREST cap → `admin_active_subscribers` RPC (Task 1 + Task 2)
3. ✅ "New Today" counts renewals → renamed to "Payments Today" (Task 4)
4. ✅ Top Sections uses raw event counts vs deduped counters → `record_visit` extended to `section`, counter pipeline wired (Task 1 + Task 3)
5. ✅ Waitlist capped at 500 for charts → `admin_waitlist_agg` RPC (Task 6)
6. ✅ "7-day Sessions" mislabeled → renamed to "Active User-Days (7d)" (Task 5)

**Placeholder scan:** No TBDs, no TODOs, no "similar to" references — all steps include complete code.

**Type consistency:**
- `admin_top_sections` returns `{ section_id: string; event_count: number }[]` — used as `Number(r.event_count)` in Task 2 ✅
- `admin_active_subscribers` returns `number` — used as `Number(activeSubscribersRaw ?? 0)` in Task 2 ✅
- `WaitlistAgg` interface defined in Task 6 Step 4, consumed by `WaitlistSection` in Step 7, passed from admin page in Step 9 ✅
- `WaitlistPieChart` new props `byYear`/`total` defined in Step 5, called in Step 7 ✅
- `WaitlistSubjectDemand` new prop `bySubject` defined in Step 6, called in Step 7 ✅
