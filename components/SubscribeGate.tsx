"use client";

import { useState } from "react";
import { getDeviceId } from "@/lib/device";
import { logEvent } from "@/lib/analytics";

interface Props {
  yearId: string;
  subjectId: string;
  yearLabel?: string;
  subjectTitle?: string;
  /**
   * Module path PayMongo should return the payer to. The /unlock page validates
   * it before passing it here — its own pathname would send every payer to
   * /account instead of back to the lesson they left.
   */
  returnPath?: string | null;
  /**
   * Set only when nobody is signed in. The plans stay visible either way — this
   * page is the one place that quotes a price — but /api/subscribe rejects
   * anonymous callers, so a tap has to go collect an account first and come
   * back via next= rather than fail at checkout.
   */
  signInHref?: string | null;
}

// Keep labels below in sync with PLANS in lib/paymongo.ts (₱49 / ₱99 / ₱299).
type GatePlan = "subject_month" | "subject_sem" | "year_sem";

// The three plan cards and the checkout hand-off. This is the only place in the
// app that shows a price — the locked strips and the teaser link here instead.
export function SubscribeGate({ yearId, subjectId, yearLabel, subjectTitle, returnPath, signInHref }: Props) {
  const [loading, setLoading] = useState<GatePlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe(plan: GatePlan) {
    if (signInHref) {
      // Still worth recording: a signed-out tap is real purchase intent, and
      // losing it would make the sign-in wall look free in the funnel.
      void logEvent("subscribe_click", { year_id: yearId, subject_id: subjectId });
      window.location.href = signInHref;
      return;
    }

    const deviceId = getDeviceId();
    if (!deviceId) {
      // getDeviceId() returns "" when localStorage is unreachable — Safari
      // private browsing, a partitioned context, storage switched off. This is
      // the last step of the only purchase path in the app, so say so instead
      // of swallowing the tap. (logEvent needs the same id, so this drop-off
      // cannot be reported to the funnel from the client either.)
      setError(
        "This browser is blocking the storage we need to complete a purchase. " +
          "Turn off private browsing or allow site data, then try again."
      );
      setLoading(null);
      return;
    }

    void logEvent("subscribe_click", { year_id: yearId, subject_id: subjectId });
    setLoading(plan);
    setError(null);

    try {
      const body =
        plan === "year_sem"
          ? { yearId, deviceId, returnPath: returnPath ?? undefined, plan }
          : { yearId, subjectId, deviceId, returnPath: returnPath ?? undefined, plan };

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

  return (
    <div>
      {error && (
        <p className="font-sans text-sm text-red-500 mb-4" role="alert">
          {error}
        </p>
      )}

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
            {/* "Dec 31" is hand-typed — keep in sync with SEMESTER_END in lib/paymongo.ts */}
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
            {/* "Dec 31" is hand-typed — keep in sync with SEMESTER_END in lib/paymongo.ts */}
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
    </div>
  );
}
