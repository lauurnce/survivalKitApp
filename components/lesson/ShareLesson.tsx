"use client";

import { useState } from "react";
import { logEvent } from "@/lib/analytics";
import { taggedUrl } from "@/lib/utm";

interface Props {
  path: string;
  moduleTitle: string;
  subjectTitle: string;
  moduleId: string;
  subjectId: string;
  yearId: string;
}

/** Tags for a lesson link a reader sends on; lands in `enter` attribution. */
export const LESSON_SHARE_UTM = { source: "lesson_share", medium: "groupchat", campaign: "lesson" } as const;

// "Send to your groupmates". Group-chat links are how nearly every reader
// arrives, so the cheapest new reader is one a current reader sends. Opens
// the phone's share sheet (Messenger, GC, etc.); on desktop, or when the
// share sheet is unavailable, copies the link instead. The link is
// UTM-tagged so the visits it brings are attributable.
export function ShareLesson({ path, moduleTitle, subjectTitle, moduleId, subjectId, yearId }: Props) {
  const [copied, setCopied] = useState(false);

  async function share() {
    void logEvent("lesson_share", { module_id: moduleId, subject_id: subjectId, year_id: yearId });
    const url = taggedUrl(path, LESSON_SHARE_UTM);
    const text = `${moduleTitle} (${subjectTitle}) — free notes, readable on your phone`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: moduleTitle, text, url });
        return;
      } catch (err) {
        // Closing the sheet is a choice, not a failure.
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Nothing more we can do without a share sheet or clipboard.
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
      <p className="font-sans text-sm text-ink-muted">Studying with blockmates? Send them this lesson.</p>
      <button
        type="button"
        onClick={share}
        className="min-h-11 border border-ink-faint px-4 py-2 font-mono text-label-md uppercase tracking-[0.1em] text-ink hover:border-ink"
      >
        {copied ? "Link copied" : "Send to groupmates"}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Lesson link copied" : ""}
      </span>
    </div>
  );
}
