-- admin_profiles_agg: total profile count plus pre-grouped breakdowns of
-- preferred pathways and universities, for the admin dashboard (used to
-- decide which future tracks to build). Service-role only, like the other
-- admin_* RPCs.
-- Applied to live 2026-07-06 (migration name: admin_profiles_agg).
create or replace function admin_profiles_agg()
returns json
language sql security definer
set search_path = public
as $$
  select json_build_object(
    'total', (select count(*) from profiles),
    'by_pathway', (
      select json_agg(row_to_json(t))
      from (
        select p.pathway, count(*)::int as count
        from profiles, unnest(pathways) as p(pathway)
        group by p.pathway
        order by count desc
      ) t
    ),
    'by_university', (
      select json_agg(row_to_json(t))
      from (
        select coalesce(university, 'Not specified') as university, count(*)::int as count
        from profiles
        group by coalesce(university, 'Not specified')
        order by count desc
      ) t
    ),
    'by_major', (
      select json_agg(row_to_json(t))
      from (
        select major, count(*)::int as count
        from profiles
        where major is not null
        group by major
        order by count desc
      ) t
    )
  );
$$;

revoke execute on function admin_profiles_agg() from public, anon, authenticated;
grant execute on function admin_profiles_agg() to service_role;
