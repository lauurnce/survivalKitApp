"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LastModule {
  moduleId: string;
  subjectId: string;
  yearId: string;
  moduleTitle: string;
  subjectTitle: string;
}

export function ContinueReading() {
  const [last, setLast] = useState<LastModule | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bsit_last_module");
      if (!raw) return;
      const parsed = JSON.parse(raw) as LastModule;
      if (parsed.moduleId && parsed.subjectId && parsed.yearId && parsed.moduleTitle && parsed.subjectTitle) {
        setLast(parsed);
      }
    } catch {
      // corrupted localStorage — ignore
    }
  }, []);

  if (!last) return null;

  return (
    <div className="max-w-wide">
      <p className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted mb-4">
        Continue reading
      </p>
      <Link
        href={`/year/${last.yearId}/subjects/${last.subjectId}/modules/${last.moduleId}`}
        className="group flex items-center justify-between gap-6 border border-ink-faint hover:border-navy hover:bg-navy p-6 transition-colors duration-200"
      >
        <div>
          <h2 className="font-serif text-display-md text-ink group-hover:text-paper transition-colors duration-200 mb-1">
            {last.moduleTitle}
          </h2>
          <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint group-hover:text-taupe transition-colors duration-200">
            {last.subjectTitle}
          </p>
        </div>
        <span className="text-accent text-xl flex-shrink-0">→</span>
      </Link>
    </div>
  );
}
