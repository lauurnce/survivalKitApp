"use client";

import { useState } from "react";
import Link from "next/link";
import type { YearGroup, SubjectSummary } from "@/lib/account";
import { pct } from "@/lib/account";
import { getDeviceId } from "@/lib/device";
import type { Profile } from "@/lib/profile";
import { ProfileCard } from "./ProfileCard";

interface Props {
  unlockedSubjects: SubjectSummary[];
  years: YearGroup[];
  profile: Profile | null;
}

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

function YearSubscribeModal({
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
          <button onClick={onClose} className="text-ink-faint hover:text-ink text-lg leading-none mt-0.5">✕</button>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="space-y-3">
          {/* Subject tiers — only shown when opened from a specific subject */}
          {subjectId && (
            <>
              <button
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

function SubjectSubscribeModal({
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
          <button onClick={onClose} className="text-ink-faint hover:text-ink text-lg leading-none mt-0.5">✕</button>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          onClick={() => handleSubscribe("subject_month")}
          disabled={loading !== null}
          className="w-full rounded-lg border border-taupe/50 px-4 py-3 text-sm font-medium text-ink hover:border-accent/50 transition-colors disabled:opacity-50"
        >
          {loading === "subject_month" ? "Redirecting…" : "Unlock — ₱49 / 1 month"}
        </button>

        <button
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

// ── Collapsible year section ──────────────────────────────────────────────────

function YearSection({ year }: { year: YearGroup }) {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<
    | { kind: "year" }
    | { kind: "subject"; subject: SubjectSummary }
    | null
  >(null);

  const lockedSubjects = year.subjects.filter((s) => !s.unlocked);

  return (
    <section>
      {/* Year header — always visible, full opacity */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left group"
      >
        <p className="text-label-sm tracking-widest uppercase text-ink font-semibold">
          {year.label}
        </p>
        <svg
          className={`w-3.5 h-3.5 text-ink-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Collapsible subject list */}
      {open && (
        <div className="mt-3 space-y-0">
          <ol className="relative pl-5 border-l-2 border-taupe/30">
            {lockedSubjects.map((s) => (
              <li key={s.id} className="relative pb-3 last:pb-0">
                <span className="absolute -left-[1.35rem] top-1.5 h-2.5 w-2.5 rounded-full bg-taupe/40 border-2 border-paper" />
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/year/${s.yearId}/subjects/${s.id}/modules`}
                    className="text-xs text-ink-muted leading-snug flex-1 hover:text-accent transition-colors"
                  >
                    {s.title}
                  </Link>
                  <button
                    onClick={() => setModal({ kind: "subject", subject: s })}
                    className="shrink-0 text-[10px] text-accent underline underline-offset-2 hover:no-underline"
                  >
                    ₱49
                  </button>
                </div>
              </li>
            ))}
          </ol>

          {/* Year-level subscribe button */}
          <button
            onClick={() => setModal({ kind: "year" })}
            className="mt-4 w-full rounded-lg border border-accent/50 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/10 transition-colors text-center"
          >
            Subscribe to {year.label}
          </button>
        </div>
      )}

      {/* Modals */}
      {modal?.kind === "year" && (
        <YearSubscribeModal
          year={year}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "subject" && (
        <YearSubscribeModal
          year={year}
          subjectId={modal.subject.id}
          subjectTitle={modal.subject.title}
          onClose={() => setModal(null)}
        />
      )}
    </section>
  );
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export function AccountSidebar({ unlockedSubjects, years, profile }: Props) {
  const [subjectModal, setSubjectModal] = useState<SubjectSummary | null>(null);

  // Years that still have at least one locked subject
  const yearsWithLocked = years.filter((y) => y.subjects.some((s) => !s.unlocked));

  return (
    <>
      <aside className="w-64 shrink-0 border-r border-taupe/30 px-5 py-8 space-y-8 overflow-y-auto">

        {/* Profile card — the user's customizable wall, above the timeline */}
        <ProfileCard profile={profile} />

        {/* Unlocked subjects — always visible at top */}
        {unlockedSubjects.length > 0 && (
          <section>
            <p className="text-label-sm tracking-widest uppercase text-accent mb-4">Unlocked</p>
            <ol className="relative space-y-1 pl-5 border-l-2 border-accent/40">
              {unlockedSubjects.map((s) => {
                const p = pct(s.doneCount, s.totalCount);
                return (
                  <li key={s.id} className="relative pb-4 last:pb-0">
                    <span className="absolute -left-[1.35rem] top-1 h-3 w-3 rounded-full bg-accent border-2 border-paper" />
                    <div className="space-y-1">
                      <Link
                        href={`/year/${s.yearId}/subjects/${s.id}/modules`}
                        className="block text-sm font-medium text-ink leading-snug hover:text-accent transition-colors"
                      >
                        {s.title}
                      </Link>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-taupe/30 overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${p}%` }} />
                        </div>
                        <span className="text-xs text-accent font-medium shrink-0">{p}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/year/${s.yearId}/subjects/${s.id}/modules`}
                          className="text-xs text-accent underline underline-offset-2"
                        >
                          Continue →
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* Locked years — collapsible */}
        {yearsWithLocked.map((year) => (
          <YearSection key={year.yearId} year={year} />
        ))}
      </aside>

      {/* Subject-only modal (triggered from unlocked section, future use) */}
      {subjectModal && (
        <SubjectSubscribeModal
          subject={subjectModal}
          onClose={() => setSubjectModal(null)}
        />
      )}
    </>
  );
}
