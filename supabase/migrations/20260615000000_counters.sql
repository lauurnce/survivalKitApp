-- counters: one row per tracked resource, stores running totals
create table if not exists counters (
  resource_type text not null,
  resource_id   text not null,
  reader_count  int  not null default 0,
  read_count    int  not null default 0,
  primary key (resource_type, resource_id)
);

-- counter_log: one row per device per resource, used for deduplication
create table if not exists counter_log (
  device_id     text        not null,
  resource_type text        not null,
  resource_id   text        not null,
  first_seen_at timestamptz not null default now(),
  last_read_at  timestamptz not null default now(),
  primary key (device_id, resource_type, resource_id)
);

-- index for fast dedup lookups
create index if not exists counter_log_resource_idx
  on counter_log (resource_type, resource_id);

-- record_visit: atomically increments the right counter with dedup logic
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
    -- First visit: insert log, increment the relevant counter only
    insert into counter_log (device_id, resource_type, resource_id)
    values (p_device_id, p_resource_type, p_resource_id);

    if p_resource_type = 'year' then
      insert into counters (resource_type, resource_id, reader_count, read_count)
      values (p_resource_type, p_resource_id, 1, 0)
      on conflict (resource_type, resource_id)
      do update set reader_count = counters.reader_count + 1;
    else
      insert into counters (resource_type, resource_id, reader_count, read_count)
      values (p_resource_type, p_resource_id, 0, 1)
      on conflict (resource_type, resource_id)
      do update set read_count = counters.read_count + 1;
    end if;

  elsif p_resource_type = 'year' then
    null; -- year reader_count: 1 per device ever, never re-increment

  elsif v_log.last_read_at < now() - interval '10 minutes' then
    -- Subject/module: outside 10-min window, count again
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

-- grant execute to anon and authenticated roles
grant execute on function record_visit(text, text, text) to anon, authenticated;
