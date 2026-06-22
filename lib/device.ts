"use client";

export function getDeviceId(): string {
  try {
    if (typeof window === "undefined") return "";
    if (typeof localStorage === "undefined") return "";
    let id = localStorage.getItem("bsit_device_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("bsit_device_id", id);
    }
    return id;
  } catch {
    return "";
  }
}

export interface ClientDeviceSignals {
  screen_width: number | null;
  max_touch_points: number | null;
}

// Real signals from the browser the server can't reliably infer from the UA
// alone. A wide, non-touch viewport is a desktop regardless of UA quirks.
export function getClientDeviceSignals(): ClientDeviceSignals {
  try {
    if (typeof window === "undefined") {
      return { screen_width: null, max_touch_points: null };
    }
    return {
      screen_width: window.innerWidth || window.screen?.width || null,
      max_touch_points:
        typeof navigator !== "undefined" && typeof navigator.maxTouchPoints === "number"
          ? navigator.maxTouchPoints
          : null,
    };
  } catch {
    return { screen_width: null, max_touch_points: null };
  }
}
