"use client";

const DEVICE_COOKIE = "bsit_device_id";
const DEVICE_STORAGE_KEY = "bsit_device_id";

export function getDeviceId(): string {
  try {
    if (typeof window === "undefined") return "";
    if (typeof localStorage === "undefined") return "";
    let id = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_STORAGE_KEY, id);
    }
    // Mirror to a cookie so server components can read it for subscription checks
    document.cookie = `${DEVICE_COOKIE}=${id}; path=/; max-age=31536000; SameSite=Lax`;
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
