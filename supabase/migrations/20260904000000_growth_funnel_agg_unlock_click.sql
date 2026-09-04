-- growth_funnel_agg: add unlock_click as a live funnel step.
--
-- Issue #32: the function header on 20260808000001_growth_funnel_agg.sql (and
-- lib/reports/funnel.ts's own header) claimed unlock_click is "emitted by no
-- code since the subscription pivot". That was false: SectionRenderer.tsx and
-- LockedReviewer.tsx both still fire it live, at /unlock, where the price is
-- first quoted. lib/adminFunnel.ts already treats it as live (removed from
-- DEAD_EVENT_TYPES, charted as "Reached Unlock"), and the dead-events CTE
-- below shows a live last-seen timestamp with real row counts today — the
-- funnel table was the only place still misreporting it as dead.
--
-- This adds one windowed count to the existing steps CTE, between
-- paywall_teaser_click and subscribe_click (the live path's own order), and
-- otherwise leaves the function unchanged: same windowing, same permissions
-- (create or replace on the same signature — the revoke/grant below are
-- unconditional and idempotent, not a new permission surface, see this
-- migration's .test.md).
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
      -- Live, not dead — see this migration's header. Sits between the
      -- paywall tap and checkout on the live path.
      count(distinct device_id) filter (where event_type = 'unlock_click')        as unlock_click,
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
    -- DELIBERATELY NOT WINDOWED. unlock_click is no longer claimed dead (see
    -- above) but stays here too: an all-time count plus a last-seen timestamp
    -- is still the only thing that can evidence unlock_submitted's claim.
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
