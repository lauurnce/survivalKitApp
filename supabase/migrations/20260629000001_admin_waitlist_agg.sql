-- admin_waitlist_agg: returns total signup count plus pre-grouped breakdowns
-- so the admin dashboard charts are always based on all rows, not a 500-row cap.
create or replace function admin_waitlist_agg()
returns json
language sql security definer as $$
  select json_build_object(
    'total', (select count(*) from waitlist),
    'by_year', (
      select json_agg(row_to_json(t))
      from (
        select
          coalesce(year_label, 'Unknown') as year_label,
          count(*)::int as count
        from waitlist
        group by year_label
        order by count desc
      ) t
    ),
    'by_subject', (
      select json_agg(row_to_json(t))
      from (
        select
          subject_title,
          coalesce(year_label, '') as year_label,
          count(*)::int as count
        from waitlist
        where subject_title is not null
        group by subject_title, year_label
        order by count desc
      ) t
    )
  );
$$;

grant execute on function admin_waitlist_agg() to service_role;
