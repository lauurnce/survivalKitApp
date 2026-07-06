-- Widen events_event_type_check to match the API route's allowed list.
-- The live constraint only permitted the original 7 types, so every
-- subscribe_click / paywall_teaser_view / paywall_teaser_click insert was
-- silently rejected since launch — the paywall funnel was never recorded.
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
    'unlock_submitted'
  ])
);

-- Traffic attribution, captured only on "enter" events. Values are sanitized
-- and length-capped by the API route before insert.
alter table public.events add column if not exists referrer text;
alter table public.events add column if not exists utm_source text;
alter table public.events add column if not exists utm_medium text;
alter table public.events add column if not exists utm_campaign text;
