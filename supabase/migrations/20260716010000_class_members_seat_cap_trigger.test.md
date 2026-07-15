# Verification: `class_members_seat_cap_trigger`

## Red state confirmed

Before this migration, `class_members` had no trigger; a `count(*)` check in
`app/api/class/join/route.ts` followed by an `upsert` is a classic
check-then-act race — two concurrent requests can both read a count below
`seat_cap` and both insert, overshooting the cap. No DB constraint prevented
this (only `unique(class_id, device_id)` exists, which stops the same device
double-joining, not capacity overshoot).

## Verified live against a real local Postgres instance

Same approach as Task 1
(`supabase/migrations/20260716000000_classes.test.md`): a throwaway Homebrew
Postgres 16 cluster (`initdb` + `pg_ctl`, socket under `/tmp`), Supabase-only
primitives stubbed (`anon`/`authenticated`/`service_role` roles, `auth`
schema/`auth.users`/`auth.uid()`), all migrations replayed in filename order
with `psql -v ON_ERROR_STOP=1`. Same pre-existing, unrelated migration
failures noted in Task 1's report occurred here too (seed/admin-agg
migrations that assume live-only data); this migration and the one before it
(`20260716000000_classes.sql`) both applied cleanly.

Checks performed against the live database:

1. **Trigger exists and is attached correctly**:
   `select tgname from pg_trigger where tgrelid = 'class_members'::regclass;`
   → `class_members_seat_cap_trigger` present, `BEFORE INSERT ... FOR EACH ROW`.
2. **Basic cap enforcement**: inserted a `classes` row with `seat_cap = 2`,
   inserted two `class_members` rows for it (succeeded), then a third insert
   → rejected with:
   ```
   ERROR:  P0001: class <id> is at seat_cap (2)
   HINT:  class_seat_cap_exceeded
   ```
   Confirmed the exact SQLSTATE is `P0001` (the code
   `app/api/class/join/route.ts` matches on via `joinError.code`).
3. **Real concurrency race test** (the actual bug being fixed): set
   `seat_cap = 1`, cleared existing members, then ran two separate `psql`
   sessions concurrently in true parallel processes:
   - Transaction A: `BEGIN; INSERT ...; SELECT pg_sleep(3); COMMIT;`
   - Transaction B (started ~0.5s later, while A was still open):
     `BEGIN; INSERT ...; COMMIT;`

   Observed: Transaction B's `INSERT` blocked (did not return) until
   Transaction A committed — proving the trigger's `SELECT ... FOR UPDATE`
   on the parent `classes` row serializes concurrent inserts for the same
   class. Once A committed, B's insert resumed, re-read the now-updated
   count, and was correctly rejected with the same `P0001` error. Final
   `class_members` row count for the class was exactly 1 (== `seat_cap`),
   confirming no overshoot — the race that motivated this migration is
   closed.
4. **Idempotency**: re-ran the migration file a second time against the same
   database — `create or replace function` + `drop trigger if exists` +
   `create trigger` all succeeded with no errors, trigger still correctly
   attached afterward.

Throwaway cluster torn down afterward; nothing left in `/tmp` or the
scratchpad beyond what already existed before this task.
