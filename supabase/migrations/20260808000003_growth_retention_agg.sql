-- growth_cohort_agg: weekly device cohorts, return rates, and the trailing
-- weekly-active series.
--
-- Weeks are PH calendar weeks. `created_at at time zone 'Asia/Manila'`
-- converts the timestamptz to Manila wall-clock before truncation, so a week
-- boundary lands at Monday 00:00 in Manila rather than in UTC. Getting this
-- wrong shifts every bucket by eight hours and quietly moves activity between
-- weeks.
--
-- weekly_active exists because visits cluster around exam dates. Until the
-- term calendar in lib/reports/academicCalendar.ts is populated, this trailing
-- series is the only evidence-based way to tell a real engagement drop from a
-- normal quiet week.
create or replace function growth_cohort_agg(p_weeks int default 8)
returns json
language sql
security definer
set search_path = public
as $$
  with first_seen as (
    select
      device_id,
      date_trunc('week', min(created_at) at time zone 'Asia/Manila')::date as cohort_week
    from events
    group by device_id
  ),
  activity as (
    select distinct
      device_id,
      date_trunc('week', created_at at time zone 'Asia/Manila')::date as active_week
    from events
    where created_at >= now() - make_interval(weeks => p_weeks + 2)
  ),
  weekly as (
    select active_week, count(*)::int as active_devices
    from activity
    group by active_week
    order by active_week desc
  ),
  cohorts as (
    select
      f.cohort_week,
      count(distinct f.device_id)::int as size,
      -- Integer arithmetic on a date adds days in Postgres, so +7 is "the
      -- following week's bucket".
      count(distinct a.device_id) filter (
        where a.active_week = f.cohort_week + 7)::int  as returned_week_1,
      count(distinct a.device_id) filter (
        where a.active_week = f.cohort_week + 14)::int as returned_week_2
    from first_seen f
    left join activity a on a.device_id = f.device_id
    where f.cohort_week >=
      date_trunc('week', (now() at time zone 'Asia/Manila'))::date - (p_weeks * 7)
    group by f.cohort_week
    order by f.cohort_week desc
  )
  select json_build_object(
    'weekly_active', (select json_agg(row_to_json(w)) from weekly w),
    'cohorts',       (select json_agg(row_to_json(c)) from cohorts c)
  );
$$;

-- growth_content_agg: which modules get opened versus finished.
--
-- High opens with low completion is a content problem wearing an engagement
-- costume, and it is the input to "what should I build next".
create or replace function growth_content_agg(
  p_since timestamptz,
  p_until timestamptz,
  p_limit int default 20
)
returns json
language sql
security definer
set search_path = public
as $$
  with opens as (
    select module_id, count(distinct device_id)::int as open_devices
    from events
    where event_type = 'module_open'
      and module_id is not null
      and created_at >= p_since
      and created_at <  p_until
    group by module_id
  ),
  completions as (
    select module_id, count(distinct device_id)::int as completed_devices
    from module_progress
    where completed_at >= p_since
      and completed_at <  p_until
    group by module_id
  )
  select json_agg(row_to_json(t))
  from (
    select
      m.title as module_title,
      s.title as subject_title,
      o.open_devices,
      coalesce(c.completed_devices, 0) as completed_devices
    from opens o
    join modules  m on m.id = o.module_id
    join subjects s on s.id = m.subject_id
    -- module_progress.module_id is TEXT while modules.id is UUID. Cast the
    -- UUID side to text: casting the text side to uuid would raise on the
    -- first non-uuid row ever written and take the whole report down for one
    -- bad record.
    left join completions c on c.module_id = m.id::text
    order by o.open_devices desc
    limit p_limit
  ) t;
$$;

-- growth_demand_agg: what people ask for that does not exist yet.
--
-- The waitlist is the demand-sensing surface — ComingSoonModal and the paywall
-- both write into it (see the `source` check constraint). device_type is here
-- and nowhere else: lib/deviceType.ts is called only by
-- app/api/waitlist/route.ts, so this is the ONLY device-type segmentation the
-- product can produce.
create or replace function growth_demand_agg(
  p_since timestamptz,
  p_until timestamptz
)
returns json
language sql
security definer
set search_path = public
as $$
  with windowed as (
    select * from waitlist
    where created_at >= p_since and created_at < p_until
  )
  select json_build_object(
    'signups_window',   (select count(*) from windowed),
    'signups_all_time', (select count(*) from waitlist),
    'by_source', (
      select json_agg(row_to_json(t))
      from (select source, count(*)::int as count
              from windowed group by source order by count desc) t
    ),
    'by_year', (
      select json_agg(row_to_json(t))
      from (select coalesce(year_label, 'Unknown') as year_label, count(*)::int as count
              from windowed group by 1 order by count desc) t
    ),
    'by_subject', (
      select json_agg(row_to_json(t))
      from (select subject_title, coalesce(year_label, '') as year_label, count(*)::int as count
              from windowed where subject_title is not null
              group by subject_title, year_label order by count desc limit 20) t
    ),
    'willing_to_pay', (
      select json_agg(row_to_json(t))
      from (select coalesce(willing_to_pay, 'unanswered') as answer, count(*)::int as count
              from windowed group by 1 order by count desc) t
    ),
    'by_device_type', (
      select json_agg(row_to_json(t))
      from (select device_type, count(*)::int as count
              from windowed group by device_type order by count desc) t
    )
  );
$$;

-- growth_feedback_agg: the only department input written in users' own words.
--
-- Returns verbatim text on purpose — themes, not counts, are what this is for.
-- Safe only because docs/reports/ is gitignored in full and the repo is public.
-- Deliberately returns NO device_id, user_id, or coupon_code: the report needs
-- what was said, never who said it.
--
-- Note for future work: user_feedback.device_id is UUID while events.device_id
-- and payments.device_id are TEXT. Any join across them needs an explicit cast.
create or replace function growth_feedback_agg(
  p_since timestamptz,
  p_until timestamptz,
  p_limit int default 40
)
returns json
language sql
security definer
set search_path = public
as $$
  with windowed as (
    select * from user_feedback
    where created_at >= p_since and created_at < p_until
  )
  select json_build_object(
    'rows_window',       (select count(*) from windowed),
    'rows_all_time',     (select count(*) from user_feedback),
    'avg_app_rating',    (select round(avg(app_rating), 2) from windowed),
    'avg_module_rating', (select round(avg(module_rating), 2) from windowed),
    'recent', (
      select json_agg(row_to_json(t))
      from (
        select
          w.created_at,
          w.app_rating,
          w.module_rating,
          w.feedback_text,
          m.title as module_title
        from windowed w
        left join modules m on m.id = w.module_id
        where coalesce(w.feedback_text, '') <> ''
        order by w.created_at desc
        limit p_limit
      ) t
    )
  );
$$;

revoke execute on function growth_cohort_agg(int) from public, anon, authenticated;
grant execute on function growth_cohort_agg(int) to service_role;

revoke execute on function growth_content_agg(timestamptz, timestamptz, int)
  from public, anon, authenticated;
grant execute on function growth_content_agg(timestamptz, timestamptz, int) to service_role;

revoke execute on function growth_demand_agg(timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function growth_demand_agg(timestamptz, timestamptz) to service_role;

revoke execute on function growth_feedback_agg(timestamptz, timestamptz, int)
  from public, anon, authenticated;
grant execute on function growth_feedback_agg(timestamptz, timestamptz, int) to service_role;
