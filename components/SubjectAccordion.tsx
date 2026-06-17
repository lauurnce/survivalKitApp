"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCount } from "@/lib/counters";
import { SubjectProgressBar } from "@/components/SubjectProgressBar";

export interface SubjectModule {
  id: string;
  title: string;
  sort_order: number;
}

interface Props {
  subject: {
    id: string;
    title: string;
    kind: "major" | "minor";
  };
  modules: SubjectModule[];
  yearId: string;
  index: number;
  reads: number;
}

export function SubjectAccordion({ subject, modules, yearId, index, reads }: Props) {
  const [open, setOpen] = useState(false);
  const modulesHref = `/year/${yearId}/subjects/${subject.id}/modules`;
  const moduleIds = modules.map((m) => m.id);
  const listId = `modules-${subject.id}`;

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div className="flex items-start gap-6 py-8 -mx-4 px-4">
      <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mt-1 w-8 shrink-0 text-right">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link href={modulesHref} className="group block">
              <h2 className="font-serif text-2xl text-ink group-hover:text-accent transition-colors duration-150 mb-1">
                {subject.title}
              </h2>
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
                {subject.kind === "major" ? "Major" : "Minor"}
              </span>
              <span className="font-mono text-label-sm text-ink-faint/40">·</span>
              <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
                <span className="text-ink-muted">{formatCount(reads)}</span> reads
              </span>
            </div>
            <SubjectProgressBar moduleIds={moduleIds} />
          </div>
          <Link
            href={modulesHref}
            className="font-sans text-sm text-ink-faint hover:text-ink transition-colors mt-1 flex-shrink-0"
          >
            →
          </Link>
        </div>

        {modules.length > 0 && (
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={listId}
            className="mt-3 font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint hover:text-ink-muted transition-colors duration-150"
          >
            {open ? "Hide modules ▴" : "Show modules ▾"}
          </button>
        )}

        {open && (
          <div id={listId} className="mt-4 flex flex-col divide-y divide-ink-faint/20">
            {modules.map((m, mi) => (
              <Link
                key={m.id}
                href={`/year/${yearId}/subjects/${subject.id}/modules/${m.id}`}
                className="group flex items-start gap-4 py-3 hover:bg-ink/[0.02] -mx-4 px-4 transition-colors duration-150"
              >
                <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mt-0.5 w-6 shrink-0 text-right">
                  {String(mi + 1).padStart(2, "0")}
                </span>
                <span className="font-serif text-base text-ink group-hover:text-accent transition-colors duration-150">
                  {m.title}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
