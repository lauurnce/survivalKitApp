# Verification: `events_event_type_check` — add `print_gate_shown`

**Not yet applied.** Apply by hand in the Supabase Studio SQL editor (or via
the Supabase connector), as `postgres`, like every other migration in this
repo. Until it runs, the signed-out print prompt still works but its
`print_gate_shown` rows are rejected by the constraint (the API logs
`events_event_type_check`); `print_click` is unaffected. Do not tick a box
until you have run the query and read real output. This repo is public —
never paste a production figure into this file.

If another branch also widened this constraint, merge both lists into one
migration before applying: each version drops and re-adds the whole list.

## Step 1 — apply

Run `20261101000300_events_add_print_gate_shown.sql`. It is idempotent
(`drop constraint if exists` then `add`), so a second run is a no-op.

Result: ☐ not yet run — date applied: __________

## Step 2 — the constraint lists `print_gate_shown`

```sql
select pg_get_constraintdef(oid)
from pg_constraint
where conname = 'events_event_type_check';
```

Expect all fifteen types, ending in `'print_click'`, `'print_gate_shown'`.

Result: ☐

## Step 3 — existing types still accepted

The list is the previous one plus `print_gate_shown`, so no existing row can
violate it; the `add constraint` in step 1 would have failed otherwise.

Result: ☐
