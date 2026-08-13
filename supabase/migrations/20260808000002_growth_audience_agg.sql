-- growth_acquisition_agg: where visitors came from, in a window.
--
-- Attribution is captured on `enter` events only — see getAttribution() in
-- lib/analytics.ts, which runs for that event type and no other. Values are
-- sanitized and length-capped by app/api/events/route.ts before insert.
--
-- Referrers are stored as full URLs, so they are reduced to a host here.
-- Fifty distinct deep links from one platform are one source, not fifty.

-- Supports the `enters` CTE just below: it filters `events` on
-- `event_type = 'enter'` AND a `created_at` range in the same WHERE clause,
-- before any aggregation happens. That is unlike growth_funnel_agg's
-- `windowed` CTE, where event_type only ever appears inside aggregate
-- FILTER clauses — filtering rows already read off disk, not narrowing the
-- scan itself. Here event_type gates the scan directly, so a composite
-- (event_type, created_at desc) index actually reduces what gets read.
-- `if not exists` because Task 8's `opens` CTE needs this identical index
-- and creates it again in its own migration; whichever migration runs
-- second finds it already there and does nothing.
create index if not exists events_type_created_idx
  on events (event_type, created_at desc);

create or replace function growth_acquisition_agg(
  p_since timestamptz,
  p_until timestamptz
)
returns json
language sql
security definer
set search_path = public
as $$
  with enters as (
    select device_id, referrer, utm_source, utm_medium, utm_campaign
    from events
    where event_type = 'enter'
      and created_at >= p_since
      and created_at <  p_until
  )
  select json_build_object(
    'enters',  (select count(*) from enters),
    'devices', (select count(distinct device_id) from enters),
    -- The dark-social signal: links arriving through group chats rather than
    -- search or a linked profile.
    'no_referrer', (select count(*) from enters
                      where referrer is null or referrer = ''),
    'by_referrer_host', (
      select json_agg(row_to_json(t))
      from (
        select
          coalesce(
            nullif(split_part(split_part(referrer, '://', 2), '/', 1), ''),
            '(none)'
          ) as host,
          count(*)::int as count
        from enters
        group by 1
        order by count desc
        limit 15
      ) t
    ),
    'by_utm_source', (
      select json_agg(row_to_json(t))
      from (
        select
          coalesce(utm_source, '(none)') as utm_source,
          coalesce(utm_medium, '(none)') as utm_medium,
          count(*)::int as count
        from enters
        group by 1, 2
        order by count desc
        limit 15
      ) t
    ),
    'by_utm_campaign', (
      select json_agg(row_to_json(t))
      from (
        select utm_campaign, count(*)::int as count
        from enters
        where utm_campaign is not null
        group by utm_campaign
        order by count desc
        limit 15
      ) t
    )
  );
$$;

-- growth_segment_agg: engagement and conversion split by year and by subject.
--
-- A blended average across a first-year-dominated audience hides everything
-- interesting, which is the whole reason this function exists.
--
-- University and device type are deliberately absent. profiles.university is
-- per-ACCOUNT, and accounts are a far smaller population than devices, so it
-- cannot be crossed with a device-keyed funnel — admin_profiles_agg() already
-- reports that distribution. lib/deviceType.ts is called only by
-- app/api/waitlist/route.ts and its output lands only on waitlist.device_type;
-- `events` has no device-type column at all.
create or replace function growth_segment_agg(
  p_since timestamptz,
  p_until timestamptz
)
returns json
language sql
security definer
set search_path = public
as $$
  with windowed as (
    select device_id, event_type, year_id, subject_id
    from events
    where created_at >= p_since
      and created_at <  p_until
  ),
  paid_devices as (
    select distinct device_id, year_id, subject_id
    from payments
    where paid_at >= p_since
      and paid_at <  p_until
  )
  select json_build_object(
    'by_year', (
      select json_agg(row_to_json(t))
      from (
        select
          y.label as year_label,
          count(distinct w.device_id) filter (
            where w.event_type = 'module_open')::int          as module_open_devices,
          count(distinct w.device_id) filter (
            where w.event_type = 'paywall_teaser_view')::int  as paywall_devices,
          (select count(distinct pd.device_id)
             from paid_devices pd where pd.year_id = y.id)::int as paid_devices
        from years y
        left join windowed w on w.year_id = y.id
        group by y.id, y.label, y.sort_order
        order by y.sort_order
      ) t
    ),
    'by_subject', (
      select json_agg(row_to_json(t))
      from (
        select
          s.title as subject_title,
          y.label as year_label,
          count(distinct w.device_id) filter (
            where w.event_type = 'module_open')::int          as module_open_devices,
          count(distinct w.device_id) filter (
            where w.event_type = 'paywall_teaser_view')::int  as paywall_devices,
          (select count(distinct pd.device_id)
             from paid_devices pd where pd.subject_id = s.id)::int as paid_devices
        from subjects s
        join years y on y.id = s.year_id
        left join windowed w on w.subject_id = s.id
        group by s.id, s.title, y.label
        having count(w.device_id) > 0
        order by module_open_devices desc
        limit 25
      ) t
    )
  );
$$;

revoke execute on function growth_acquisition_agg(timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function growth_acquisition_agg(timestamptz, timestamptz) to service_role;

revoke execute on function growth_segment_agg(timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function growth_segment_agg(timestamptz, timestamptz) to service_role;
