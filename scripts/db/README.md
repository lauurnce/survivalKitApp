# Database migration tooling

Plain-Postgres safety net for `supabase/migrations/`. No Supabase CLI needed.

## How CI validates migrations

`.github/workflows/db-migrations.yml` runs two jobs on `pull_request` and
`push` to `main` (triggered by changes under `supabase/migrations/**`,
`scripts/db/**`, or the workflow itself):

1. **apply-migrations** — boots a throwaway `postgres:16` service container,
   bootstraps the minimal Supabase-flavored objects vanilla Postgres lacks
   (roles `anon` / `authenticated` / `service_role`, schema `auth` with a stub
   `auth.users` plus `auth.uid()` / `auth.role()` shims, empty `storage`
   schema), then applies EVERY `supabase/migrations/*.sql` in lexical
   (`==` version) order via `psql -v ON_ERROR_STOP=1`. Any failure fails CI.
2. **validate-consolidated** — same bootstrap, replays only the production
   baseline (all migrations *minus* the pending six listed in
   `build-consolidated.sh`), then applies `consolidated-pending.sql` on top —
   exactly what pasting it into the Supabase SQL Editor will do. It also
   regenerates the artifact and fails if the committed copy has drifted from
   its sources.

## Regenerating consolidated-pending.sql

Edit the `pending` array in `scripts/db/build-consolidated.sh` when the set of
never-applied-to-production migrations changes, then run:

```sh
./scripts/db/build-consolidated.sh        # rewrites scripts/db/consolidated-pending.sql
```

Commit both the script and its output together with any new migration files.
CI's drift check enforces this. (`--list` prints just the pending file list.)

Every statement in a pending migration must be idempotent (re-runnable):
`create table/index if not exists`, `create or replace function`,
`drop policy if exists` before `create policy`; grants and revokes are
naturally repeatable. The SQL Editor may be re-pasted after a partial apply.

## Next free migration number

Migration filenames are `YYYYMMDDHHMMSS_description.sql` and are applied by
CI in lexical order, which must equal chronological order. The next free
number is **20260822000006** and up (`20260822000007`, …). Never reuse a
number, even if an earlier migration was reverted or deleted.
