# Verification: `events_event_type_check` — add `print_click`

**Not yet applied.** Apply by hand in the Supabase Studio SQL editor, as
`postgres`, like every other migration in this repo. Until it runs, the
reader's Print button still works but its `print_click` rows are rejected by
the constraint (the API logs `events_event_type_check`). Do not tick a box
until you have run the query and read real output. This repo is public —
never paste a production figure into this file.

If another branch also widened this constraint, merge both lists into one
migration before applying: each version drops and re-adds the whole list.

## Step 1 — apply

Paste `20261031000000_events_add_print_click.sql` into the SQL editor and run it.
It is idempotent (`drop constraint if exists` then `add`).

Result: ☐ not yet run — date applied: __________

## Step 2 — the constraint lists `print_click`

```sql
select pg_get_constraintdef(oid)
from pg_constraint
where conname = 'events_event_type_check';
```

Expect all fourteen types, ending in `'print_click'`.

Result: ☐

## Step 3 — existing types still accepted

The list is the previous one plus `print_click`, so no existing row can violate
it; the `add constraint` in step 1 would have failed otherwise.

Result: ☐
