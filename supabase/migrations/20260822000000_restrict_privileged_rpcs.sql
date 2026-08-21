-- SECURITY DEFINER functions receive EXECUTE from PUBLIC by default. Revoke
-- that implicit grant so these administrative and rate-limit helpers remain
-- callable only through the server's service-role client.

alter function public.admin_top_sections(integer) set search_path = public;
alter function public.admin_active_subscribers() set search_path = public;
alter function public.admin_waitlist_agg() set search_path = public;

revoke execute on function public.admin_top_sections(integer)
  from public, anon, authenticated;
revoke execute on function public.admin_active_subscribers()
  from public, anon, authenticated;
revoke execute on function public.admin_waitlist_agg()
  from public, anon, authenticated;
revoke execute on function public.check_rate_limit(text, integer, integer)
  from public, anon, authenticated;
revoke execute on function public.cleanup_expired_rate_limits()
  from public, anon, authenticated;

grant execute on function public.admin_top_sections(integer) to service_role;
grant execute on function public.admin_active_subscribers() to service_role;
grant execute on function public.admin_waitlist_agg() to service_role;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;
grant execute on function public.cleanup_expired_rate_limits() to service_role;
