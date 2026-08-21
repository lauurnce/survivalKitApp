# Verification: `admin_profiles_agg_school_type`

## Red state

`admin_profiles_agg()` returns neither `named` nor `by_school_type`. The
dashboard's Student Profiles band reads `total` and labels it "profiles
completed" — a label that stops being true the moment signup starts creating
rows, because a signup row has a school and no name.

## Live verification NOT run

No local Postgres, `psql`, Docker or Supabase CLI on this machine. The review
below is structural. Run "Checks to run" against the database when applying.

## Structural review

1. `create or replace` keeps the existing signature `() returns json`, so no
   dependent grant or call site changes. Replaying is a no-op.
2. `security definer` + `set search_path = public` are carried over verbatim
   from `20260706000001_admin_profiles_agg.sql`; dropping either would change
   the function's privilege behaviour.
3. The `revoke`/`grant` pair is repeated because `create or replace` resets
   default execute privileges to PUBLIC. Omitting it would quietly expose
   student-level data to `anon`.
4. `named` counts `first_name is not null` rather than `<> ''`: the migration
   leaves the `char_length(first_name) between 1 and 60` CHECK in place, so a
   present-but-empty name cannot exist to be counted.
5. `by_school_type` groups on `coalesce(school_type, 'Not specified')`, so
   pre-existing rows are reported as unspecified rather than dropped from the
   total. Grouping without the coalesce would silently shrink the sum below
   `total` — the reporting failure this codebase has already been bitten by.
6. `total` is unchanged and still counts every row, so `by_school_type` sums
   to `total` exactly.

## Checks to run

```sql
-- 1. The new keys are present and the old ones survive.
select jsonb_object_keys(admin_profiles_agg()::jsonb) order by 1;
-- expect: by_major, by_pathway, by_school_type, by_university, named, total

-- 2. by_school_type sums to total — nothing dropped by the grouping.
select (admin_profiles_agg()->>'total')::int as total,
       (select sum((e->>'count')::int)
        from jsonb_array_elements((admin_profiles_agg()->'by_school_type')::jsonb) e
       ) as summed;
-- expect: total = summed

-- 3. named never exceeds total.
select (admin_profiles_agg()->>'named')::int  <=
       (admin_profiles_agg()->>'total')::int as sane;
-- expect: t

-- 4. Rows predating the column report as unspecified, not as a guess.
select e->>'school_type' as school_type, e->>'count' as count
from jsonb_array_elements((admin_profiles_agg()->'by_school_type')::jsonb) e;
-- expect: a 'Not specified' bucket covering every pre-migration row

-- 5. anon and authenticated cannot execute it.
set role anon;      select admin_profiles_agg();  -- expect: 42501
reset role;
```
