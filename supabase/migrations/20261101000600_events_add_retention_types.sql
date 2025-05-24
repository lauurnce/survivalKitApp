-- Allow the discovery/retention events (components/retention/**):
--   recent_lesson_click   "Pick up where you left off" on /, /year or a year's
--                         subject list was tapped (device-local history)
--   install_prompt_shown  the "Add to home screen" suggestion was shown
--   pwa_installed         the browser reported the app installed (appinstalled)
--
-- Home-screen LAUNCHES need no event: the manifest's start_url carries
-- utm_source=pwa&utm_medium=homescreen, which `enter` already records.
--
-- Must stay in lockstep with VALID_EVENT_TYPES in app/api/events/route.ts —
-- the constraint silently rejects unknown types (see 20260706150000 for the
-- history). The list is 20261101000500's (lesson engagement, already
-- applied) plus the three new types. Idempotent: drop if exists, then add.
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
    'pwa_installed'
  ])
);
