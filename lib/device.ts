"use client";

import { DEVICE_SYNCED_COOKIE } from "./deviceSync";

const DEVICE_STORAGE_KEY = "bsit_device_id";
// Per-tab-session flag: once this browser session has registered the id, no
// further page load in it POSTs again, even if the marker cookie is blocked.
const SESSION_SYNCED_KEY = "bsit_device_synced";
// A failed sync (429 from a shared campus NAT, a 5xx, a dropped connection)
// is retried once, later in the page session, with jitter so a classroom
// that tripped the limiter together doesn't retry together.
const RETRY_BASE_MS = 30_000;
const RETRY_JITTER_MS = 30_000;

let cookieSynced = false;
let retryScheduled = false;

function hasSyncedMarker(id: string): boolean {
  try {
    if (sessionStorage.getItem(SESSION_SYNCED_KEY) === id) return true;
  } catch {
    // sessionStorage can throw in private browsing; fall through to the cookie.
  }
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((c) => c.trim() === `${DEVICE_SYNCED_COOKIE}=${id}`);
}

function markSynced(id: string): void {
  try {
    sessionStorage.setItem(SESSION_SYNCED_KEY, id);
  } catch {
    // Best effort: the server's marker cookie covers later sessions.
  }
}

function scheduleRetry(id: string): void {
  if (retryScheduled) return;
  retryScheduled = true;
  setTimeout(() => {
    cookieSynced = false;
    syncDeviceCookie(id);
  }, RETRY_BASE_MS + Math.floor(Math.random() * RETRY_JITTER_MS));
}

// Ask the server to set an HttpOnly, signed device cookie. We can't sign it
// client-side (the secret is server-only) and a plain JS cookie would be
// forgeable, so the server mints the trusted value from our UUID.
//
// Registers once per browser, not once per page load: the server's readable
// marker cookie (and a sessionStorage flag) says the signed cookie is already
// set, so the POST is skipped entirely.
function syncDeviceCookie(id: string): void {
  if (cookieSynced) return;
  cookieSynced = true;
  if (hasSyncedMarker(id)) return;
  void fetch("/api/device", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId: id }),
    keepalive: true,
  })
    .then((res) => {
      if (res.ok) markSynced(id);
      else scheduleRetry(id);
    })
    .catch(() => scheduleRetry(id));
}

/** Test-only: reset the module-level sync state between cases. */
export function __resetDeviceSyncForTests(): void {
  cookieSynced = false;
  retryScheduled = false;
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
