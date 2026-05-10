"use client";

import { logEvent } from "@/lib/analytics";

interface Props {
  yearId: string;
  subjectId: string;
  moduleId: string;
}

// "Print / Save as PDF" on the module reader. The browser's print dialog
// covers both on every platform (Android/iOS/desktop offer "Save as PDF"), so
// this just opens it; app/globals.css carries the @media print stylesheet.
// It prints what is on screen — a locked reader's printout has no paid bodies
// because the page never had them.
export function PrintButton({ yearId, subjectId, moduleId }: Props) {
  function handleClick() {
    void logEvent("print_click", { year_id: yearId, subject_id: subjectId, module_id: moduleId });
    window.print();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="print:hidden inline-flex items-center gap-2 border border-paper/30 px-3 py-2 font-mono text-label-sm uppercase tracking-[0.12em] text-taupe hover:text-paper hover:border-paper/60 transition-colors duration-150"
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 6V1.5h8V6M4 12H2.5A1 1 0 0 1 1.5 11V7a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H12" />
        <path d="M4 9.5h8v5H4z" />
      </svg>
      Print / Save as PDF
    </button>
  );
}
