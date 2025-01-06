-- Search usage tracking (/search, components/SearchClient.tsx).
--
-- Three new event types:
--   search_query         a search settled (800 ms after typing stopped, Enter,
--                        or a ?q= link opened) — carries the query and how
--                        many results it returned
--   search_no_results    the settled query returned nothing (also logged as a
--                        search_query with result_count 0)
--   search_result_click  a result was opened — carries the query, the clicked
--                        subject_id or module_id, and its 1-based rank
--
-- Three new nullable columns hold the search detail. Every other event leaves
-- them null. The query is user-typed text, so /api/events stores only the
-- normalized form from lib/analyticsSearch.ts: lowercased, whitespace
-- collapsed, emails and long digit runs redacted, at most 80 characters. The
-- length check below is the database's own backstop for that cap.
--
-- events_event_type_check must stay in lockstep with VALID_EVENT_TYPES in
-- app/api/events/route.ts — the constraint silently rejects unknown types
-- (see 20260706150000 for the history). The list below is production's as
-- read on 2026-10-31 (twenty-six types, through 20261101000600) plus the
-- three search types.
--
-- growth_search_agg feeds the weekly growth report's "Top searches" and
-- "No-result searches" sections: aggregate counts only, top 15 of each.
--
-- Idempotent: add column if not exists, drop-then-add for every constraint,
-- create or replace for the function, and repeatable grants/revokes.

alter table public.events add column if not exists search_query text;
alter table public.events add column if not exists result_count int;
alter table public.events add column if not exists result_rank  int;

alter table public.events drop constraint if exists events_search_query_len_check;
alter table public.events add constraint events_search_query_len_check
  check (search_query is null or char_length(search_query) between 1 and 80);

alter table public.events drop constraint if exists events_result_count_check;
alter table public.events add constraint events_result_count_check
  check (result_count is null or result_count >= 0);

alter table public.events drop constraint if exists events_result_rank_check;
alter table public.events add constraint events_result_rank_check
  check (result_rank is null or result_rank >= 1);

alter table public.events drop constraint if exists events_event_type_check;
alter table public.events add constraint events_event_type_check check (
  event_type = any (array[
    'enter',
    'year_select',
    'subject_open',
    'module_open',
    'section_view',
    'subscribe_click',
    'paywall_teaser_view',
    'paywall_teaser_click',
    'unlock_click',
    'unlock_submitted',
    'share_card_open',
    'share_card_share',
    'share_card_download',
    'print_click',
    'print_gate_shown',
    'lesson_halfway',
    'lesson_end',
    'next_lesson_click',
    'lesson_resume',
    'quick_check_correct',
    'quick_check_wrong',
    'lesson_share',
    'code_run',
    'recent_lesson_click',
    'install_prompt_shown',
    'pwa_installed',
    'search_query',
    'search_no_results',
    'search_result_click'
  ])
);

-- Capped distributions follow the 2026-08-10 ruling: { rows, total_groups },
-- so the report can say "top 15 of 40" rather than imply completeness.
create or replace function growth_search_agg(
  p_since timestamptz,
  p_until timestamptz
)
returns json
language sql
stable
security definer
set search_path = public
as $$
  with window_events as (
    select event_type, device_id, search_query
    from events
    where event_type in ('search_query', 'search_no_results', 'search_result_click')
      and created_at >= p_since
      and created_at <  p_until
  ),
  searches as (
    select device_id, search_query from window_events
    where event_type = 'search_query' and search_query is not null
  ),
  misses as (
    select device_id, search_query from window_events
    where event_type = 'search_no_results' and search_query is not null
  ),
  top_q as (
    select search_query as query, count(*)::int as searches,
           count(distinct device_id)::int as devices
    from searches
    group by search_query
  ),
  miss_q as (
    select search_query as query, count(*)::int as searches,
           count(distinct device_id)::int as devices
    from misses
    group by search_query
  )
  select json_build_object(
    'searches',           (select count(*)::int from searches),
    'devices',            (select count(distinct device_id)::int from searches),
    'no_result_searches', (select count(*)::int from misses),
    'result_clicks',      (select count(*)::int from window_events
                             where event_type = 'search_result_click'),
    'top_queries', json_build_object(
      'rows', (
        select json_agg(row_to_json(t))
        from (select query, searches, devices from top_q
              order by searches desc, query limit 15) t
      ),
      'total_groups', (select count(*)::int from top_q)
    ),
    'no_result_queries', json_build_object(
      'rows', (
        select json_agg(row_to_json(t))
        from (select query, searches, devices from miss_q
              order by searches desc, query limit 15) t
      ),
      'total_groups', (select count(*)::int from miss_q)
    )
  );
$$;

revoke execute on function growth_search_agg(timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function growth_search_agg(timestamptz, timestamptz) to service_role;
