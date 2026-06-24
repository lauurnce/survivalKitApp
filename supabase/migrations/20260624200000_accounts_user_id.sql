-- Accounts: attach paid/progress rows to a Supabase auth user.
-- Nullable so existing anonymous device rows stay valid; claimDeviceRows()
-- backfills user_id on login. Idempotent for re-runs.

alter table subscriptions   add column if not exists user_id uuid references auth.users(id);
alter table payments        add column if not exists user_id uuid references auth.users(id);
alter table module_progress add column if not exists user_id uuid references auth.users(id);
alter table unlocks         add column if not exists user_id uuid references auth.users(id);

create index if not exists subscriptions_user_id_idx   on subscriptions   (user_id);
create index if not exists payments_user_id_idx        on payments        (user_id);
create index if not exists module_progress_user_id_idx on module_progress (user_id);
create index if not exists unlocks_user_id_idx         on unlocks         (user_id);

-- Logged-in users may read their own rows (device policies remain for anon).
drop policy if exists "user reads own subscriptions" on subscriptions;
create policy "user reads own subscriptions" on subscriptions
  for select using (user_id = auth.uid());

drop policy if exists "user reads own payments" on payments;
create policy "user reads own payments" on payments
  for select using (user_id = auth.uid());

drop policy if exists "user reads own module_progress" on module_progress;
create policy "user reads own module_progress" on module_progress
  for select using (user_id = auth.uid());

drop policy if exists "user reads own unlocks" on unlocks;
create policy "user reads own unlocks" on unlocks
  for select using (user_id = auth.uid());
