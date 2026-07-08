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

// Keep labels below in sync with PLANS in lib/paymongo.ts (₱49 / ₱99 / ₱299).
type GatePlan = "subject_month" | "subject_sem" | "year_sem";

export function SubscribeGate({ yearId, subjectId, yearLabel, subjectTitle }: Props) {
  const [loading, setLoading] = useState<GatePlan | null>(null);
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

  async function handleSubscribe(plan: GatePlan) {
    const deviceId = getDeviceId();
    if (!deviceId) return;

    logEvent("subscribe_click", { year_id: yearId, subject_id: subjectId });
    setLoading(plan);
    setError(null);

    try {
      const returnPath =
        typeof window !== "undefined" ? window.location.pathname : undefined;
      const body =
        plan === "year_sem"
          ? { yearId, deviceId, returnPath, plan }
          : { yearId, subjectId, deviceId, returnPath, plan };

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
          Refresh the page to continue.
        </p>
      </div>
    );
  }

  // ── render: gate (with optional polling overlay) ──────────────────────────

  return (
    <div className="border border-ink-faint/30 p-6 mt-4">
      <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mb-2">
        Reviewer — locked
      </p>
      <p className="font-sans text-base text-ink-muted mb-6">
        Reviewers with answer keys — drills, code labs, and full solutions.
        Unlock them below.
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
          {/* ₱49 — subject, 1 month */}
          <div className="flex-1 border border-ink-faint/30 p-5 flex flex-col gap-4">
            <div>
              <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mb-1">
                1 Month
              </p>
              <p className="font-sans text-sm text-ink-muted">
                {subjectTitle ?? "This subject"} only
              </p>
            </div>
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="font-serif text-3xl text-ink">₱49</span>
              <span className="font-sans text-sm text-ink-muted">/ month</span>
            </div>
            <button
              onClick={() => handleSubscribe("subject_month")}
              disabled={loading !== null}
              className="bg-accent text-paper font-sans text-sm px-4 py-3 hover:bg-ink transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "subject_month" ? "Redirecting…" : "Unlock — ₱49"}
            </button>
          </div>

          {/* ₱99 — subject, whole semester (anchor) */}
          <div className="flex-1 border border-accent/60 p-5 flex flex-col gap-4">
            <div>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
                  Whole Semester
                </p>
                <span className="font-mono text-label-sm uppercase tracking-[0.1em] text-accent shrink-0">
                  ★ Most Popular
                </span>
              </div>
              <p className="font-sans text-sm text-ink-muted">
                {subjectTitle ?? "This subject"} until Dec 31 — covers prelims,
                midterms, and finals
              </p>
            </div>
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="font-serif text-3xl text-ink">₱99</span>
              <span className="font-sans text-sm text-ink-muted">/ semester</span>
            </div>
            <button
              onClick={() => handleSubscribe("subject_sem")}
              disabled={loading !== null}
              className="bg-accent text-paper font-sans text-sm px-4 py-3 hover:bg-ink transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "subject_sem" ? "Redirecting…" : "Unlock — ₱99"}
            </button>
          </div>

          {/* ₱299 — all subjects, whole semester */}
          <div className="flex-1 border border-ink/60 p-5 flex flex-col gap-4">
            <div>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
                  Everything
                </p>
                <span className="font-mono text-label-sm uppercase tracking-[0.1em] text-accent shrink-0">
                  Best Value
                </span>
              </div>
              <p className="font-sans text-sm text-ink-muted">
                All subjects in {yearLabel ?? "this year"} until Dec 31
              </p>
            </div>
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="font-serif text-3xl text-ink">₱299</span>
              <span className="font-sans text-sm text-ink-muted">/ semester</span>
            </div>
            <button
              onClick={() => handleSubscribe("year_sem")}
              disabled={loading !== null}
              className="bg-ink text-paper font-sans text-sm px-4 py-3 hover:bg-accent transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "year_sem" ? "Redirecting…" : "Unlock everything — ₱299"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <p className="font-sans text-xs text-ink-faint">
          One-time payment via GCash, Maya, or card. No auto-renew — access simply
          ends with the semester. Instant unlock after payment.
        </p>
      </div>
    </div>
  );
}
