"use client";

import type { EventType } from "./supabase/types";
import { getDeviceId } from "./device";

const pendingSectionViews = new Map<string, ReturnType<typeof setTimeout>>();

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

  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id, event_type, ...meta }),
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
    logEvent("section_view", { section_id: sectionId, module_id: moduleId });
    pendingSectionViews.delete(sectionId);
  }, 2000);
  pendingSectionViews.set(sectionId, timer);
}
