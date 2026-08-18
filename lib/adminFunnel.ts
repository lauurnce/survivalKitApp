/**
 * The admin dashboard's funnel step list.
 *
 * Extracted from app/admin/page.tsx so it can be tested. The bug that forced
 * this: `unlock_click` and `unlock_submitted` sat in this list long after the
 * subscription pivot, emitted by no code, rendering two counts that could never
 * increment. They remain in the DB enum, the events API allowlist, and
 * lib/supabase/types.ts — removing them from those is a separate, riskier change
 * — but nothing may display them as live steps.
 *
 * The colocated test scans app/, components/, AND lib/ and asserts every type
 * here is actually emitted, so this cannot rot the same way twice. lib/ is
 * required, not incidental: section_view is emitted through the debounced
 * logSectionView wrapper in lib/analytics.ts, not a direct logEvent(...) call
 * at the component call site — narrowing the scan back to app/+components/
 * would silently un-guard that step.
 */

import type { EventType } from "./supabase/types";

export interface AdminFunnelStep {
  type: EventType;
  label: string;
  hint: string;
}

/**
 * Pre-pivot event types. Present in the schema and the API allowlist, emitted
 * by nothing since the subscription pivot replaced the one-time unlock.
 *
 * `unlock_click` was on this list and has been REMOVED: the paywall rework
 * revived it. components/SectionRenderer.tsx and components/LockedReviewer.tsx
 * both call logEvent("unlock_click") to send readers to /unlock. It is a live
 * event type again and listing it here would make the guard test assert
 * something false.
 *
 * It is charted again as "Reached Unlock", sitting between the paywall teaser
 * and checkout. The /unlock page is where a price is first quoted, so a device
 * that taps the teaser but never reaches unlock is a different loss from one
 * that reaches it and does not check out.
 *
 * `unlock_submitted` remains genuinely dead: nothing emits it, and the only
 * references are the API allowlist, the type union, and negative assertions.
 */
export const DEAD_EVENT_TYPES: readonly string[] = [
  "unlock_submitted",
] as const;

export const ADMIN_FUNNEL_STEPS: readonly AdminFunnelStep[] = [
  { type: "enter",                label: "Opened App",       hint: "Unique devices that launched the app" },
  { type: "year_select",          label: "Selected Year",    hint: "Completed first onboarding step" },
  { type: "subject_open",         label: "Opened Subject",   hint: "Navigated to a subject" },
  { type: "module_open",          label: "Opened Module",    hint: "Went into a module" },
  { type: "section_view",         label: "Read a Section",   hint: "Scrolled and read content" },
  { type: "paywall_teaser_view",  label: "Saw Paywall",      hint: "The subscribe teaser rendered" },
  { type: "paywall_teaser_click", label: "Tapped Paywall",   hint: "Showed payment intent" },
  { type: "unlock_click",         label: "Reached Unlock",   hint: "Opened the page that quotes a price" },
  { type: "subscribe_click",      label: "Started Checkout", hint: "Left for the PayMongo link" },
] as const;
