-- Generic fixed-window rate limiting shared across all serverless instances.
-- Modeled on the live login_attempts pattern (record_login_attempt), but
-- keyed by an arbitrary namespaced string ("feedback:ip:1.2.3.4") so every
-- public route can share one table + RPC instead of per-instance memory Maps.
-- Idempotent: safe to run against live DB or fresh one.

create table if not exists api_rate_limits (
  key      text primary key,
  count    integer not null,
  reset_at timestamptz not null
);

-- Service-role / SECURITY DEFINER access only; no client policies.
alter table api_rate_limits enable row level security;

create or replace function check_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_now   timestamptz := now();
  v_reset timestamptz := now() + make_interval(secs => p_window_seconds);
  v_count integer;
begin
  insert into public.api_rate_limits as r (key, count, reset_at)
  values (p_key, 1, v_reset)
  on conflict (key) do update
    set count    = case when r.reset_at < v_now then 1 else r.count + 1 end,
        reset_at = case when r.reset_at < v_now then v_reset else r.reset_at end
  returning count into v_count;

  return v_count > p_max;  -- true => over the limit, reject
end;
$$;

revoke execute on function check_rate_limit(text, integer, integer)
  from anon, authenticated;

-- Housekeeping: callable from an admin task or cron to drop expired windows.
create or replace function cleanup_expired_rate_limits() returns integer
language sql
security definer
set search_path to 'public'
as $$
  with deleted as (
    delete from api_rate_limits where reset_at < now() returning 1
  )
  select count(*)::integer from deleted;
$$;

revoke execute on function cleanup_expired_rate_limits()
  from anon, authenticated;
