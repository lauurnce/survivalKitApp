"use client";

import { usePrintAccess } from "@/components/PrintAccess";

export const PRINT_SIGNED_OUT_NOTICE = "Sign up free at tryi2i.com to download this lesson";

export function printUnpaidNotice(subjectTitle: string): string {
  return `Download this lesson by unlocking ${subjectTitle} at tryi2i.com`;
}

interface Props {
  yearId: string;
  subjectId: string;
  subjectTitle: string;
  children: React.ReactNode;
}

// Keeps Ctrl/Cmd+P from producing a usable lesson for anyone not entitled to
// this subject.
//
// The reader page is prerendered once for every visitor, so its static HTML
// is the locked state: data-print-gate="locked". Only once the client confirms
// a subject or year plan covering this subject (components/PrintAccess.tsx)
// does it flip to "open". In print, a locked root hides the lesson and prints
// a single notice instead (app/globals.css, "Print gate") — the sign-up notice
// while the reader is signed out or still unknown, the unlock notice once a
// signed-in reader is known to be unpaid. On screen nothing changes either way.
export function PrintGateRoot({ yearId, subjectId, subjectTitle, children }: Props) {
  const { access, probe } = usePrintAccess(yearId, subjectId);
  const notice = access === "unpaid" ? printUnpaidNotice(subjectTitle) : PRINT_SIGNED_OUT_NOTICE;
  return (
    <div
      className="print-gate-root"
      data-print-gate={access === "entitled" ? "open" : "locked"}
      data-print-access={access}
    >
      {probe}
      <div className="print-gate-notice" aria-hidden="true">
        <p className="font-mono text-label-md uppercase tracking-[0.1em]">BSIT Survival Kit</p>
        <p className="font-serif text-3xl">{notice}</p>
      </div>
      <div className="print-gate-content">{children}</div>
    </div>
  );
}
