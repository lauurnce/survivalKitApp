"use client";

import { useEffect, useMemo, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { fetchCompletedModules } from "@/lib/progress";
import { modulePath } from "@/lib/subscribeRedirect";
import { isExamPrep, isOpenable, pickStartModule, sortModules, type HubModule, type StartReason } from "@/lib/subjectHub/startHere";

interface Props {
  yearId: string;
  subjectId: string;
  modules: HubModule[];
  // Content-section counts per module; null/undefined treats every module as
  // openable (see lib/subjectHub/queries).
  contentCounts?: Record<string, number> | null;
}

const COPY: Record<StartReason, { eyebrow: string; cta: string }> = {
  start: { eyebrow: "Start here", cta: "Start lesson" },
  continue: { eyebrow: "Pick up where you left off", cta: "Continue" },
  review: { eyebrow: "All lessons done", cta: "Review" },
};

// One obvious first step above a subject's module list.
//
// The server render is always the "start" pick (completion lives on the
// device), so the card has the same box before and after hydration; once the
// device's done-marks load it may switch to "continue" or "review". Free to
// read is true of every lesson: content sections are never gated, only the
// reviewers past the free sample.
export function StartHereCard({ yearId, subjectId, modules, contentCounts }: Props) {
  const [completed, setCompleted] = useState<ReadonlySet<string>>(() => new Set());
  const counts = contentCounts ?? undefined;
  const moduleKey = modules.map((m) => m.id).join(",");

  useEffect(() => {
    if (modules.length === 0) return;
    let active = true;
    fetchCompletedModules(modules.map((m) => m.id)).then((set) => {
      if (active && set.size > 0) setCompleted(set);
    });
    return () => {
      active = false;
    };
    // modules come from server data and are stable per render of this subject
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleKey]);

  const pick = useMemo(
    () => pickStartModule(modules, { contentCounts: counts, completedIds: completed }),
    [modules, counts, completed],
  );
  if (!pick) return null;

  const lessons = sortModules(modules).filter((m) => !isExamPrep(m.title) && isOpenable(m.id, counts));
  const copy = COPY[pick.reason];
  const position = isExamPrep(pick.module.title)
    ? "Exam prep"
    : `Lesson ${lessons.indexOf(pick.module) + 1} of ${lessons.length}`;

  return (
    <section
      aria-labelledby={`start-here-${subjectId}`}
      data-testid="start-here-card"
      data-reason={pick.reason}
      className="mt-6 flex flex-col gap-4 border border-ink-faint/40 bg-ink/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6"
    >
      <div className="min-w-0">
        <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent-strong">
          {copy.eyebrow}
        </p>
        <h2
          id={`start-here-${subjectId}`}
          className="mt-1 break-words font-serif text-2xl text-ink"
        >
          {pick.module.title}
        </h2>
        <p className="mt-1 font-mono text-label-sm uppercase tracking-[0.12em] text-ink-muted">
          {position} · Free to read
        </p>
      </div>
      <ButtonLink
        href={modulePath(yearId, subjectId, pick.module.id)}
        prefetch={true}
        className="shrink-0 self-start sm:self-auto"
      >
        {copy.cta} <span aria-hidden="true">→</span>
      </ButtonLink>
    </section>
  );
}
