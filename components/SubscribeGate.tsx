"use client";

import { useState } from "react";
import { getDeviceId } from "@/lib/device";
import { logEvent } from "@/lib/analytics";

interface Props {
  yearId: string;
  yearLabel?: string;
}

export function SubscribeGate({ yearId, yearLabel }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    const deviceId = getDeviceId();
    if (!deviceId) return;

    logEvent("subscribe_click", { year_id: yearId });
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yearId, deviceId }),
      });
      const data = await res.json() as { checkoutUrl?: string; error?: string };

      if (!res.ok || !data.checkoutUrl) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="border border-ink-faint/30 p-6 mt-4">
      <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mb-2">
        Activity — Subscribers Only
      </p>
      <p className="font-sans text-base text-ink-muted mb-6">
        Unlock all activities for {yearLabel ?? "this year"} with a monthly subscription.
      </p>
      <div className="flex items-baseline gap-3 mb-6">
        <span className="font-serif text-4xl text-ink">₱50</span>
        <span className="font-sans text-sm text-ink-muted">/ month</span>
      </div>
      {error && (
        <p className="font-sans text-sm text-red-500 mb-4">{error}</p>
      )}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="bg-accent text-paper font-sans text-sm px-6 py-3 hover:bg-ink transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Redirecting to payment…" : "Subscribe — ₱50/month"}
      </button>
      <p className="font-sans text-xs text-ink-faint mt-3">
        Paid via GCash, Maya, or card. Cancel anytime.
      </p>
    </div>
  );
}
