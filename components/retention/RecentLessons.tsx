"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logEvent } from "@/lib/analytics";
import { lessonHref, readRecentLessons, visitedAgo, type RecentLesson } from "@/lib/retention/recentLessons";

interface Props {
  /** Show only lessons from this year (the year's subject list). */
  yearId?: string;
  /** How many older lessons to list under the main one. */
  extra?: number;
  className?: string;
}

// "Pick up where you left off": the last lesson this device opened, plus a
// couple before it. Device-local (lib/retention/recentLessons.ts), so it
// works without an account. Renders nothing for a first-time visitor, and
// nothing during SSR: the list only exists in this browser.
export function RecentLessons({ yearId, extra = 2, className = "" }: Props) {
  const [lessons, setLessons] = useState<RecentLesson[]>([]);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const all = readRecentLessons();
    // localStorage exists only after mount; reading it during render would
    // mismatch the server HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLessons(yearId ? all.filter((l) => l.yearId === yearId) : all);
    setNow(Date.now());
  }, [yearId]);

  if (lessons.length === 0) return null;
  const [latest, ...rest] = lessons;
  const older = rest.slice(0, extra);
  const when = visitedAgo(latest.visitedAt, now);
  const track = (l: RecentLesson) => () =>
    void logEvent("recent_lesson_click", { year_id: l.yearId, subject_id: l.subjectId, module_id: l.moduleId });

  return (
    <section aria-labelledby="recent-lessons-heading" className={`max-w-wide ${className}`}>
      <p
        id="recent-lessons-heading"
        className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted mb-4"
      >
        Pick up where you left off
      </p>
      <Link
        href={lessonHref(latest)}
        onClick={track(latest)}
        className="group flex items-center justify-between gap-6 border border-ink-faint hover:border-navy hover:bg-navy p-6 transition-colors duration-200"
      >
        <div className="min-w-0">
          <h2 className="font-serif text-display-md text-ink group-hover:text-paper transition-colors duration-200 mb-1 break-words">
            {latest.moduleTitle}
          </h2>
          <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint group-hover:text-taupe transition-colors duration-200">
            {[latest.subjectTitle, when && `Opened ${when}`].filter(Boolean).join(" · ")}
          </p>
        </div>
        <span className="text-accent text-xl flex-shrink-0" aria-hidden="true">→</span>
      </Link>
      {older.length > 0 && (
        <ul className="mt-3 flex flex-col divide-y divide-ink-faint/30">
          {older.map((l) => (
            <li key={l.moduleId}>
              <Link
                href={lessonHref(l)}
                onClick={track(l)}
                className="flex items-baseline justify-between gap-4 py-3 font-sans text-sm text-ink-muted hover:text-ink transition-colors duration-150"
              >
                <span className="min-w-0 break-words">
                  {l.moduleTitle}
                  {l.subjectTitle && <span className="text-ink-faint"> · {l.subjectTitle}</span>}
                </span>
                <span className="text-accent flex-shrink-0" aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
