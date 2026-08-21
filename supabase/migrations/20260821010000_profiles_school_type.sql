-- supabase/migrations/20260821010000_profiles_school_type.sql
-- Signup now asks every new student for their school and whether it is a
-- state/public institution or a private one. Two changes to `profiles`:
--
-- 1. A new `school_type` column. The sector is STORED, not derived from
--    lib/universities.ts, because only the student can answer it for a
--    school outside our 50-school catalog — and because what the student
--    told us is a different fact from what we looked up.
--
-- 2. `first_name` / `last_name` become nullable. A row now gets created at
--    signup, when we know the school but not yet the student's name. Empty
--    strings would satisfy the old constraint and lie: "hasn't told us yet"
--    would be indistinguishable from "told us it's empty". The existing
--    char_length checks stay and still reject a name that is present but
--    blank, because a CHECK passes on NULL.
--
-- Rows written before today keep school_type NULL, which reads as "not
-- specified" — we do not backfill a sector the student never gave us.
--
-- Idempotent: `add column if not exists` is a no-op on replay, and dropping
-- an already-dropped NOT NULL is a no-op in Postgres.

alter table profiles
  add column if not exists school_type text
    check (school_type in ('Public', 'Private'));

alter table profiles alter column first_name drop not null;
alter table profiles alter column last_name  drop not null;
