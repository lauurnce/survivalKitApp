<!-- supabase/migrations/20261101000000_user_id_fk_on_delete_set_null.test.md -->
# user_id FKs: ON DELETE SET NULL

- Run the migration twice → second run is a no-op (no error), and each of the
  six tables has exactly one FK on user_id to auth.users:
  `select conrelid::regclass, conname, confdeltype from pg_constraint
   where contype = 'f' and confrelid = 'auth.users'::regclass;`
  → subscriptions, payments, unlocks, module_progress, module_quiz_progress,
  module_quiz_answers each show `<table>_user_id_fkey` with confdeltype `n`.
- Insert a module_quiz_progress row linked to a test auth user, then delete the
  auth user → the delete succeeds (before: 23503) and the row survives with
  user_id null.
- Same for a payments row → the ledger row survives, user_id null.
