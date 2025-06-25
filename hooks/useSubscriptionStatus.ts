"use client";

import { useEffect, useState } from "react";
import { getDeviceId } from "@/lib/device";
import { resetSessionCache } from "@/hooks/useSession";
import { hasPaymentMarker } from "@/lib/paymentMarker";

export { hasPaymentMarker };

export const MAX_POLLS = 10;
export const POLL_INTERVAL_MS = 3000;
/**
 * @deprecated The reader and modules list are prerendered and unlock in place
 * (components/ModuleSections.tsx), so a confirmed payment no longer refreshes
 * or reloads the route. Kept exported for existing importers.
 */
export const MAX_REFRESHES = 2;
/** @deprecated See MAX_REFRESHES. */
export const REFRESH_RETRY_MS = 4000;

/** What unlocks this subject for the reader, and until when (ISO date). */
export interface PlanInfo {
  /** year pass, single-subject plan, or a class-rep block sale. */
  scope: "year" | "subject" | "class";
  /** current_period_end; null only under the UNLOCK_ALL dev flag. */
  until: string | null;
}

export interface SubscriptionStatus {
  /** null while the first check is in flight. */
  subscribed: boolean | null;
  /** True while the post-payment poll is running. */
  polling: boolean;
  /**
   * True once a payment that landed during this visit is confirmed — by the
   * poll, or by the first check when the webhook beat the redirect back.
   */
  unlocked: boolean;
  /** True when the poll ran out of attempts without seeing the payment land. */
  pollTimedOut: boolean;
  /** The grant behind `subscribed: true`; null otherwise. */
  plan?: PlanInfo | null;
}

const INITIAL: SubscriptionStatus = {
  subscribed: null,
  polling: false,
  unlocked: false,
  pollTimedOut: false,
  plan: null,
};

interface Entry {
  status: SubscriptionStatus;
  listeners: Set<(status: SubscriptionStatus) => void>;
  started: boolean;
  timer: ReturnType<typeof setInterval> | null;
  polls: number;
  yearId: string;
  subjectId: string;
}

// One entry per (year, subject). A module page renders the paid-status bar,
// the teaser, a locked strip per gated reviewer, and the section list; they
// all share one /api/subscription-status request.
const entries = new Map<string, Entry>();

function keyFor(yearId: string, subjectId: string): string {
  return `${yearId}|${subjectId}`;
}

