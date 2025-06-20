-- Allow the module reader's lesson-engagement events (components/lesson/**):
--   lesson_halfway       reader scrolled past 50% of the lesson body
--   lesson_end           reader reached the end of the lesson body
--   next_lesson_click    "Next lesson" tapped (sticky bar or end-of-lesson link)
--   lesson_resume        "Pick up where you left off" tapped
--   quick_check_correct  first answer to an inline quick check was right
--   quick_check_wrong    first answer to an inline quick check was wrong
--   lesson_share         "Send to your groupmates" tapped
--   code_run             a Code Lab / Try It playground was run (wired later,
--                        from components/ide/**)
--
-- `section_view` fires on mount for every content section (SectionRenderer),
-- so it carries no depth signal; lesson_halfway / lesson_end are the first
-- events that say how far a reader actually got.
--
-- Must stay in lockstep with VALID_EVENT_TYPES in app/api/events/route.ts —
-- the constraint silently rejects unknown types (see 20260706150000 for the
-- history). The list is 20261101000300's plus the eight new types.
-- Idempotent: drop if exists, then add.
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
    'code_run'
  ])
);
