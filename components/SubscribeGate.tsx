"use client";

import { useState, useEffect, useRef } from "react";
import { getDeviceId } from "@/lib/device";
import { logEvent } from "@/lib/analytics";

interface Props {
  yearId: string;
  subjectId: string;
  yearLabel?: string;
  subjectTitle?: string;
}

const MAX_POLLS = 10;
const POLL_INTERVAL_MS = 3000;

export function SubscribeGate({ yearId, subjectId, yearLabel, subjectTitle }: Props) {
  const [loading, setLoading] = useState<"subject" | "year" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Subscription-check state
  const [subscribed, setSubscribed] = useState<boolean | null>(null); // null = unknown (checking)
  const [polling, setPolling] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const pollCountRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── helpers ────────────────────────────────────────────────────────────────

  function clearPoll() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  async function checkSubscription(): Promise<boolean> {
    // Mint the signed device cookie if needed; the server reads identity from
    // that cookie, not from a client-supplied header.
    getDeviceId();
    const params = new URLSearchParams({ yearId, subjectId });
    const res = await fetch(`/api/subscription-status?${params.toString()}`);
    if (!res.ok) return false;
    const data = await res.json() as { subscribed?: boolean };
    return data.subscribed === true;
  }

  function startPolling() {
    if (intervalRef.current !== null) return; // already polling
    setPolling(true);
    pollCountRef.current = 0;

    intervalRef.current = setInterval(async () => {
      pollCountRef.current += 1;
      try {
        const isSubscribed = await checkSubscription();
        if (isSubscribed) {
          clearPoll();
          setPolling(false);
          setUnlocked(true);
          setSubscribed(true);
          return;
        }
      } catch {
        // swallow — keep polling
      }
      if (pollCountRef.current >= MAX_POLLS) {
        clearPoll();
        setPolling(false);
        setError("Almost there — your payment is still processing. Refresh this page in a moment to unlock.");
      }
    }, POLL_INTERVAL_MS);
  }

  // ── on mount: initial status check + ?payment=success detection ──────────

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // 1. Quick initial check (handles already-subscribed users)
      try {
        const isSubscribed = await checkSubscription();
        if (cancelled) return;
        if (isSubscribed) {
          setSubscribed(true);
          return;
        }
      } catch {
        // ignore; show gate normally
      }

      if (cancelled) return;
      setSubscribed(false);

      // 2. If PayMongo redirected back with ?payment=success, start polling
      const params = new URLSearchParams(window.location.search);
      if (params.get("payment") === "success") {
        startPolling();
      }
    }

    void init();

    return () => {
      cancelled = true;
      clearPoll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearId, subjectId]);

  // ── render: hide gate entirely when subscribed (initial check) ───────────

  if (subscribed === true && !unlocked) return null;

  // While the very first check is in flight, render nothing (avoids flash)
  if (subscribed === null) return null;

  // ── subscribe handler ─────────────────────────────────────────────────────

  async function handleSubscribe(plan: "subject" | "year") {
    const deviceId = getDeviceId();
    if (!deviceId) return;

    logEvent("subscribe_click", { year_id: yearId, subject_id: subjectId });
    setLoading(plan);
    setError(null);

    try {
      const returnPath =
        typeof window !== "undefined" ? window.location.pathname : undefined;
      const body =
        plan === "subject"
          ? { yearId, subjectId, deviceId, returnPath }
          : { yearId, deviceId, returnPath };

      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json() as { checkoutUrl?: string; error?: string };

      if (!res.ok || !data.checkoutUrl) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(null);
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(null);
    }
  }

  // ── render: unlocked banner ───────────────────────────────────────────────

  if (unlocked) {
    return (
      <div className="border border-ink-faint/30 p-6 mt-4">
        <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mb-2">
          Access Unlocked
        </p>
        <p className="font-sans text-base text-ink-muted">
          Access unlocked! Refresh the page to continue.
        </p>
      </div>
    );
  }

  // ── render: gate (with optional polling overlay) ──────────────────────────

  return (
    <div className="border border-ink-faint/30 p-6 mt-4">
      <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mb-2">
        Activity — Subscribers Only
      </p>
      <p className="font-sans text-base text-ink-muted mb-6">
        Unlock activities by choosing a plan below.
      </p>

      {/* Polling / payment-pending banner */}
      {polling && (
        <div className="flex items-center gap-3 mb-4 border border-ink-faint/20 p-3">
          {/* Spinner */}
          <svg
            className="animate-spin h-4 w-4 shrink-0 text-accent"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="font-sans text-sm text-ink-muted">
            Payment received — unlocking access…
          </p>
        </div>
      )}

      {error && (
        <p className="font-sans text-sm text-red-500 mb-4">{error}</p>
      )}

      {/* Hide subscribe buttons while polling */}
      {!polling && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Subject plan */}
          <div className="flex-1 border border-ink-faint/30 p-5 flex flex-col gap-4">
            <div>
              <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mb-1">
                Subject Plan
              </p>
              <p className="font-sans text-sm text-ink-muted">
                {subjectTitle ?? "This subject"} only
              </p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl text-ink">₱49</span>
              <span className="font-sans text-sm text-ink-muted">/ month</span>
            </div>
            <button
              onClick={() => handleSubscribe("subject")}
              disabled={loading !== null}
              className="bg-accent text-paper font-sans text-sm px-4 py-3 hover:bg-ink transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "subject" ? "Redirecting…" : "Subscribe — ₱49/month"}
            </button>
          </div>

          {/* Year plan */}
          <div className="flex-1 border border-accent/60 p-5 flex flex-col gap-4 relative">
            <span className="absolute top-3 right-3 font-mono text-label-sm uppercase tracking-[0.1em] text-accent">
              Best Value
            </span>
            <div>
              <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mb-1">
                Year Plan
              </p>
              <p className="font-sans text-sm text-ink-muted">
                All subjects in {yearLabel ?? "this year"}
              </p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl text-ink">₱299</span>
              <span className="font-sans text-sm text-ink-muted">/ month</span>
            </div>
            <button
              onClick={() => handleSubscribe("year")}
              disabled={loading !== null}
              className="bg-ink text-paper font-sans text-sm px-4 py-3 hover:bg-accent transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "year" ? "Redirecting…" : "Subscribe — ₱299/month"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <p className="font-sans text-xs text-ink-faint">
          Paid via GCash, Maya, or card. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
