-- Account erasure: make the user_id links that erasure *unlinks* also unlink
-- themselves if an auth user is ever deleted some other way (the Supabase
-- dashboard, a DPO request handled by hand).
--
-- These six columns were added as `user_id uuid references auth.users(id)`
-- with no ON DELETE clause, i.e. NO ACTION: deleting the auth user fails with
-- a foreign-key violation while any row still points at it. lib/deleteAccount.ts
-- nulls them first, so the app path works either way; this closes the manual
-- path and matches what the app does (the rows are kept, the person is not).
--
-- Idempotent: every existing FK from <table>.user_id to auth.users is dropped
-- by catalogue lookup (whatever it is named), then one constraint with the
-- conventional name is recreated. Re-running converges on the same state.

do $$
declare
  t text;
  c record;
begin
  foreach t in array array[
    'subscriptions',
    'payments',
    'unlocks',
    'module_progress',
    'module_quiz_progress',
    'module_quiz_answers'
  ] loop
    if to_regclass('public.' || t) is null then
      continue;
    end if;

    for c in
      select con.conname
      from pg_constraint con
      join pg_attribute att
        on att.attrelid = con.conrelid and att.attnum = any (con.conkey)
      where con.contype = 'f'
        and con.conrelid = ('public.' || t)::regclass
        and con.confrelid = 'auth.users'::regclass
        and att.attname = 'user_id'
    loop
      execute format('alter table public.%I drop constraint %I', t, c.conname);
    end loop;

    execute format(
      'alter table public.%I add constraint %I foreign key (user_id) references auth.users(id) on delete set null',
      t,
      t || '_user_id_fkey'
    );
  end loop;
end
$$;
