# Plan: make db-migrations CI green for the first time

- **Track**: parallel fan-out, executor A (opencode)
- **Worktree**: `~/projects/survivalKitApp-ci`, branch `fix/db-migrations-green` @ `4874a98`
- **Owns**: `supabase/migrations/**`, `scripts/db/**`, `.github/workflows/db-migrations.yml`
- **Date**: 2026-08-25

## Goal

`.github/workflows/db-migrations.yml` has never passed. Both jobs
(`apply-migrations`, `validate-consolidated`) replay the full migration
history into a fresh `postgres:16`; production was assembled by hand out of
order, so data dependencies that prod satisfies silently are broken in a cold
replay. Make both jobs green without changing what production already
contains.

## Verified facts (static analysis, pre-CI)

1. **The briefing's premise was wrong in one detail**: no migration seeds the
   COBOL subject. Grep across `supabase/migrations/**` shows UUID
   `85eaf374-8001-43e1-81ec-b67b8c66466e` appears ONLY in
   `006_fix_cobol_module_structure.sql` itself. Same for World Literature
   `045d09d8-c0fb-441e-ad8f-52d7b5fe7e35` — only in
   `007_fix_world_lit_module_structure.sql`. The late seed file
   `20260623000001_seed_missing_subjects_2nd_3rd_4th_year.sql` contains
   neither; it seeds ten subjects under synthetic UUIDs
   (`2/3/40000000-…`). So **renaming that seed file cannot fix anything**.
2. **Failure 1 — 006 FK violation**: `modules.subject_id → subjects(id)`
   (`001_initial_schema.sql:29`). 006 inserts 4 modules with
   `subject_id = '85eaf374…'`, which exists only as a hand-made prod row →
   `insert or update on table "modules" violates foreign key constraint`.
   Its `UPDATE modules WHERE id = 'ca0001b7…'` is also a silent no-op on a
   fresh DB (module never seeded) but does not error.
3. **Failure 2 — 007 FK violation**: same disease, subject
   `'045d09d8…'`, module `'39ce91b6…'`. Hidden behind failure 1.
4. **Failure 3 — year FK violation in the June 23 seed**: its first block
   inserts three subjects under
   `year_id = '00000000-0000-0000-0000-000000000002'` (2nd Year), but the
   ONLY migration seeding years is `20260618000003_seed_3rd_4th_year.sql`,
   which creates years `…0003` and `…0004` only. Years 1st/2nd are never
   seeded → FK violation on `subjects.year_id`.
5. Everything else replays cleanly on a fresh DB: all other migrations are
   DDL or idempotent no-op UPDATEs by PK (`topology_seed` matches nothing,
   fine); no other INSERTs into content tables; only extension used is
   `pgcrypto` (CI bootstraps it); no FKs into `auth.*`.

## Chosen fix

One new idempotent backfill seed, `005a_seed_missing_years_and_module_subjects.sql`:

- inserts years `…0001` (1st Year) and `…0002` (2nd Year),
  `on conflict (id) do nothing`;
- inserts subjects COBOL + World Literature with their **exact prod UUIDs**,
  attached to year `…0002`, `on conflict (id) do nothing`.

Name sorts `005_ < 005a_ < 006_ < 007_` under `LC_ALL=C sort` (verified with
the workflow's own sort expression), so it lands before both consumers and
before the June 18/23 seeds. An earlier draft named it `0055_…`, which sorts
BEFORE `005_` (`'5'` < `'_'`) — caught by running the sort before pushing and
renamed in place; semantics were never affected (005 only alters unlocks).

Why this shape:

- keeps `006`/`007` byte-identical — the workflow's stated contract is that
  migrations apply UNCHANGED with semantics identical to prod;
- fixes all three failures at once;
- zero production drift: every insert hits an existing row in prod
  (`on conflict do nothing`), satisfying the idempotency contract in
  `scripts/db/README.md`.

### Rejected alternative

Editing `006`/`007` to upsert their own subjects (the briefing's fallback):
rejected because (a) failure 3 still needs a new pre-006 seed for year …0002,
so a new migration is unavoidable anyway; (b) rewriting historical migrations
that prod already applied is riskier than adding one pure-additive backfill.
Renaming the June 23 seed file earlier was also rejected once fact 1 showed it
does not contain the needed subjects.

## Steps checklist

- [x] Verify worktree, branch, claims registry row
- [x] Static diagnosis of all 50 migration files (facts above)
- [x] Write this plan doc, commit immediately
- [ ] Add `0055_seed_missing_years_and_module_subjects.sql`, commit
- [ ] Push, watch CI iteration 1
- [ ] Fix next failure if any, iterate (cap ~8)
- [ ] Run `./scripts/db/build-consolidated.sh`, confirm zero drift
- [ ] Both jobs green → final report (no merge to main)

## CI iteration log

| # | commit | result | notes |
|---|--------|--------|-------|
| | | | |
