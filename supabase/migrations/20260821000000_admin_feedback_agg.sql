-- admin_feedback_agg: total feedback response count, average app and module
-- ratings, and the 3 most recent non-empty comments — for the admin
-- dashboard summary tile that links through to /admin/feedback.
-- Aggregated entirely in Postgres so the counts are never subject to
-- PostgREST's 1000-row default cap (the /api/admin/feedback stats query
-- has that gap; this RPC avoids repeating it). Deliberately excludes
-- device_id, user_id and coupon_code — the dashboard summary must not
-- render anything identifying. Service-role only, like the other
-- admin_* RPCs.
create or replace function admin_feedback_agg()
returns json
language sql security definer
set search_path = public
as $$
  select json_build_object(
    'total', (select count(*) from user_feedback),
    'avg_app_rating', (select round(avg(app_rating)::numeric, 2) from user_feedback),
    'avg_module_rating', (select round(avg(module_rating)::numeric, 2) from user_feedback),
    'recent_comments', (
      select json_agg(row_to_json(t))
      from (
        select feedback_text, created_at
        from user_feedback
        where feedback_text is not null and length(trim(feedback_text)) > 0
        order by created_at desc
        limit 3
      ) t
    )
  );
$$;

revoke execute on function admin_feedback_agg() from public, anon, authenticated;
grant execute on function admin_feedback_agg() to service_role;
