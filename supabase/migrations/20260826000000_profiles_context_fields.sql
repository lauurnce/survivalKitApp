-- supabase/migrations/20260826000000_profiles_context_fields.sql
-- The profile dashboard now asks who the student really is: what they can
-- study on, which languages they already speak, where they are starting
-- from, why they chose IT, where they want to end up, and where their work
-- lives. Seven new columns on `profiles`:
--
--   devices        text[]  what they own to study on (whitelist)
--   languages      text[]  programming languages they know (whitelist)
--   background     text    the strand/track they came from (whitelist)
--   it_reason      text    free text, capped at 280 characters
--   career_goal    text    free text, capped at 120 characters
--   github_url     text    https:// link, capped at 200 characters
--   portfolio_url  text    https:// link, capped at 200 characters
--
-- Every column is optional. Rows written before today keep NULL / '{}' and
-- that reads as "not answered" — we do not backfill answers the student
-- never gave us.
--
-- created_at already exists on this table since
-- 20260706000000_profiles.sql; nothing to add — the code layer only just
-- started reading it back.
--
-- The whitelist values must stay byte-for-byte in sync with lib/profile.ts
-- (DEVICES / LANGUAGES / BACKGROUNDS): a value one side accepts and the
-- other rejects would either fail an insert the validator passed, or store
-- something the validator refuses to read.
--
-- Idempotent: `add column if not exists` is a no-op on replay.

alter table profiles
  add column if not exists devices text[] not null default '{}' check (
    devices <@ array[
      'Laptop',
      'Desktop PC',
      'Tablet',
      'Smartphone',
      'None yet'
    ]::text[]
  ),
  add column if not exists languages text[] not null default '{}' check (
    languages <@ array[
      'Python',
      'JavaScript',
      'TypeScript',
      'Java',
      'C',
      'C++',
      'C#',
      'PHP',
      'SQL',
      'HTML/CSS',
      'Kotlin',
      'Swift',
      'Go',
      'Rust',
      'Dart',
      'None yet'
    ]::text[]
  ),
  add column if not exists background text check (background in (
    'TVL / ICT strand',
    'STEM strand',
    'Other SHS strand',
    'ALS completer',
    'Career shifter',
    'Zero knowledge'
  )),
  add column if not exists it_reason text check (char_length(it_reason) <= 280),
  add column if not exists career_goal text check (char_length(career_goal) <= 120),
  add column if not exists github_url text check (char_length(github_url) <= 200),
  add column if not exists portfolio_url text check (char_length(portfolio_url) <= 200);
