-- supabase/migrations/20260821020000_admin_profiles_agg_school_type.sql
-- Adds two things to admin_profiles_agg(), both forced by signup now creating
-- profile rows (20260821010000_profiles_school_type.sql):
--
-- 'named'          — rows where the student has actually filled in the profile
--                    form. `total` used to mean the same thing, because the
--                    only way a row existed was a completed form. It no longer
--                    does: a signup row has a school and no name. Reporting
--                    `total` as "profiles completed" would inflate the number
--                    the moment this ships, so the dashboard needs both.
-- 'by_school_type' — public vs private, the answer signup now collects.
--                    Rows written before that column existed group under
--                    'Not specified' rather than being dropped or guessed at.
--
-- Everything else is carried over unchanged from
-- 20260706000001_admin_profiles_agg.sql. Service-role only, like the other
-- admin_* RPCs.
create or replace function admin_profiles_agg()
returns json
language sql security definer
set search_path = public
as $$
  select json_build_object(
    'total', (select count(*) from profiles),
    'named', (select count(*) from profiles where first_name is not null),
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
    'by_school_type', (
      select json_agg(row_to_json(t))
      from (
        select coalesce(school_type, 'Not specified') as school_type, count(*)::int as count
        from profiles
        group by coalesce(school_type, 'Not specified')
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
