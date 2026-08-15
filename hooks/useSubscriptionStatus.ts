"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDeviceId } from "@/lib/device";

export const MAX_POLLS = 10;
export const POLL_INTERVAL_MS = 3000;
/** How many router.refresh() attempts a confirmed payment gets. */
export const MAX_REFRESHES = 2;
/** How long to give one refresh before deciding it did not unlock the page. */
export const REFRESH_RETRY_MS = 4000;

export interface SubscriptionStatus {
  /** null while the first check is in flight. */
  subscribed: boolean | null;
  /** True while the post-payment poll is running. */
  polling: boolean;
  /** True once the poll confirmed a payment that landed during this visit. */
  unlocked: boolean;
  /** True when the poll ran out of attempts without seeing the payment land. */
  pollTimedOut: boolean;
}

const INITIAL: SubscriptionStatus = {
  subscribed: null,
  polling: false,
  unlocked: false,
  pollTimedOut: false,
};

interface Entry {
  status: SubscriptionStatus;
  listeners: Set<(status: SubscriptionStatus) => void>;
  started: boolean;
  timer: ReturnType<typeof setInterval> | null;
  polls: number;
  refreshClaimed: boolean;
  refreshes: number;
  refreshTimer: ReturnType<typeof setTimeout> | null;
}

// One entry per (year, subject). A module page renders the teaser plus a locked
// strip for every gated reviewer; before this store each of them ran its own
// /api/subscription-status request on mount.
const entries = new Map<string, Entry>();

function keyFor(yearId: string, subjectId: string): string {
  return `${yearId}|${subjectId}`;
}

function ensureEntry(key: string): Entry {
  let entry = entries.get(key);
  if (!entry) {
    entry = {
      status: INITIAL,
      listeners: new Set(),
      started: false,
      timer: null,
      polls: 0,
      refreshClaimed: false,
      refreshes: 0,
      refreshTimer: null,
    };
    entries.set(key, entry);
  }
  return entry;
}

function publish(entry: Entry, patch: Partial<SubscriptionStatus>) {
  entry.status = { ...entry.status, ...patch };
  for (const listener of entry.listeners) listener(entry.status);
}

function stopPolling(entry: Entry) {
  if (entry.timer !== null) {
    clearInterval(entry.timer);
    entry.timer = null;
  }
}

function stopRefreshing(entry: Entry) {
  if (entry.refreshTimer !== null) {
    clearTimeout(entry.refreshTimer);
    entry.refreshTimer = null;
  }
}

async function fetchStatus(yearId: string, subjectId: string): Promise<boolean> {
  // Mint the signed device cookie if needed; the server reads identity from
  // that cookie, not from a client-supplied header.
  getDeviceId();
  const params = new URLSearchParams({ yearId, subjectId });
  const res = await fetch(`/api/subscription-status?${params.toString()}`);
  if (!res.ok) return false;
  const data = (await res.json()) as { subscribed?: boolean };
  return data.subscribed === true;
}

function startPolling(entry: Entry, yearId: string, subjectId: string) {
  if (entry.timer !== null) return;
  entry.polls = 0;
  publish(entry, { polling: true });

  entry.timer = setInterval(async () => {
    entry.polls += 1;
    try {
      if (await fetchStatus(yearId, subjectId)) {
        stopPolling(entry);
        publish(entry, { subscribed: true, polling: false, unlocked: true });
        return;
      }
    } catch {
      // swallow — keep polling
    }
    if (entry.polls >= MAX_POLLS) {
      stopPolling(entry);
      publish(entry, { polling: false, pollTimedOut: true });
    }
  }, POLL_INTERVAL_MS);
}

async function start(key: string, yearId: string, subjectId: string) {
  const entry = ensureEntry(key);
  if (entry.started) return;
  entry.started = true;

  let subscribed = false;
  try {
    subscribed = await fetchStatus(yearId, subjectId);
  } catch {
    // ignore; treat as locked and let the gate render normally
  }

  // The last consumer can unmount while that request is in flight — React 18
  // StrictMode's dev double-mount does it on every render. Its cleanup already
  // dropped this entry from the map, so publishing here reaches nobody and
  // starting a poll below would install an interval no cleanup can ever clear.
  if (entries.get(key) !== entry) return;

  if (subscribed) {
    publish(entry, { subscribed: true });
    return;
  }

  publish(entry, { subscribed: false });

  // PayMongo redirects back with ?payment=success while the webhook that
  // records the purchase may still be in flight — poll until it lands.
  const params = new URLSearchParams(window.location.search);
  if (params.get("payment") === "success") startPolling(entry, yearId, subjectId);
}

// Reload the document on the same route minus the ?payment=success marker.
// Dropping the marker matters twice: the poll it triggers has already done its
// job, and without it this reload cannot re-arm itself into a loop.
function reloadWithoutPaymentMarker() {
  const url = new URL(window.location.href);
  url.searchParams.delete("payment");
  window.location.replace(url.toString());
}

// A confirmed payment whose refreshed server render still reads locked used to
// be a dead end: the locked strip sat on "Payment received — unlocking access…"
// forever with no retry, no timeout, and no way out. Give the refresh a bounded
// number of tries, then fall back to a full page load — the escape the old
// gate's "Show my reviewers →" button gave the reader by hand.
function scheduleRefreshRetry(entry: Entry, key: string, refresh: () => void) {
  stopRefreshing(entry);
  entry.refreshTimer = setTimeout(() => {
    entry.refreshTimer = null;
    // A refresh that worked unmounts every locked strip on the page, and the
    // last unmount drops this entry. Still here means still locked.
    if (entries.get(key) !== entry) return;

    if (entry.refreshes < MAX_REFRESHES) {
      entry.refreshes += 1;
      refresh();
      scheduleRefreshRetry(entry, key, refresh);
      return;
    }

    // Out of soft refreshes. Stop promising an unlock that is not coming, so a
    // reader whose reload is blocked still sees the actionable message rather
    // than a frozen one, then reload.
    publish(entry, { unlocked: false, pollTimedOut: true });
    reloadWithoutPaymentMarker();
  }, REFRESH_RETRY_MS);
}

// Shared /api/subscription-status state for one (year, subject), including the
// post-payment poll. Every consumer on a page sees the same answer from a
// single request, and the first one to see the poll confirm refreshes the
// route so the server can send down the now-unlocked content.
export function useSubscriptionStatus(yearId: string, subjectId: string): SubscriptionStatus {
  const router = useRouter();
  const key = keyFor(yearId, subjectId);
  const [status, setStatus] = useState<SubscriptionStatus>(
    () => entries.get(key)?.status ?? INITIAL
  );

  useEffect(() => {
    const entry = ensureEntry(key);
    setStatus(entry.status);
    entry.listeners.add(setStatus);
    void start(key, yearId, subjectId);

    return () => {
      entry.listeners.delete(setStatus);
      if (entry.listeners.size === 0) {
        stopPolling(entry);
        stopRefreshing(entry);
        entries.delete(key);
      }
    };
  }, [key, yearId, subjectId]);

  useEffect(() => {
    if (!status.unlocked) return;
    const entry = entries.get(key);
    if (!entry || entry.refreshClaimed) return;
    entry.refreshClaimed = true;
    // The locked bodies never reached this client, so re-render the route on
    // the server rather than trying to swap content in place. Replica lag or a
    // device cookie the webhook did not credit can still hand back a locked
    // render, so watch for that and escalate instead of waiting forever.
    entry.refreshes = 1;
    router.refresh();
    scheduleRefreshRetry(entry, key, () => router.refresh());
  }, [status.unlocked, key, router]);

  return status;
}
