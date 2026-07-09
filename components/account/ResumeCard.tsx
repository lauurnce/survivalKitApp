"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Same shape LastModuleTracker writes and ContinueReading reads.
interface LastModule {
  moduleId: string;
  subjectId: string;
  yearId: string;
  moduleTitle: string;
  subjectTitle: string;
}

interface Props {
  /** Server-computed fallback (first unfinished module) when localStorage is empty. */
  fallback: LastModule | null;
}

/**
 * "Pick up where you left off" hero card for the account page. Renders the
 * fallback deterministically on the server, then swaps in the device's
 * bsit_last_module entry after mount — same pattern as ContinueReading,
 * so there is no hydration mismatch.
 */
export function ResumeCard({ fallback }: Props) {
  const [target, setTarget] = useState<LastModule | null>(fallback ?? null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bsit_last_module");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<LastModule>;
      if (
        typeof parsed.moduleId === "string" && parsed.moduleId &&
        typeof parsed.subjectId === "string" && parsed.subjectId &&
        typeof parsed.yearId === "string" && parsed.yearId &&
        typeof parsed.moduleTitle === "string" && parsed.moduleTitle &&
        typeof parsed.subjectTitle === "string" && parsed.subjectTitle
      ) {
        setTarget(parsed as LastModule);
      }
    } catch {
      // corrupted localStorage — ignore
    }
  }, []);

  if (!target) return null;

  return (
    <div>
      <p className="mb-4 font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted">
        Pick up where you left off
      </p>
      <Link
        href={`/year/${target.yearId}/subjects/${target.subjectId}/modules/${target.moduleId}`}
        className="group relative flex items-center justify-between gap-6 border border-ink-faint p-7 transition-colors duration-200 hover:border-navy hover:bg-navy sm:p-8"
      >
        {/* Accent spine — kept as its own element so it survives the hover border swap. */}
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-accent" />
        <div className="min-w-0">
          <h2 className="mb-1 font-serif text-display-md text-ink transition-colors duration-200 group-hover:text-paper">
            {target.moduleTitle}
          </h2>
          <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint transition-colors duration-200 group-hover:text-taupe">
            {target.subjectTitle}
          </p>
        </div>
        <span className="shrink-0 text-2xl text-accent transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
          →
        </span>
      </Link>
    </div>
  );
}
