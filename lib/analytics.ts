"use client";

import type { EventType } from "./supabase/types";
import { getDeviceId } from "./device";

const pendingSectionViews = new Map<string, ReturnType<typeof setTimeout>>();

// Traffic attribution, captured only on "enter" (first pageview of a visit):
// where the visitor came from (document.referrer) and any utm_* tags on the URL.
// utm_content and utm_term are not captured: the events table has no columns
// for them yet (adding them needs a migration).
function getAttribution(): Record<string, string> {
  const attribution: Record<string, string> = {};
  if (document.referrer) attribution.referrer = document.referrer;
  const params = new URLSearchParams(window.location.search);
  for (const key of ["utm_source", "utm_medium", "utm_campaign"] as const) {
    const value = params.get(key);
    if (value) attribution[key] = value;
  }
  return attribution;
}

// `enter` means "first pageview of a visit", and is what the growth
// acquisition report counts and reads attribution from. It used to fire only
// from / and /account, on every visit to them — so a UTM-tagged link to a
// module page, /unlock or a class join link recorded no attribution at all,
// while bouncing back to / counted extra visits. Now it fires once per browser
// tab session, from whichever page the visit lands on (SessionEntryTracker in
// the root layout), and any other `enter` in the same session is dropped.
const SESSION_ENTRY_KEY = "bsit:session-entered";
let enteredThisLoad = false;

/** Claims the session's single `enter`: true once per tab session. */
function claimSessionEntry(): boolean {
  if (enteredThisLoad) return false;
  enteredThisLoad = true;
  try {
    if (sessionStorage.getItem(SESSION_ENTRY_KEY)) return false;
    sessionStorage.setItem(SESSION_ENTRY_KEY, "1");
  } catch {
    // Storage blocked (private mode, embedded webviews): fall back to one
    // `enter` per page load, which is the in-memory flag above.
  }
  return true;
}

/** Test hook: forget that this session already entered. */
export function resetSessionEntry() {
  enteredThisLoad = false;
  try {
    sessionStorage.removeItem(SESSION_ENTRY_KEY);
  } catch {
    // ignore
  }
}

export async function logEvent(
  event_type: EventType,
  meta: {
    year_id?: string;
    subject_id?: string;
    module_id?: string;
    section_id?: string;
  } = {}
) {
  const device_id = getDeviceId();
  if (!device_id) return;
  if (event_type === "enter" && !claimSessionEntry()) return;

  const attribution = event_type === "enter" ? getAttribution() : {};

  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id, event_type, ...meta, ...attribution }),
    });
  } catch {
    // Silent fail — analytics should never break the app
  }
}

// Debounced section_view: wait 2s of idle before logging
export function logSectionView(sectionId: string, moduleId: string) {
  if (pendingSectionViews.has(sectionId)) {
    clearTimeout(pendingSectionViews.get(sectionId)!);
  }
  const timer = setTimeout(() => {
    void logEvent("section_view", { section_id: sectionId, module_id: moduleId });
    pendingSectionViews.delete(sectionId);
  }, 2000);
  pendingSectionViews.set(sectionId, timer);
}

/** Logs this session's `enter` (with attribution) if it hasn't been logged yet. */
export function logSessionEntry() {
  return logEvent("enter");
}
