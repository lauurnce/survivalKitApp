"use client";

import type { EventType } from "./supabase/types";
import { getDeviceId } from "./device";
import { normalizeSearchQuery } from "./analyticsSearch";

const pendingSectionViews = new Map<string, ReturnType<typeof setTimeout>>();

// Traffic attribution, captured only on "enter" (first pageview of a visit):
// where the visitor came from (document.referrer) and the five standard utm_*
// tags on the URL (utm_content / utm_term columns: migration 20261101000100).
export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

function getAttribution(): Record<string, string> {
  const attribution: Record<string, string> = {};
  if (document.referrer) attribution.referrer = document.referrer;
  const params = new URLSearchParams(window.location.search);
  for (const key of UTM_KEYS) {
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

// When storage is blocked (some in-app browsers, strict privacy modes)
// getDeviceId() has nowhere to keep an id and returns "". Those visitors
// still read, so they still count: they get an id for this page load, and the
// server prefers their signed device cookie whenever they have one.
let pageLoadDeviceId = "";

function randomUuid(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function resolveDeviceId(): string {
  const id = getDeviceId();
  if (id) return id;
  try {
    if (!pageLoadDeviceId) pageLoadDeviceId = randomUuid();
  } catch {
    return "";
  }
  return pageLoadDeviceId;
}

/**
 * Resolves once the page is actually being viewed. A page Chrome prerenders
 * from speculation rules runs its effects while nobody is looking; a reader
 * who never opens it must not count. (The server also refuses to count
 * requests tagged `Sec-Purpose: prefetch;prerender`.)
 */
function whenViewed(): Promise<void> {
  const doc = typeof document === "undefined" ? undefined : (document as Document & { prerendering?: boolean });
  if (!doc?.prerendering) return Promise.resolve();
  return new Promise((resolve) => {
    doc.addEventListener("prerenderingchange", () => resolve(), { once: true });
  });
}

/** Test hook: forget the page-load fallback device id. */
export function resetPageLoadDeviceId() {
  pageLoadDeviceId = "";
}

export interface EventMeta {
  year_id?: string;
  subject_id?: string;
  module_id?: string;
  section_id?: string;
  // Search events only (lib/analyticsSearch.ts). The query is normalized
  // here as well as on the server, so the raw typed text never leaves the
  // browser.
  search_query?: string;
  result_count?: number;
  result_rank?: number;
}

export async function logEvent(event_type: EventType, meta: EventMeta = {}) {
  await whenViewed();
  const device_id = resolveDeviceId();
  if (!device_id) return;
  if (event_type === "enter" && !claimSessionEntry()) return;

  const attribution = event_type === "enter" ? getAttribution() : {};

  if (meta.search_query !== undefined) {
    const search_query = normalizeSearchQuery(meta.search_query);
    if (search_query === null) return;
    meta = { ...meta, search_query };
  }

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
