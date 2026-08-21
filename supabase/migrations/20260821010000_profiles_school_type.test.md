# Verification: `profiles_school_type`

## Red state

Before this migration:

- `profiles` has no `school_type` column, so signup has nowhere to put the
  public/private answer. Inserting it fails with
  `column "school_type" of relation "profiles" does not exist`.
- `profiles.first_name` and `last_name` are `not null` (see
  `supabase/migrations/20260706000000_profiles.sql`). A signup-time row —
  school known, name not yet asked for — fails a NOT NULL violation.

## Live verification NOT run

This machine has no local Postgres, no `psql`, no Docker and no Supabase
CLI, so unlike `20260717000000_classes_subject_id_nullable.test.md` the
statements below have **not** been executed against a real instance. The
review below is structural only. Run section "Checks to run" against the
live database when applying.

## Structural review

1. `add column if not exists` — replay-safe; a second run is a no-op.
2. The `check (school_type in ('Public','Private'))` values match `SECTORS`
   in `lib/universities.ts` exactly, and match the strings `validateProfile`
   emits. A drift here would surface as a check-constraint violation on
   save, not as silently bad data.
3. The column is nullable by omission. Existing rows get NULL, which the
   dashboard reads as "Not specified". No backfill: we do not record a
   sector a student never gave us, even where the catalog could supply one.
4. `alter column ... drop not null` is idempotent in Postgres — dropping an
   already-dropped NOT NULL succeeds as a no-op.
5. The original `check (char_length(first_name) between 1 and 60)` is left
   in place. A CHECK evaluates to NULL (and therefore passes) when its
   input is NULL, so the constraint still rejects a present-but-blank name
   while allowing "not asked yet".
6. No RLS change needed. The existing three policies are keyed on
   `user_id = auth.uid()` and cover the new column automatically.

## Checks to run

```sql
-- 1. Column exists, is nullable, and is text.
select column_name, data_type, is_nullable
from information_schema.columns
where table_name = 'profiles'
  and column_name in ('school_type', 'first_name', 'last_name')
order by column_name;
-- expect: first_name text YES | last_name text YES | school_type text YES

-- 2. The check constraint accepts both sectors and rejects anything else.
insert into profiles (user_id, first_name, last_name, school_type)
values (gen_random_uuid(), 'Test', 'Row', 'Public');       -- expect: OK
insert into profiles (user_id, first_name, last_name, school_type)
values (gen_random_uuid(), 'Test', 'Row', 'public');       -- expect: 23514
insert into profiles (user_id, first_name, last_name, school_type)
values (gen_random_uuid(), 'Test', 'Row', 'State');        -- expect: 23514

-- 3. A signup-shaped row — school, no name — is now insertable.
insert into profiles (user_id, university, school_type)
values (gen_random_uuid(), 'Polytechnic University of the Philippines', 'Public');
-- expect: OK (would have been 23502 NOT NULL before this migration)

-- 4. A present-but-blank name is still rejected.
insert into profiles (user_id, first_name, last_name)
values (gen_random_uuid(), '', 'Cruz');                    -- expect: 23514

-- 5. Existing rows are untouched and read as unspecified.
select count(*) filter (where school_type is null) as unspecified,
       count(*)                                    as total
from profiles;
-- expect: unspecified = total, at the moment of applying

-- clean up
delete from profiles where last_name = 'Row' or first_name is null;
```

## Replay check

Run the whole migration file a second time. Expect no error and no change:
`add column if not exists` skips, both `drop not null` statements are
no-ops.
