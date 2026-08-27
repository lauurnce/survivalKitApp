"use client";

import Link from "next/link";

interface ModuleQuizInfo {
  moduleId: string;
  moduleTitle: string;
  subjectTitle: string;
  yearLabel: string;
  semester: number;
  completedAt: string;
  hasQuizMaterial: boolean;
  quizTaken: boolean;
  lastScore?: number;
  lastTotal?: number;
  lastTakenAt?: string;
}

interface ModuleQuizCardProps {
  info: ModuleQuizInfo;
}

const kickerClass = "font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ModuleQuizCard({ info }: ModuleQuizCardProps) {
  const completedDate = formatDate(info.completedAt);
  const takenDate = info.lastTakenAt ? formatDate(info.lastTakenAt) : null;

  const semLabel = info.semester === 1 ? "1st Semester" : "2nd Semester";

  return (
    <Link
      href={`/quiz/module/${info.moduleId}`}
      className="group rounded-xl border border-taupe/30 p-5 hover:border-accent/50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={kickerClass}>{info.yearLabel} · {semLabel}</span>
            <span className="text-xs text-ink-muted">/</span>
            <span className="text-xs text-ink-muted">{info.subjectTitle}</span>
          </div>
          <h3 className="font-serif text-lg text-ink group-hover:text-accent transition-colors">
            {info.moduleTitle}
          </h3>
          <p className="text-xs text-ink-muted mt-1">Module completed {completedDate}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {info.hasQuizMaterial ? (
            info.quizTaken ? (
              <>
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                  Taken
                </span>
                {info.lastScore !== undefined && info.lastTotal !== undefined && (
                  <span className="font-mono text-sm text-ink">
                    {info.lastScore} / {info.lastTotal}
                  </span>
                )}
              </>
            ) : (
              <span className="rounded-full bg-emerald/10 px-2.5 py-0.5 text-xs font-medium text-emerald">
                Ready
              </span>
            )
          ) : (
            <span className="rounded-full bg-taupe/10 px-2.5 py-0.5 text-xs font-medium text-ink-faint">
              No quiz material
            </span>
          )}
        </div>
      </div>

      {info.quizTaken && info.lastTakenAt && (
        <div className="mt-3 pt-3 border-t border-taupe/20 flex items-center justify-between text-xs text-ink-muted">
          <span>Last attempted: {takenDate}</span>
          <span className="font-mono text-ink-faint">Review →</span>
        </div>
      )}

      {!info.hasQuizMaterial && (
        <div className="mt-3 pt-3 border-t border-taupe/20 text-xs text-ink-muted">
          This module doesn&apos;t have enough content for a quiz yet.
        </div>
      )}
    </Link>
  );
}