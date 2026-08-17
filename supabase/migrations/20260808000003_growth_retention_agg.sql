-- growth_cohort_agg: weekly device cohorts, return counts, and the trailing
-- weekly-active series.
--
-- Weeks are PH calendar weeks. `created_at at time zone 'Asia/Manila'`
-- converts the timestamptz to Manila wall-clock before truncation, so a week
-- boundary lands at Monday 00:00 in Manila rather than in UTC. Getting this
-- wrong shifts every bucket by eight hours and quietly moves activity between
-- weeks.
--
-- weekly_active exists because visits cluster around exam dates. Until the
-- term calendar in lib/reports/academicCalendar.ts is populated, this
-- trailing series is the only evidence-based way to tell a real engagement
-- drop from a normal quiet week. It reports exactly the p_weeks most
-- recently COMPLETED PH weeks — the current, still-in-progress week is
-- deliberately excluded (see the `weekly` CTE below): a partial week always
-- has fewer days of activity than a finished one purely because it isn't
-- over yet, so including it would read as a manufactured decline in the
-- newest bucket.
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
    -- Fetched over p_weeks + 2 weeks — wider than either consumer below
    -- strictly needs on its own — so `cohorts` always has activity data for
    -- its newest cohorts' return-rate buckets. `weekly` trims this down to
    -- exactly what it reports (see below); this CTE is left unnarrowed so
    -- `cohorts`'s correctness never depends on `weekly`'s needs.
    select distinct
      device_id,
      date_trunc('week', created_at at time zone 'Asia/Manila')::date as active_week
    from events
    where created_at >= now() - make_interval(weeks => p_weeks + 2)
  ),
  weekly as (
    -- Trimmed to the trailing p_weeks COMPLETE PH weeks: active_week must be
    -- on or after (this_week_start - p_weeks * 7 days) AND strictly before
    -- this_week_start. That upper bound is what excludes the current,
    -- still-in-progress week — without it, `activity`'s wider p_weeks + 2
    -- fetch above leaks 2 extra weeks plus a partial current week into this
    -- series, which is the bug this trim exists to fix. A week with zero
    -- active devices does not appear as a zero-count row (`group by` does
    -- not manufacture empty groups), so this returns AT MOST p_weeks rows,
    -- never more — see the migration's .test.md for the exact expected
    -- count and the query that verifies it.
    select active_week, count(*)::int as active_devices
    from activity
    where active_week >= date_trunc('week', (now() at time zone 'Asia/Manila'))::date - (p_weeks * 7)
      and active_week <  date_trunc('week', (now() at time zone 'Asia/Manila'))::date
    group by active_week
    order by active_week desc
  ),
  cohorts as (
    -- NO upper bound here, deliberately: the newest cohort's `size` is real
    -- and wanted, and trimming to complete weeks would throw it away.
    --
    -- The cost is that the current, still-in-progress week ALWAYS appears as a
    -- cohort whose returned_week_1 and returned_week_2 are STRUCTURALLY 0 --
    -- the weeks those columns measure have not happened yet. That zero is the
    -- calendar, not a retention collapse, and it will be zero every single run.
    -- Read the newest one or two cohort rows for `size` only. This is the same
    -- partial-period artifact `weekly_active` documents above, which solves it
    -- by trimming because it has no per-row value worth keeping.
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

revoke execute on function growth_cohort_agg(int) from public, anon, authenticated;
grant execute on function growth_cohort_agg(int) to service_role;

-- growth_content_agg: which modules get opened versus finished.
--
-- High opens with low completion is a content problem wearing an engagement
-- costume, and it is the input to "what should I build next".
--
-- Returns { rows: [...], total_groups: N } rather than a bare array: `rows`
-- is capped at p_limit (ranked by open_devices desc), and total_groups is
-- the count of ALL modules with at least one module_open in the window,
-- before that cap — so a consumer can say "top N of M modules" instead of
-- presenting the capped list as the complete picture.
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
  select json_build_object(
    'rows', (
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
        -- module_progress.module_id is TEXT while modules.id is UUID. Cast
        -- the UUID side to text: casting the text side to uuid would raise
        -- on the first non-uuid row ever written and take the whole report
        -- down for one bad record.
        left join completions c on c.module_id = m.id::text
        order by o.open_devices desc
        limit p_limit
      ) t
    ),
    'total_groups', (select count(*) from opens)
  );
$$;

revoke execute on function growth_content_agg(timestamptz, timestamptz, int)
  from public, anon, authenticated;
grant execute on function growth_content_agg(timestamptz, timestamptz, int) to service_role;

-- growth_demand_agg: what people ask for that does not exist yet.
--
-- The waitlist is the demand-sensing surface — ComingSoonModal and the paywall
-- both write into it (see the `source` check constraint). device_type is here
-- and nowhere else: lib/deviceType.ts is called only by
-- app/api/waitlist/route.ts, so this is the ONLY device-type segmentation the
-- product can produce.
--
-- `by_subject` is the one breakdown here capped by row count (top 20 by
-- signups) rather than drawn from a small, inherently bounded value set like
-- source, year, willing_to_pay, or device_type — so it alone is wrapped as
-- { rows: [...], total_groups: N } rather than a bare array, giving the
-- consumer the untruncated group count alongside the capped list.
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
    'by_subject', json_build_object(
      'rows', (
        select json_agg(row_to_json(t))
        from (select subject_title, coalesce(year_label, '') as year_label, count(*)::int as count
                from windowed where subject_title is not null
                group by subject_title, year_label order by count desc limit 20) t
      ),
      -- Total distinct (subject_title, year_label) groups in the window,
      -- before the top-20 cap above.
      'total_groups', (
        select count(*) from (
          select 1 from windowed where subject_title is not null
          group by subject_title, year_label
        ) g
      )
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

revoke execute on function growth_demand_agg(timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function growth_demand_agg(timestamptz, timestamptz) to service_role;

-- growth_feedback_agg: the only department input written in users' own words.
--
-- Returns verbatim text on purpose — themes, not counts, are what this is for.
-- Safe only because docs/reports/ is gitignored in full and the repo is public.
-- Deliberately returns NO device_id, user_id, or coupon_code: the report needs
-- what was said, never who said it.
--
-- Note for future work: user_feedback.device_id is UUID while events.device_id
-- and payments.device_id are TEXT. Any join across them needs an explicit cast.
--
-- `recent` is wrapped as { rows: [...], total_groups: N } because it too is
-- capped, at p_limit, most-recent-first. total_groups counts every row in
-- the window with non-empty feedback_text, which is NOT the same number as
-- the sibling `rows_window` key: `rows_window` also counts rows with blank
-- feedback_text that `recent` excludes entirely, so `rows_window` cannot
-- substitute as `recent`'s own truncation signal.
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
    'recent', json_build_object(
      'rows', (
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
      ),
      'total_groups', (
        select count(*) from windowed w where coalesce(w.feedback_text, '') <> ''
      )
    )
  );
$$;

revoke execute on function growth_feedback_agg(timestamptz, timestamptz, int)
  from public, anon, authenticated;
grant execute on function growth_feedback_agg(timestamptz, timestamptz, int) to service_role;
