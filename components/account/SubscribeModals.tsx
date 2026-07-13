"use client";

import { useState } from "react";
import type { YearGroup, SubjectSummary } from "@/lib/account";
import { getDeviceId } from "@/lib/device";

// ── subscribe helper (shared by year and subject buttons) ─────────────────────

async function startCheckout(
  body: Record<string, string | null | undefined>,
  onError: (msg: string) => void
) {
  const deviceId = getDeviceId();
  if (!deviceId) { onError("Device ID missing. Please refresh."); return; }

  const returnPath = window.location.pathname;
  const res = await fetch("/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, deviceId, returnPath }),
  });
  const data = await res.json() as { checkoutUrl?: string; error?: string };
  if (!res.ok || !data.checkoutUrl) {
    onError(data.error ?? "Something went wrong. Please try again.");
    return;
  }
  window.location.href = data.checkoutUrl;
}

// ── Year subscribe modal (₱49 subject or ₱299 year) ──────────────────────────

export function YearSubscribeModal({
  year,
  subjectId,
  subjectTitle,
  onClose,
}: {
  year: YearGroup;
  subjectId?: string;        // when opened from a subject row
  subjectTitle?: string;
  onClose: () => void;
}) {
  // Keep labels in sync with PLANS in lib/paymongo.ts (₱49 / ₱99 / ₱299).
  type ModalPlan = "subject_month" | "subject_sem" | "year_sem";
  const [loading, setLoading] = useState<ModalPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePlan(plan: ModalPlan) {
    setLoading(plan);
    setError(null);
    await startCheckout(
      plan === "year_sem"
        ? { yearId: year.yearId, plan }
        : { yearId: year.yearId, subjectId: subjectId ?? null, plan },
      (msg) => { setError(msg); setLoading(null); }
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm bg-paper border border-taupe/50 rounded-xl p-6 space-y-5 shadow-xl">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-label-sm tracking-widest uppercase text-ink-muted mb-1">Subscribe</p>
            <h2 className="font-serif text-lg text-ink leading-snug">{year.label}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-ink-faint hover:text-ink text-lg leading-none mt-0.5">✕</button>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="space-y-3">
          {/* Subject tiers — only shown when opened from a specific subject */}
          {subjectId && (
            <>
              <button
                type="button"
                onClick={() => handlePlan("subject_month")}
                disabled={loading !== null}
                className="w-full flex items-center justify-between rounded-lg border border-taupe/50 px-4 py-3 text-left hover:border-accent/50 transition-colors disabled:opacity-50"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{subjectTitle ?? "This subject"}</p>
                  <p className="text-xs text-ink-muted">Single subject · 1 month</p>
                </div>
                <span className="text-sm font-semibold text-accent shrink-0">
                  {loading === "subject_month" ? "…" : "₱49"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handlePlan("subject_sem")}
                disabled={loading !== null}
                className="w-full flex items-center justify-between rounded-lg border border-accent/60 px-4 py-3 text-left hover:border-accent transition-colors disabled:opacity-50"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{subjectTitle ?? "This subject"}</p>
                  {/* "Dec 31" is hand-typed — keep in sync with SEMESTER_END in lib/paymongo.ts */}
                  <p className="text-xs text-ink-muted">Single subject · until Dec 31 (whole semester)</p>
                  <span className="inline-block mt-1 text-[10px] font-medium text-accent uppercase tracking-wider">★ Most popular</span>
                </div>
                <span className="text-sm font-semibold text-accent shrink-0">
                  {loading === "subject_sem" ? "…" : "₱99"}
                </span>
              </button>
            </>
          )}

          {/* All-subjects semester plan */}
          <button
            type="button"
            onClick={() => handlePlan("year_sem")}
            disabled={loading !== null}
            className="w-full flex items-center justify-between rounded-lg border border-accent/60 bg-accent/5 px-4 py-3 text-left hover:bg-accent/10 transition-colors disabled:opacity-50"
          >
            <div>
              <p className="text-sm font-medium text-ink">All of {year.label}</p>
              {/* "Dec 31" is hand-typed — keep in sync with SEMESTER_END in lib/paymongo.ts */}
              <p className="text-xs text-ink-muted">Every subject in this year · until Dec 31</p>
              <span className="inline-block mt-1 text-[10px] font-medium text-accent uppercase tracking-wider">Best value</span>
            </div>
            <span className="text-sm font-semibold text-accent shrink-0">
              {loading === "year_sem" ? "…" : "₱299"}
            </span>
          </button>
        </div>

        <p className="text-xs text-ink-faint">One-time payment via GCash, Maya, or card. No auto-renew.</p>
      </div>
    </div>
  );
}

// ── Subject-only subscribe modal (₱49 only) ───────────────────────────────────

export function SubjectSubscribeModal({
  subject,
  onClose,
}: {
  subject: SubjectSummary;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState<"subject_month" | "subject_sem" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe(plan: "subject_month" | "subject_sem") {
    setLoading(plan);
    setError(null);
    await startCheckout(
      { yearId: subject.yearId, subjectId: subject.id, plan },
      (msg) => { setError(msg); setLoading(null); }
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-xs bg-paper border border-taupe/50 rounded-xl p-6 space-y-5 shadow-xl">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-label-sm tracking-widest uppercase text-ink-muted mb-1">Unlock subject</p>
            <h2 className="font-serif text-base text-ink leading-snug">{subject.title}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-ink-faint hover:text-ink text-lg leading-none mt-0.5">✕</button>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="button"
          onClick={() => handleSubscribe("subject_month")}
          disabled={loading !== null}
          className="w-full rounded-lg border border-taupe/50 px-4 py-3 text-sm font-medium text-ink hover:border-accent/50 transition-colors disabled:opacity-50"
        >
          {loading === "subject_month" ? "Redirecting…" : "Unlock — ₱49 / 1 month"}
        </button>

        <button
          type="button"
          onClick={() => handleSubscribe("subject_sem")}
          disabled={loading !== null}
          className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-medium text-paper hover:bg-accent-dark transition-colors disabled:opacity-50"
        >
          {loading === "subject_sem" ? "Redirecting…" : "Unlock — ₱99 / semester"}
        </button>

        <p className="text-xs text-ink-faint">One-time payment via GCash, Maya, or card. No auto-renew.</p>
      </div>
    </div>
  );
}
