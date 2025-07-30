-- Allow the module reader's signed-out print prompt event, `print_gate_shown`
-- (components/PrintButton.tsx). Must stay in lockstep with VALID_EVENT_TYPES
-- in app/api/events/route.ts — the constraint silently rejects unknown types
-- (see 20260706150000 for the history). The list is 20261031000000's plus
-- the one new type. Idempotent: drop if exists, then add.
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
    'print_gate_shown'
  ])
);
