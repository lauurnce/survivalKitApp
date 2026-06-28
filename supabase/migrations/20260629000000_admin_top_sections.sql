-- admin_top_sections: aggregate section_view events in Postgres to avoid the
-- PostgREST 3000-row cap that currently truncates section ranking.
-- Returns top N sections by raw event count, all-time.
create or replace function admin_top_sections(p_limit int default 8)
returns table(section_id uuid, event_count bigint)
language sql security definer as $$
  select
    e.section_id,
    count(*) as event_count
  from events e
  where e.event_type = 'section_view'
    and e.section_id is not null
  group by e.section_id
  order by event_count desc
  limit p_limit;
$$;

-- admin_active_subscribers: count subscriptions where status='active' AND
-- current_period_end > now() in Postgres. Avoids the PostgREST 1000-row
-- default cap that would silently undercount once you have >1000 subscribers.
create or replace function admin_active_subscribers()
returns bigint
language sql security definer as $$
  select count(*)
  from subscriptions
  where status = 'active'
    and current_period_end > now();
$$;

-- Extend record_visit to handle resource_type = 'section'.
-- Previously only 'year', 'subject', 'module' were handled; 'section' fell
-- through to the final no-op branch (within-window guard) without ever
-- inserting a counter_log row, so the read_count on the counters row was
-- never incremented for sections. This replaces the function definition.
create or replace function record_visit(
  p_device_id     text,
  p_resource_type text,
  p_resource_id   text
) returns void language plpgsql security definer as $$
declare
  v_log counter_log%rowtype;
begin
  select * into v_log
  from counter_log
  where device_id     = p_device_id
    and resource_type = p_resource_type
    and resource_id   = p_resource_id;

  if not found then
    -- First visit: insert log row and increment the relevant counter.
    insert into counter_log (device_id, resource_type, resource_id)
    values (p_device_id, p_resource_type, p_resource_id);

    if p_resource_type = 'year' then
      insert into counters (resource_type, resource_id, reader_count, read_count)
      values (p_resource_type, p_resource_id, 1, 0)
      on conflict (resource_type, resource_id)
      do update set reader_count = counters.reader_count + 1;
    else
      -- subject, module, section all use read_count
      insert into counters (resource_type, resource_id, reader_count, read_count)
      values (p_resource_type, p_resource_id, 0, 1)
      on conflict (resource_type, resource_id)
      do update set read_count = counters.read_count + 1;
    end if;

  elsif p_resource_type = 'year' then
    null; -- year reader_count: 1 per device ever, never re-increment

  elsif v_log.last_read_at < now() - interval '10 minutes' then
    -- subject / module / section: outside 10-min window, count again
    update counter_log
    set last_read_at = now()
    where device_id     = p_device_id
      and resource_type = p_resource_type
      and resource_id   = p_resource_id;

    update counters
    set read_count = read_count + 1
    where resource_type = p_resource_type
      and resource_id   = p_resource_id;

  end if;
  -- else: within 10-min window → do nothing
end;
$$;

grant execute on function admin_top_sections(int) to service_role;
grant execute on function admin_active_subscribers() to service_role;
grant execute on function record_visit(text, text, text) to anon, authenticated;
