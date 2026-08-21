-- dash_exit_agg: where students stop.
--
-- This is the dashboard's churn measure, and it is NOT subscription lapse. It
-- answers: how many devices open one module and never come back, how many
-- touch one subject and stop, and WHICH module or subject they were last seen
-- on. A drop-off number without an exit point tells you that you have a
-- problem; the exit point tells you where it is.
--
-- There is deliberately no identity function beside this one. The device and
-- account reconciliation the dashboard needs already exists as
-- growth_identity_agg() in 20260808000000_growth_identity_agg.sql, reviewed and
-- applied through the same checklist. A second implementation of "what counts
-- as a device" would be a second thing to keep in step, and the two would drift.
--
-- Windows are half-open: >= p_since, < p_until. Manila is the reporting
-- calendar everywhere else in this codebase, and the caller passes boundaries
-- already resolved in Manila terms.
create or replace function dash_exit_agg(
  p_since timestamptz,
  p_until timestamptz,
  p_limit int default 20
)
returns json
language sql
security definer
set search_path = public
as $$
  with activity as (
    -- module_open is the only event that names a module, so it is what "how
    -- far did they get" is built from. module_id is nullable on events (a
    -- deep link can arrive without one), and a null would join to nothing and
    -- silently shrink every count below, so it is excluded here rather than
    -- left to disappear in a join.
    select device_id, module_id, created_at
    from events
    where event_type = 'module_open'
      and module_id is not null
      and created_at >= p_since
      and created_at <  p_until
  ),
  -- Subject is taken from modules, never from events.subject_id: the same
  -- module always belongs to one subject, whereas the event column is
  -- populated inconsistently depending on the entry path.
  activity_scoped as (
    select a.device_id, a.module_id, m.subject_id, a.created_at
    from activity a
    join modules m on m.id = a.module_id
  ),
  per_device as (
    select
      device_id,
      count(distinct module_id)::int  as modules_opened,
      count(distinct subject_id)::int as subjects_touched,
      max(created_at)                 as last_seen
    from activity_scoped
    group by device_id
  ),
  depth as (
    select
      count(*)::int                                            as devices_total,
      count(*) filter (where modules_opened = 1)::int           as devices_one_module,
      count(*) filter (where modules_opened between 2 and 3)::int as devices_two_to_three_modules,
      count(*) filter (where modules_opened >= 4)::int          as devices_four_plus_modules,
      count(*) filter (where subjects_touched = 1)::int         as devices_one_subject,
      count(*) filter (where subjects_touched >= 2)::int        as devices_multi_subject
    from per_device
  ),
  -- The module each device was LAST seen on inside the window. distinct on
  -- with a matching order by is the Postgres idiom for "one row per group,
  -- picked by an ordering" and avoids a self-join against max(created_at),
  -- which would return two rows for a device that opened two modules in the
  -- same millisecond.
  last_module as (
    select distinct on (device_id)
      device_id, module_id, subject_id
    from activity_scoped
    order by device_id, created_at desc, module_id
  ),
  -- UNCAPPED group sets. total_groups below counts THESE, never the capped
  -- row lists -- a count taken off the limited query always equals the number
  -- of rows returned and silently reports every truncated list as complete.
  exit_modules_all as (
    select
      m.title as module_title,
      s.title as subject_title,
      count(*)::int as devices
    from last_module lm
    join modules  m on m.id = lm.module_id
    join subjects s on s.id = lm.subject_id
    group by m.title, s.title
  ),
  exit_subjects_all as (
    select
      s.title as subject_title,
      count(*)::int as devices
    from last_module lm
    join subjects s on s.id = lm.subject_id
    group by s.title
  )
  select json_build_object(
    'since', p_since,
    'until', p_until,
    'depth', (select row_to_json(d) from depth d),
    'exit_modules', json_build_object(
      'rows', (
        select json_agg(row_to_json(t))
        from (
          select module_title, subject_title, devices
          from exit_modules_all
          order by devices desc, module_title
          limit p_limit
        ) t
      ),
      'total_groups', (select count(*)::int from exit_modules_all)
    ),
    'exit_subjects', json_build_object(
      'rows', (
        select json_agg(row_to_json(t))
        from (
          select subject_title, devices
          from exit_subjects_all
          order by devices desc, subject_title
          limit p_limit
        ) t
      ),
      'total_groups', (select count(*)::int from exit_subjects_all)
    )
  );
$$;

revoke execute on function dash_exit_agg(timestamptz, timestamptz, int)
  from public, anon, authenticated;
grant execute on function dash_exit_agg(timestamptz, timestamptz, int) to service_role;
