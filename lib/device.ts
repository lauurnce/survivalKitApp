"use client";

const DEVICE_STORAGE_KEY = "bsit_device_id";

let cookieSynced = false;

// Ask the server to set an HttpOnly, signed device cookie. We can't sign it
// client-side (the secret is server-only) and a plain JS cookie would be
// forgeable, so the server mints the trusted value from our UUID.
function syncDeviceCookie(id: string): void {
  if (cookieSynced) return;
  cookieSynced = true;
  void fetch("/api/device", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId: id }),
    keepalive: true,
  }).catch(() => {
    cookieSynced = false; // allow a retry on the next call
  });
}

export function getDeviceId(): string {
  try {
    if (typeof window === "undefined") return "";
    if (typeof localStorage === "undefined") return "";
    let id = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_STORAGE_KEY, id);
    }
    syncDeviceCookie(id);
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
