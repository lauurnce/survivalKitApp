# Verification: `events_event_type_check` — add the retention event types

**Not yet applied.** Apply by hand in the Supabase Studio SQL editor (or via
the Supabase connector), as `postgres`, like every other migration in this
repo. Until it runs, "Pick up where you left off", the install suggestion and
installs still work, but their `recent_lesson_click`, `install_prompt_shown`
and `pwa_installed` rows are rejected (the API logs `events_event_type_check`).
Do not tick a box until you have run the query and read real output. This repo
is public — never paste a production figure into this file.

This list includes the eight lesson-engagement types from
`20261101000500_events_add_lesson_engagement.sql`, which is already applied.
If another branch widens the constraint too, merge both lists into one
migration before applying: each version drops and re-adds the whole list.

The `/api/events` allowlist (`VALID_EVENT_TYPES` in `app/api/events/route.ts`)
must gain the same three types, or the API rejects them with 400 before the
insert.

## Step 1 — apply

Run `20261101000600_events_add_retention_types.sql`. It is idempotent
(`drop constraint if exists` then `add`), so a second run is a no-op.

Result: ☐ not yet run — date applied: __________

## Step 2 — the constraint lists the new types

```sql
select pg_get_constraintdef(oid)
from pg_constraint
where conname = 'events_event_type_check';
```

Expect all twenty-six types, ending in `'recent_lesson_click'`,
`'install_prompt_shown'`, `'pwa_installed'`.

Result: ☐

## Step 3 — existing types still accepted

The list is a superset of the previous one, so no existing row can violate
it; the `add constraint` in step 1 would have failed otherwise.

Result: ☐
