# Verification: `classes_subject_id_nullable`

## Red state confirmed

Before this migration, `classes.subject_id` is `not null` (see
`supabase/migrations/20260716000000_classes.sql`). An "all subjects for this
year" class purchase needs to store `subject_id = NULL` to mean "covers
every subject in the year," mirroring `subscriptions.subject_id IS NULL`
already meaning "whole year" for solo purchases. Without this migration,
inserting such a row fails a NOT NULL constraint violation.

## Verified live against a real local Postgres instance

Homebrew Postgres 16 (`initdb` + `pg_ctl`, Unix socket under `/tmp` to avoid
the 103-byte socket-path limit), no Docker.

1. Created a throwaway `classes_notnull_test` table with `subject_id uuid not
   null`.
2. Ran `alter table classes_notnull_test alter column subject_id drop not
   null;` — succeeded.
3. Inserted a row with `subject_id = null` — succeeded (previously would
   have violated NOT NULL).
4. Ran the same `alter ... drop not null` a second time — succeeded as a
   no-op (Postgres treats dropping an already-dropped NOT NULL constraint as
   idempotent, confirming the migration is safe to replay).

## Verified the `isSubscribed` fix against real Postgres semantics

Built a minimal schema (`years`, `subjects`, `classes` with nullable
`subject_id`, `class_members`) and reconstructed the exact WHERE clause
PostgREST generates for
`.eq("classes.year_id", yearId).or("subject_id.eq.X,subject_id.is.null", { referencedTable: "classes" })`
(an INNER JOIN plus a WHERE clause ANDing all embedded-table filters,
including the OR group):

```sql
select cm.class_id
from class_members cm
join classes c on c.id = cm.class_id
where cm.device_id = :deviceId
  and c.year_id = :yearId
  and (c.subject_id = :subjectId or c.subject_id is null)
  and c.status = 'active'
  and c.current_period_end > now()
limit 1;
```

Three scenarios run against seeded data:

1. An all-subjects class (`subject_id IS NULL`) in year-1, queried for an
   arbitrary subject in year-1 → **1 row returned** (unlocks correctly).
2. Same all-subjects class, queried against a *different* year (year-2) →
   **0 rows** (correctly does not leak across years).
3. A subject-scoped class for "Subject B", queried for "Subject A" → **0
   rows** (regression check: the OR clause doesn't accidentally widen
   subject-scoped matching).

All three matched the corresponding unit-test expectations in
`lib/subscriptions.test.ts`, confirming the `.or()` + `referencedTable`
syntax (verified against the installed `@supabase/postgrest-js@2.108.1`
source, which documents this exact form) produces correct real-database
results, not just a passing mock.
