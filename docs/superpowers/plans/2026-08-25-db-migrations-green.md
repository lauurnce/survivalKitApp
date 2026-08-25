# Plan: make db-migrations CI green for the first time

**Status: COMPLETE — 2026-08-25.** Both jobs green on run
[32833112758](https://github.com/lauurnce/survivalKitApp/actions/runs/32833112758)
at HEAD `a82fa49`; PR #37 open, not merged. Zero drift confirmed via
`build-consolidated.sh` regeneration.

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
- [x] Add seed migration, commit — committed as `a9ddf35` as
      `005a_seed_missing_years_and_module_subjects.sql` (renamed from the
      planned `0055_` draft name in `b6f11fc`; see root cause 2)
- [x] Push, watch CI iteration 1
- [x] Fix next failure if any, iterate (cap ~8) — two further fixes needed:
      `19541b1`, `bd2ca98`, `a82fa49`
- [x] Run `./scripts/db/build-consolidated.sh`, confirm zero drift — exit 0,
      regenerated `consolidated-pending.sql` byte-identical to committed copy
      (clean `git status --porcelain`)
- [x] Both jobs green → final report (no merge to main) — run 32833112758

## CI iteration log

| # | commit | result | notes |
|---|--------|--------|-------|
| 1 | `19541b1` | FAIL ([32832729568](https://github.com/lauurnce/survivalKitApp/actions/runs/32832729568)) | Both jobs died at `20260623200000_fix_subscriptions_unique_constraint.sql:4`: `ERROR: relation "subscriptions_device_year_idx" already exists`. Bare `create unique index` collides with the same unconditional index created earlier by `20260623100000`. The new `005a` seed itself replayed clean past 006/007 and the June-23 seed — static diagnosis held. |
| 2 | `bd2ca98` | FAIL ([32832874448](https://github.com/lauurnce/survivalKitApp/actions/runs/32832874448)) | Index fix worked; next fatal surfaced one file later at `20260629000001_admin_waitlist_agg.sql:33`: `ERROR: column "year_label" does not exist`. The waitlist display columns existed only as hand-made prod rows; no migration had added them. |
| 3 | `a82fa49` | **SUCCESS** ([32833112758](https://github.com/lauurnce/survivalKitApp/actions/runs/32833112758)) | Both jobs green. First green `db-migrations` run ever. |

## Root causes found

1. **Missing subject/year seed data in replay history** (`a9ddf35`). No
   migration seeded years `…0001`/`…0002` or the COBOL / World Literature
   subjects; they existed only by hand on production. Cold replay died on FK
   violations in `006`, `007` and the June-23 seed. Fix: idempotent
   `005a_seed_missing_years_and_module_subjects.sql`.
2. **Lexical sort position of the seed** (`b6f11fc`). The draft filename
   `0055_…` sorts BEFORE `005_…` under the workflow's `LC_ALL=C sort`
   (`'5' < '_'`). Caught pre-push and renamed `005a_…`; semantics never
   affected (005 only alters unlocks) but the version-order contract now
   holds.
3. **Missing column backfills** (`19541b1`, `a82fa49`). `waitlist.subject_title`
   and `waitlist.year_label` were only ever hand-added to prod. Consumers
   ahead of them on replay — the per-subject unique index in
   `20260623000003`, then `admin_waitlist_agg` — hit `column does not exist`.
   Fix: `add column if not exists` for both in `20260623000003`, ahead of
   every consumer.
4. **Non-idempotent index swap** (`bd2ca98`). `20260623200000` did a bare
   `create unique index subscriptions_device_year_idx` while
   `20260623100000` already creates that same unconditional index →
   `already exists` on cold replay. Fix: `create unique index if not exists`,
   making the file a true no-op everywhere.
