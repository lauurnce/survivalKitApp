# Reader & Read Counters — Design Spec
**Date:** 2026-06-15  
**Status:** Approved

---

## Overview

Add public-facing reader and read counters across 3 levels of the app to build social proof and student trust. Counters are visible to all visitors. Two distinct counter types with different deduplication rules:

- **Reader count** — unique visitors, 1 per device ever, shown per year card on the year selection page
- **Read count** — study sessions, 1 per device per 10 minutes, shown per subject and per module

---

## Counter Behaviour by Level

| Level | Page | Counter type | Dedup rule | Trigger |
|---|---|---|---|---|
| Year | `/year` | Reader count | 1 per device ever, per year | User lands on that year's subjects page |
| Subject | `/year/[yearId]/subjects` | Read count | 1 per device per 10 min | User lands on subject's modules page |
| Module | `/year/[yearId]/subjects/[subjectId]/modules` | Read count | 1 per device per 10 min | User lands on any module page |

Year reader counts are **separate per year** — clicking into 1st Year increments only 1st Year's reader count; 2nd Year is tracked independently.

---

## Database Schema

### Table: `counters`
One row per tracked resource. Stores the running totals.

```sql
create table counters (
  resource_type text not null,   -- 'year' | 'subject' | 'module'
  resource_id   text not null,   -- the year/subject/module id
  reader_count  int  not null default 0,  -- unique devices ever (year level only)
  read_count    int  not null default 0,  -- 1 per device per 10 min (subject + module)
  primary key (resource_type, resource_id)
);
```

### Table: `counter_log`
One row per device per resource. Used for deduplication lookups.

```sql
create table counter_log (
  device_id     text        not null,
  resource_type text        not null,
  resource_id   text        not null,
  first_seen_at timestamptz not null default now(),  -- set once, never updated
  last_read_at  timestamptz not null default now(),  -- updated each read window
  primary key (device_id, resource_type, resource_id)
);
```

---

## Supabase RPC: `record_visit`

Single atomic function — handles both counter types based on `resource_type`.

```sql
create or replace function record_visit(
  p_device_id     text,
  p_resource_type text,
  p_resource_id   text
) returns void language plpgsql as $$
declare
  v_log counter_log%rowtype;
begin
  select * into v_log
  from counter_log
  where device_id = p_device_id
    and resource_type = p_resource_type
    and resource_id = p_resource_id;

  if not found then
    -- First visit: insert log row, increment the relevant counter
    insert into counter_log (device_id, resource_type, resource_id)
    values (p_device_id, p_resource_type, p_resource_id);

    if p_resource_type = 'year' then
      -- Year: only reader_count (unique visitors)
      insert into counters (resource_type, resource_id, reader_count, read_count)
      values (p_resource_type, p_resource_id, 1, 0)
      on conflict (resource_type, resource_id)
      do update set reader_count = counters.reader_count + 1;
    else
      -- Subject/module: only read_count
      insert into counters (resource_type, resource_id, reader_count, read_count)
      values (p_resource_type, p_resource_id, 0, 1)
      on conflict (resource_type, resource_id)
      do update set read_count = counters.read_count + 1;
    end if;

  elsif p_resource_type = 'year' then
    -- Year level: reader_count only — never increment again (1 per device ever)
    null;

  elsif v_log.last_read_at < now() - interval '10 minutes' then
    -- Subject/module: outside 10-min window → increment read_count
    update counter_log
    set last_read_at = now()
    where device_id = p_device_id
      and resource_type = p_resource_type
      and resource_id = p_resource_id;

    update counters
    set read_count = read_count + 1
    where resource_type = p_resource_type
      and resource_id = p_resource_id;

  end if;
  -- else: within 10-min window → do nothing
end;
$$;
```

---

## API Layer

Modify `/app/api/events/route.ts` — after inserting the event row, call `record_visit` for the appropriate resource:

| Event type | Condition | RPC call |
|---|---|---|
| `subject_open` | `year_id` present, no `subject_id` | `record_visit(device_id, 'year', year_id)` |
| `subject_open` | `subject_id` present | `record_visit(device_id, 'subject', subject_id)` |
| `module_open` | `module_id` present | `record_visit(device_id, 'module', module_id)` |

No new API routes needed. The existing `/api/events` endpoint already receives `device_id`, `event_type`, and the relevant IDs.

---

## UI

### Year page (`/year`)

Counts fetched server-side alongside existing `years` + `subjects` queries:

```ts
supabase
  .from("counters")
  .select("resource_id, reader_count")
  .eq("resource_type", "year")
```

**Placement:** Inside each year card, below a thin divider, above nothing else:
```
┌─────────────────────────┐
│ § 01                    │
│ 1st Year                │
│ 8 major · 4 minor       │
│ View subjects →         │
│ ─────────────────────── │
│ ● 1,483 readers         │
└─────────────────────────┘
```

Red dot + `{n} readers` in `font-mono text-label-sm` faint text. Dot is `bg-accent` (red).

### Subjects page (`/year/[yearId]/subjects`)

Counts fetched alongside subjects query:

```ts
supabase
  .from("counters")
  .select("resource_id, read_count")
  .eq("resource_type", "subject")
  .in("resource_id", subjectIds)
```

**Placement:** Inline next to the kind label with a `·` separator:
```
Introduction to Computing
Major · 1,204 reads
```

### Modules page (`/year/[yearId]/subjects/[subjectId]/modules`)

Counts fetched alongside modules query:

```ts
supabase
  .from("counters")
  .select("resource_id, read_count")
  .eq("resource_type", "module")
  .in("resource_id", moduleIds)
```

**Placement:** Below the module title on its own line:
```
History and Evolution of Computers
612 reads
```

### Number formatting

| Value | Display |
|---|---|
| 0–999 | `847` |
| 1,000–999,999 | `1.2k` |
| 1,000,000+ | `1.2M` |

All counter text uses `font-mono text-label-sm uppercase tracking-[0.12em]` in `text-ink-faint`. The count value itself is `text-ink-muted` (slightly darker) to give it visual weight.

---

## Display update strategy

Counts are server-rendered at page load time (`force-dynamic` already set on all pages). No Supabase Realtime subscriptions needed — each page load fetches fresh counts from the `counters` table. The increment from the current visitor's session is visible on their next page load or to the next visitor.

---

## Out of scope

- Admin dashboard analytics view (separate feature)
- Real-time counter animation as other users visit
- Section-level counters (already tracked in `events` table separately)
- Resetting or moderating counts
