# Verification: `events_event_type_check` — add the lesson-engagement types

**Not yet applied.** Apply by hand in the Supabase Studio SQL editor (or via
the Supabase connector), as `postgres`, like every other migration in this
repo. Until it runs, the reader still works but the new events' rows are
rejected by the constraint (the API logs `events_event_type_check`). Do not
tick a box until you have run the query and read real output. This repo is
public — never paste a production figure into this file.

The API allowlist (`VALID_EVENT_TYPES` in `app/api/events/route.ts`) must gain
the same eight types, or the route 400s them before they reach the table.

If another branch also widened this constraint, merge both lists into one
migration before applying: each version drops and re-adds the whole list.

## Step 1 — apply

Run `20261101000500_events_add_lesson_engagement.sql`. It is idempotent
(`drop constraint if exists` then `add`), so a second run is a no-op.

Result: ☐ not yet run — date applied: __________

## Step 2 — the constraint lists the new types

```sql
select pg_get_constraintdef(oid)
from pg_constraint
where conname = 'events_event_type_check';
```

Expect all twenty-three types: the previous fifteen, then `'lesson_halfway'`,
`'lesson_end'`, `'next_lesson_click'`, `'lesson_resume'`,
`'quick_check_correct'`, `'quick_check_wrong'`, `'lesson_share'`,
`'code_run'`.

Result: ☐

## Step 3 — existing types still accepted

The list is the previous one plus eight, so no existing row can violate it;
the `add constraint` in step 1 would have failed otherwise.

Result: ☐
