-- Supports the windowed event scans below. The table already has
-- idx_events_created (created_at desc) and idx_events_device, but every query
-- in this file filters on event_type inside a time window, which wants both
-- columns in one index. At this table size the build is sub-second and the
-- write lock is not worth working around.
create index if not exists events_type_created_idx
  on public.events (event_type, created_at desc);

-- growth_funnel_agg: distinct-device counts for each step of the LIVE funnel
-- inside a window, plus completion from the payments ledger.
--
-- The live path is:
--   enter -> year_select -> subject_open -> module_open
--         -> paywall_teaser_view -> paywall_teaser_click -> subscribe_click
--         -> paid (ledger)
--
-- There is NO completion event. `unlock_submitted` was the "they paid" step
-- before the subscription pivot and nothing replaced it. The ledger is the
-- better source anyway: a payments row is written by a signature-verified
-- webhook, while a client beacon is lost whenever a user bounces to GCash and
-- never returns.
--
-- Windows are half-open [p_since, p_until) so consecutive weeks abut exactly
-- and no event is counted in two of them.
create or replace function growth_funnel_agg(
  p_since timestamptz,
  p_until timestamptz
)
returns json
language sql
security definer
set search_path = public
as $$
  with windowed as (
    select device_id, event_type, subject_id
    from events
    where created_at >= p_since
      and created_at <  p_until
  ),
  steps as (
    select
      count(distinct device_id) filter (where event_type = 'enter')                as enter,
      count(distinct device_id) filter (where event_type = 'year_select')          as year_select,
      -- subject_open fires on TWO pages. The subject LIST page emits it with
      -- year_id only (app/(main)/year/[yearId]/subjects/page.tsx); the modules
      -- page emits it WITH subject_id, which is the real "opened a subject".
      -- The funnel step means the latter.
      count(distinct device_id) filter (where event_type = 'subject_open'
                                          and subject_id is not null)              as subject_open,
      -- Unfiltered, so the inflation caused by the list page stays visible.
      count(distinct device_id) filter (where event_type = 'subject_open')         as subject_open_any,
      count(distinct device_id) filter (where event_type = 'module_open')          as module_open,
      count(distinct device_id) filter (where event_type = 'paywall_teaser_view')  as paywall_teaser_view,
      count(distinct device_id) filter (where event_type = 'paywall_teaser_click') as paywall_teaser_click,
      count(distinct device_id) filter (where event_type = 'subscribe_click')      as subscribe_click,
      -- Every device that did anything. Exceeds `enter` by the deep-link
      -- population, which is why the funnel is not guaranteed monotonic.
      count(distinct device_id)                                                    as any_event
    from windowed
  ),
  checkout_devices as (
    select distinct device_id
    from windowed
    where event_type = 'subscribe_click'
  ),
  ledger as (
    select
      count(distinct p.device_id)                                        as paid,
      count(distinct p.device_id) filter (where c.device_id is not null)  as paid_after_subscribe_click
    from payments p
    left join checkout_devices c on c.device_id = p.device_id
    where p.paid_at >= p_since
      and p.paid_at <  p_until
  ),
  entitlements as (
    -- Handed across to Finance: a subscription created in the window without a
    -- matching payment is either comped access or a webhook granting
    -- entitlement without recording money.
    select count(distinct device_id) as subscriptions_created
    from subscriptions
    where created_at >= p_since
      and created_at <  p_until
  ),
  dead as (
    -- DELIBERATELY NOT WINDOWED. The claim is "no code has emitted these since
    -- the pivot", and only an all-time count plus a last-seen timestamp can
    -- evidence that. A windowed zero proves nothing.
    select
      count(*) filter (where event_type = 'unlock_click')     as unlock_click_rows,
      count(*) filter (where event_type = 'unlock_submitted') as unlock_submitted_rows,
      max(created_at) filter (
        where event_type in ('unlock_click', 'unlock_submitted')
      ) as dead_last_seen
    from events
  )
  select json_build_object(
    'since',        p_since,
    'until',        p_until,
    'steps',        (select row_to_json(s) from steps s),
    'ledger',       (select row_to_json(l) from ledger l),
    'entitlements', (select row_to_json(e) from entitlements e),
    'dead_events',  (select row_to_json(d) from dead d)
  );
$$;

revoke execute on function growth_funnel_agg(timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function growth_funnel_agg(timestamptz, timestamptz) to service_role;