function ensureEntry(key: string, yearId: string, subjectId: string): Entry {
  let entry = entries.get(key);
  if (!entry) {
    entry = {
      status: INITIAL,
      listeners: new Set(),
      started: false,
      timer: null,
      polls: 0,
      yearId,
      subjectId,
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

// Drop ?payment=success in place once the unlock is confirmed: no reload, no
// navigation, every other param (e.g. ?print=1) kept. A refresh or a shared
// link afterwards must not replay the payment flow.
function stripPaymentMarker() {
  if (!hasPaymentMarker()) return;
  const url = new URL(window.location.href);
  url.searchParams.delete("payment");
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

interface StatusReply {
  subscribed: boolean;
  plan: PlanInfo | null;
}

async function fetchStatus(yearId: string, subjectId: string): Promise<StatusReply> {
  // Mint the signed device cookie if needed; the server reads identity from
  // that cookie, not from a client-supplied header.
  getDeviceId();
  const params = new URLSearchParams({ yearId, subjectId });
  // no-store: a cached "not subscribed" from before checkout must never win.
  const res = await fetch(`/api/subscription-status?${params.toString()}`, {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!res.ok) return { subscribed: false, plan: null };
  const data = (await res.json()) as { subscribed?: boolean; plan?: PlanInfo | null };
  const subscribed = data.subscribed === true;
  return { subscribed, plan: subscribed ? (data.plan ?? null) : null };
}

function confirmPayment(entry: Entry, plan: PlanInfo | null) {
  stopPolling(entry);
  publish(entry, { subscribed: true, plan, polling: false, unlocked: true, pollTimedOut: false });
  stripPaymentMarker();
}

function startPolling(entry: Entry) {
  if (entry.timer !== null) return;
  entry.polls = 0;
  publish(entry, { polling: true, pollTimedOut: false });

  const timer = setInterval(async () => {
    entry.polls += 1;
    try {
      const reply = await fetchStatus(entry.yearId, entry.subjectId);
      if (entry.timer !== timer) return; // stopped while in flight
      if (reply.subscribed) {
        confirmPayment(entry, reply.plan);
        return;
      }
    } catch {
      // swallow — keep polling
    }
    if (entry.timer === timer && entry.polls >= MAX_POLLS) {
      stopPolling(entry);
      publish(entry, { polling: false, pollTimedOut: true });
    }
  }, POLL_INTERVAL_MS);
  entry.timer = timer;
}

async function start(key: string, entry: Entry) {
  if (entry.started) return;
  entry.started = true;

  const returning = hasPaymentMarker();
  // Back from checkout: whatever /api/me said before the payment is stale.
  if (returning) resetSessionCache();

  let reply: StatusReply = { subscribed: false, plan: null };
  try {
    reply = await fetchStatus(entry.yearId, entry.subjectId);
  } catch {
    // ignore; treat as locked and let the gate render normally
  }

  // The last consumer can unmount while that request is in flight — React 18
  // StrictMode's dev double-mount does it on every render. Its cleanup already
  // dropped this entry from the map, so publishing here reaches nobody and
  // starting a poll below would install an interval no cleanup can ever clear.
  if (entries.get(key) !== entry) return;

  if (reply.subscribed) {
    // The webhook beat the redirect back: confirm straight away.
    if (returning) confirmPayment(entry, reply.plan);
    else publish(entry, { subscribed: true, plan: reply.plan });
    return;
  }

  publish(entry, { subscribed: false, plan: null });

  // PayMongo redirects back with ?payment=success while the webhook that
  // records the purchase may still be in flight — poll until it lands.
  if (returning) startPolling(entry);
}

/**
 * Check again after the post-payment poll gave up ("this can take a minute"):
 * restarts the poll for every consumer of (yearId, subjectId).
 */
export function retrySubscriptionCheck(yearId: string, subjectId: string): void {
  const entry = entries.get(keyFor(yearId, subjectId));
  if (!entry || entry.status.subscribed === true) return;
  stopPolling(entry);
  startPolling(entry);
}

/** Forget every cached answer and stop every poll (tests, sign-in/out). */
export function resetSubscriptionStatusCache(): void {
  for (const entry of entries.values()) stopPolling(entry);
  entries.clear();
}

// Shared /api/subscription-status state for one (year, subject), including the
// post-payment poll. Every consumer on a page sees the same answer from a
// single request. The reader pages are prerendered, so a confirmed payment
// flips them in place: consumers re-render from this status and
// ModuleSections fetches the paid bodies — no refresh, no reload.
export function useSubscriptionStatus(yearId: string, subjectId: string): SubscriptionStatus {
  const key = keyFor(yearId, subjectId);
  const [status, setStatus] = useState<SubscriptionStatus>(
    () => entries.get(key)?.status ?? INITIAL
  );

  useEffect(() => {
    const entry = ensureEntry(key, yearId, subjectId);
    // Sync with the shared module-level store on (re)subscribe: another
    // instance may have updated it since this one's initial state was read.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus(entry.status);
    entry.listeners.add(setStatus);
    if (!entry.started) {
      void start(key, entry);
    } else if (
      hasPaymentMarker() &&
      entry.status.subscribed === false &&
      entry.timer === null &&
      !entry.status.pollTimedOut
    ) {
      // An answer cached before checkout is stale on the way back.
      startPolling(entry);
    }

    return () => {
      entry.listeners.delete(setStatus);
      if (entry.listeners.size === 0) {
        stopPolling(entry);
        entries.delete(key);
      }
    };
  }, [key, yearId, subjectId]);

  return status;
}

/** The reader's unlocked subjects in one year (subject list "Unlocked" tags). */
export interface YearEntitlements {
  /** False until /api/subscription-status?list=subjects answers. */
  ready: boolean;
  /** Set when a year pass (or all-subjects class) covers every subject. */
  year: PlanInfo | null;
  subjects: Record<string, PlanInfo>;
}

const EMPTY_YEAR: YearEntitlements = { ready: false, year: null, subjects: {} };
const yearRequests = new Map<string, Promise<YearEntitlements>>();

type YearReply = { subscribed?: boolean; plan?: PlanInfo | null; subjects?: Record<string, PlanInfo> };

function loadYear(yearId: string): Promise<YearEntitlements> {
  let promise = yearRequests.get(yearId);
  if (!promise) {
    getDeviceId();
    const params = new URLSearchParams({ yearId, list: "subjects" });
    promise = fetch(`/api/subscription-status?${params.toString()}`, {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then((res): Promise<YearReply> | YearReply => (res.ok ? (res.json() as Promise<YearReply>) : {}))
      .catch((): YearReply => ({}))
      .then((data: YearReply) => ({
        ready: true,
        year: data.subscribed === true ? (data.plan ?? null) : null,
        subjects: data.subjects && typeof data.subjects === "object" ? data.subjects : {},
      }));
    yearRequests.set(yearId, promise);
  }
  return promise;
}

/** Test hook: forget cached year answers. */
export function resetYearEntitlementsCache(): void {
  yearRequests.clear();
}

/**
 * Every subject in `yearId` this reader can open. One request per year per
 * page load, shared by every subject row; the answer is dropped when the last
 * row unmounts so a later visit asks again.
 */
export function useYearEntitlements(yearId: string): YearEntitlements {
  const [state, setState] = useState<YearEntitlements>(EMPTY_YEAR);
  useEffect(() => {
    let cancelled = false;
    yearConsumers.set(yearId, (yearConsumers.get(yearId) ?? 0) + 1);
    void loadYear(yearId).then((s) => {
      if (!cancelled) setState(s);
    });
    return () => {
      cancelled = true;
      const left = (yearConsumers.get(yearId) ?? 1) - 1;
      if (left <= 0) {
        yearConsumers.delete(yearId);
        yearRequests.delete(yearId);
      } else {
        yearConsumers.set(yearId, left);
      }
    };
  }, [yearId]);
  return state;
}

const yearConsumers = new Map<string, number>();

/** The grant that unlocks `subjectId` in a useYearEntitlements answer, if any. */
export function planForSubject(ents: YearEntitlements, subjectId: string): PlanInfo | null {
  return ents.subjects[subjectId] ?? ents.year;
}
