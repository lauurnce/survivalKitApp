"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  countdownDetail,
  countdownHeadline,
  nextExamWindow,
  type ExamCountdown as Countdown,
} from "@/lib/retention/examCountdown";

interface Props {
  /** Where "start reviewing" goes; omitted = no link. */
  href?: string;
  linkLabel?: string;
  className?: string;
}

// "Finals start in 39 days", within 45 days of the next midterms or finals
// on the term calendar. Computed in the browser: the pages it sits on are
// prerendered and cached, and a server-rendered day count would go stale.
export function ExamCountdown({ href, linkLabel = "Start reviewing", className = "" }: Props) {
  const [countdown, setCountdown] = useState<Countdown | null>(null);

  useEffect(() => {
    // Today's date is only known on the client; see the note above.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCountdown(nextExamWindow(new Date()));
  }, []);

  if (!countdown) return null;

  return (
    <aside
      aria-label="Exam countdown"
      className={`max-w-wide border-l-2 border-accent pl-4 py-1 flex flex-col gap-1 ${className}`}
    >
      <p className="font-mono text-label-md uppercase tracking-[0.1em] text-accent">
        {countdownHeadline(countdown)}
      </p>
      <p className="font-sans text-sm text-ink-muted">{countdownDetail(countdown)}</p>
      {href && (
        <Link
          href={href}
          className="self-start inline-flex items-center gap-2 font-sans text-sm text-ink hover:text-accent transition-colors duration-150"
        >
          {linkLabel}
          <span className="text-accent" aria-hidden="true">→</span>
        </Link>
      )}
    </aside>
  );
}
