"use client";

import { useState } from "react";
import { getDeviceId } from "@/lib/device";
import { logEvent } from "@/lib/analytics";

interface Props {
  yearId: string;
  subjectId: string;
  yearLabel?: string;
  subjectTitle?: string;
}

export function SubscribeGate({ yearId, subjectId, yearLabel, subjectTitle }: Props) {
  const [loading, setLoading] = useState<"subject" | "year" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe(plan: "subject" | "year") {
    const deviceId = getDeviceId();
    if (!deviceId) return;

    logEvent("subscribe_click", { year_id: yearId, subject_id: subjectId });
    setLoading(plan);
    setError(null);

    try {
      const body =
        plan === "subject"
          ? { yearId, subjectId, deviceId }
          : { yearId, deviceId };

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
    <div className="border border-ink-faint/30 p-6 mt-4">
      <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mb-2">
        Activity — Subscribers Only
      </p>
      <p className="font-sans text-base text-ink-muted mb-6">
        Unlock activities by choosing a plan below.
      </p>

      {error && (
        <p className="font-sans text-sm text-red-500 mb-4">{error}</p>
      )}

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
            <span className="font-serif text-3xl text-ink">₱50</span>
            <span className="font-sans text-sm text-ink-muted">/ month</span>
          </div>
          <button
            onClick={() => handleSubscribe("subject")}
            disabled={loading !== null}
            className="bg-accent text-paper font-sans text-sm px-4 py-3 hover:bg-ink transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === "subject" ? "Redirecting…" : "Subscribe — ₱50/month"}
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
            <span className="font-serif text-3xl text-ink">₱300</span>
            <span className="font-sans text-sm text-ink-muted">/ month</span>
          </div>
          <button
            onClick={() => handleSubscribe("year")}
            disabled={loading !== null}
            className="bg-ink text-paper font-sans text-sm px-4 py-3 hover:bg-accent transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === "year" ? "Redirecting…" : "Subscribe — ₱300/month"}
          </button>
        </div>
      </div>

      <p className="font-sans text-xs text-ink-faint mt-4">
        Paid via GCash, Maya, or card. Cancel anytime.
      </p>
    </div>
  );
}
