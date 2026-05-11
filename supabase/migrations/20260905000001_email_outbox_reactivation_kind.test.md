<!-- supabase/migrations/20260905000001_email_outbox_reactivation_kind.test.md -->
# email_outbox: reactivation kind

- Run the migration twice → no error, one `email_outbox_kind_check` constraint.
- `select pg_get_constraintdef(oid) from pg_constraint where conname = 'email_outbox_kind_check'`
  → lists all five kinds.
- Insert kind 'reactivation' → succeeds. Insert kind 'bogus' → check violation.
- Insert two 'reactivation' rows for the same user with scope_key
  'finals-dec-2026' → second raises 23505 (the existing unique index), which is
  what makes `scripts/email/reactivation.ts --enqueue` safe to re-run.
