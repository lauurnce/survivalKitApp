"use client";

import { useState } from "react";
import Link from "next/link";
import type { TermGroup } from "@/lib/dashboard";
import { subjectStatus } from "@/lib/dashboard";
import type { SubjectSummary, YearGroup } from "@/lib/account";
import { pct } from "@/lib/account";
import { YearSubscribeModal, SubjectSubscribeModal } from "@/components/account/SubscribeModals";
import { StatusChip } from "./StatusChip";
import { SubjectIcon } from "./SubjectIcon";

interface Props {
  terms: TermGroup[];
  currentKey: string | null;
}

// A YearSubscribeModal only ever reads `yearId` and `label` off the year it's
// given — build the minimal YearGroup shape from the term's own fields rather
// than requiring the full year's subject list.
function termAsYearGroup(term: TermGroup): YearGroup {
  return {
    yearId: term.yearId,
    label: term.yearLabel,
    sortOrder: term.yearSort,
    subjects: term.subjects,
  };
}

function ChevronRight() {
  return (
    <svg
      className="w-4 h-4 text-ink-faint shrink-0"
      viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M4 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-ink-faint shrink-0"
      viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="2.5" y="5.5" width="7" height="5" rx="1" />
      <path d="M4 5.5V3.75a2 2 0 0 1 4 0V5.5" strokeLinecap="round" />
    </svg>
  );
}

type ModalState =
  | { kind: "year"; term: TermGroup }
  | { kind: "subject"; subject: SubjectSummary }
  | null;

function TermSection({
  term,
  isOpen,
  onOpenModal,
}: {
  term: TermGroup;
  isOpen: boolean;
  onOpenModal: (modal: ModalState) => void;
}) {
  const totalCount = term.subjects.reduce((sum, s) => sum + s.totalCount, 0);
  const isFullyLocked = term.subjects.every((s) => !s.unlocked);
  const semesterLabel = term.semester === 1 ? "1st" : "2nd";

  return (
    <details className="group" open={isOpen}>
      <summary
        className="flex w-full cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <div className="flex items-center gap-3 min-w-0">
          <svg
            className="w-3.5 h-3.5 text-ink-muted transition-transform duration-200 shrink-0 group-open:rotate-180"
            viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2 className="font-serif text-lg text-ink truncate">
            {term.yearLabel} · {semesterLabel} Semester
          </h2>
          <span className="text-xs text-ink-muted shrink-0">{totalCount} modules</span>
          {isFullyLocked && (
            <span className="label-sm text-ink-faint shrink-0">Locked</span>
          )}
        </div>

        {isFullyLocked && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onOpenModal({ kind: "year", term });
            }}
            className="shrink-0 text-xs underline text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Unlock year
          </button>
        )}
      </summary>

      <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {term.subjects.map((s) => {
          const progress = pct(s.doneCount, s.totalCount);

          if (s.unlocked) {
            const status = subjectStatus(s);
            const inProgress = status === "in-progress";
            return (
              <li key={s.id}>
                <Link
                  href={`/year/${term.yearId}/subjects/${s.id}/modules`}
                  className={
                    "flex items-start gap-3 rounded-xl border px-3 py-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent " +
                    (inProgress
                      ? "border-accent/30 bg-accent/5 hover:bg-accent/10"
                      : "border-taupe/30 bg-paper hover:bg-taupe/5")
                  }
                >
                  <SubjectIcon title={s.title} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 flex-1 text-sm font-medium text-ink">{s.title}</p>
                      <ChevronRight />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-taupe/20">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="shrink-0 text-xs tabular-nums text-ink-muted">
                        {s.doneCount}/{s.totalCount}
                      </span>
                    </div>
                    <div className="mt-2">
                      <StatusChip status={status} />
                    </div>
                  </div>
                </Link>
              </li>
            );
          }

          return (
            <li key={s.id}>
              <div className="flex items-center gap-3 rounded-xl border border-taupe/30 bg-paper px-3 py-3">
                <SubjectIcon title={s.title} className="w-10 h-10 opacity-50" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <LockIcon />
                    <p className="min-w-0 text-sm font-medium text-ink-muted">
                      {s.title}
                      <span className="sr-only">Locked</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenModal({ kind: "subject", subject: s })}
                  className="shrink-0 text-xs underline text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  Unlock
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

export function SemesterSections({ terms, currentKey }: Props) {
  const [modal, setModal] = useState<ModalState>(null);

  return (
    <>
      <div className="space-y-3">
        {terms.map((term) => {
          const key = `${term.yearId}-${term.semester}`;
          return (
            <TermSection
              key={key}
              term={term}
              isOpen={key === currentKey}
              onOpenModal={setModal}
            />
          );
        })}
      </div>

      {modal?.kind === "year" && (
        <YearSubscribeModal
          year={termAsYearGroup(modal.term)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "subject" && (
        <SubjectSubscribeModal
          subject={modal.subject}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
