"use client";

import type { EventType } from "./supabase/types";
import { getDeviceId } from "./device";

const pendingSectionViews = new Map<string, ReturnType<typeof setTimeout>>();

// Traffic attribution, captured only on "enter" (first pageview of a visit):
// where the visitor came from (document.referrer) and any utm_* tags on the URL.
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
