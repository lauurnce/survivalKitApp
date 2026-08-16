-- growth_acquisition_agg: where visitors came from, in a window.
--
-- Attribution is captured on `enter` events only — see getAttribution() in
-- lib/analytics.ts, which runs for that event type and no other. Values are
-- sanitized and length-capped by app/api/events/route.ts before insert.
--
-- Referrers are stored as full URLs, so they are reduced to a host here.
-- Fifty distinct deep links from one platform are one source, not fifty.

-- This migration is the SOLE creator of events_type_created_idx. No other
-- migration creates it — confirmed by grepping
-- 20260808000003_growth_retention_agg.sql, which consumes it but does not
-- create it (see below).
--
-- It has two consumers. This file's `enters` CTE just below filters
-- `events` on `event_type = 'enter'` AND a `created_at` range in the same
-- WHERE clause, before any aggregation happens — a composite
-- (event_type, created_at desc) index narrows that scan directly.
-- `growth_content_agg`'s `opens` CTE in
-- 20260808000003_growth_retention_agg.sql filters the identical shape
-- (`event_type = 'module_open'` AND a `created_at` range against the base
-- table) and relies on this same index existing, without creating it
-- itself. `growth_funnel_agg`'s `windowed` CTE looked like a candidate
-- consumer too, but its event_type predicates live only inside aggregate
-- FILTER clauses, which restrict which already-scanned rows get counted,
-- not which rows the scan reads — that mismatch is why the index was
-- removed from that migration (commit af9ffc7) and landed here instead.
-- `if not exists` is kept for safety if this migration is ever re-applied,
-- not because a second migration also creates this index — none does.
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
    -- Capped distributions below are wrapped as { rows, total_groups } so a
    -- reader can tell "top 15 of 15" (complete) from "top 15 of 40"
    -- (truncated) rather than the bare array implying completeness either
    -- way. total_groups is the number of groups the GROUP BY would have
    -- produced with no LIMIT applied.
    'by_referrer_host', (
      with hosts as (
        select
          coalesce(
            nullif(split_part(split_part(referrer, '://', 2), '/', 1), ''),
            '(none)'
          ) as host,
          count(*)::int as count
        from enters
        group by 1
      )
      select json_build_object(
        'rows', (
          select json_agg(row_to_json(t))
          from (select host, count from hosts order by count desc limit 15) t
        ),
        'total_groups', (select count(*)::int from hosts)
      )
    ),
    'by_utm_source', (
      with sources as (
        select
          coalesce(utm_source, '(none)') as utm_source,
          coalesce(utm_medium, '(none)') as utm_medium,
          count(*)::int as count
        from enters
        group by 1, 2
      )
      select json_build_object(
        'rows', (
          select json_agg(row_to_json(t))
          from (select utm_source, utm_medium, count from sources order by count desc limit 15) t
        ),
        'total_groups', (select count(*)::int from sources)
      )
    ),
    'by_utm_campaign', (
      with campaigns as (
        select utm_campaign, count(*)::int as count
        from enters
        where utm_campaign is not null
        group by utm_campaign
      )
      select json_build_object(
        'rows', (
          select json_agg(row_to_json(t))
          from (select utm_campaign, count from campaigns order by count desc limit 15) t
        ),
        'total_groups', (select count(*)::int from campaigns)
      )
    )
  );
$$;

revoke execute on function growth_acquisition_agg(timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function growth_acquisition_agg(timestamptz, timestamptz) to service_role;

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
      with subject_rows as (
        select
          s.title as subject_title,
          y.label as year_label,
          count(distinct w.device_id) filter (
            where w.event_type = 'module_open')::int          as module_open_devices,
          count(distinct w.device_id) filter (
            where w.event_type = 'paywall_teaser_view')::int  as paywall_devices,
          -- NOT all paid devices for this subject — whole-year-plan payments
          -- have subject_id IS NULL (20260624120000_payments_ledger.sql:11)
          -- and can never match pd.subject_id = s.id, so this equality
          -- excludes them BY CONSTRUCTION. isSubscribed() (lib/subscriptions.ts)
          -- treats a null-subject year plan as unlocking every subject in
          -- that year, so those payers are real conversions, just not
          -- attributable to one subject out of the ~30 a year plan unlocks —
          -- attributing one payment across all of them would inflate every
          -- subject's count into a meaningless number. They are not missing:
          -- by_year.paid_devices (above) counts them correctly, because that
          -- join is on year_id, which a payment always has. Hence the name:
          -- this counts only devices whose paid plan was scoped to this one
          -- subject.
          (select count(distinct pd.device_id)
             from paid_devices pd where pd.subject_id = s.id)::int as subject_plan_paid_devices
        from subjects s
        join years y on y.id = s.year_id
        left join windowed w on w.subject_id = s.id
        group by s.id, s.title, y.label
        having count(w.device_id) > 0
      )
      select json_build_object(
        'rows', (
          select json_agg(row_to_json(t))
          from (
            select subject_title, year_label, module_open_devices, paywall_devices, subject_plan_paid_devices
            from subject_rows
            order by module_open_devices desc
            limit 25
          ) t
        ),
        'total_groups', (select count(*)::int from subject_rows)
      )
    )
  );
$$;

revoke execute on function growth_segment_agg(timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function growth_segment_agg(timestamptz, timestamptz) to service_role;
