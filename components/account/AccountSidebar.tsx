"use client";

import { useState } from "react";
import Link from "next/link";
import type { YearGroup, SubjectSummary } from "@/lib/account";
import { pct } from "@/lib/account";
import type { Profile } from "@/lib/profile";
import { ProfileCard } from "./ProfileCard";
import { YearSubscribeModal, SubjectSubscribeModal } from "./SubscribeModals";

interface Props {
  unlockedSubjects: SubjectSummary[];
  years: YearGroup[];
  profile: Profile | null;
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
        type="button"
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
                    type="button"
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
            type="button"
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
