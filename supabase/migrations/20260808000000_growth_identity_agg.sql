-- growth_identity_agg: every population that anyone might call a "user",
-- counted once, in one place, under names that cannot be confused.
--
-- Why this exists. docs/POST-MORTEM.md records a "total signed-up users"
-- figure about an order of magnitude larger than the number of rows in
-- auth.users. The most likely cause is that the earlier figure counted DEVICES
-- under the device-first identity model that predates accounts: lib/device.ts
-- mints a UUID into localStorage on first visit and every analytics event is
-- keyed on it. Rather than decide which figure was "right", this function
-- returns both under unambiguous names so no report can conflate them again.
--
-- Every count is computed in Postgres. None of these can be done from the
-- client: PostgREST caps a select at 1000 rows and `events` is far past that,
-- so a client-side count(distinct) would silently truncate.
create or replace function growth_identity_agg()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    -- ACCOUNTS. A row in auth.users. Never call this "users" in a report.
    'accounts',              (select count(*) from auth.users),
    'accounts_confirmed',    (select count(*) from auth.users
                                where email_confirmed_at is not null),
    'profiles',              (select count(*) from profiles),

    -- REACH. A device is one browser that stored a device_id in localStorage.
    -- devices_entered is the canonical Growth reach number.
    'devices_entered',       (select count(distinct device_id) from events
                                where event_type = 'enter'),
    -- Will exceed devices_entered: a device arriving on a shared module link
    -- emits module_open without ever emitting enter. The gap is the deep-link
    -- population, and it is why the funnel is not guaranteed monotonic.
    'devices_any_event',     (select count(distinct device_id) from events),

    -- MONEY. Distinct devices in the ledger and in the entitlement table.
    'devices_paid',          (select count(distinct device_id) from payments),
    'devices_subscribed',    (select count(distinct device_id) from subscriptions),
    'subscriptions_active',  (select count(*) from subscriptions
                                where status = 'active'
                                  and current_period_end > now()),

    -- THE BRIDGE between the two identity models. A low ratio here means the
    -- device-first population never became accounts, which is the fact that
    -- makes the two headline numbers differ.
    'payments_with_user_id', (select count(*) from payments where user_id is not null),
    'payments_total',        (select count(*) from payments),

    -- OTHER POPULATIONS that get loosely called "users" in conversation.
    'waitlist_emails',       (select count(distinct lower(email)) from waitlist),
    'class_member_devices',  (select count(distinct device_id) from class_members),
    'feedback_devices',      (select count(distinct device_id) from user_feedback)
  );
$$;

revoke execute on function growth_identity_agg() from public, anon, authenticated;
grant execute on function growth_identity_agg() to service_role;
