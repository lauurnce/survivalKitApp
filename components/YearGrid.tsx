"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCount } from "@/lib/counters";
import { ComingSoonModal } from "@/components/ComingSoonModal";

export interface YearCardData {
  id: string;
  label: string;
  coming_soon: boolean;
  stats: { total: number; sem1: number; sem2: number; major: number; minor: number };
  readers: number;
}

interface Props {
  cards: YearCardData[];
}

export function YearGrid({ cards }: Props) {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {cards.map((year, i) => {
          if (year.coming_soon) {
            return (
              <button
                key={year.id}
                type="button"
                onClick={() => setActiveLabel(year.label)}
                className="group border border-ink-faint hover:border-navy hover:bg-navy p-8 flex flex-col gap-4 transition-colors duration-200 text-left"
              >
                <span aria-hidden="true" className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint group-hover:text-taupe transition-colors duration-200">
                  § 0{i + 1}
                </span>
                <h2 className="font-serif text-display-md text-ink group-hover:text-paper transition-colors duration-200">
                  {year.label}
                </h2>
                <span className="font-sans text-sm text-ink-faint mt-auto group-hover:text-taupe transition-colors duration-200">
                  Coming soon
                </span>
              </button>
            );
          }

          return (
            <Link
              key={year.id}
              href={`/year/${year.id}/subjects`}
              className="group border border-ink-faint hover:border-navy hover:bg-navy p-8 flex flex-col gap-4 transition-colors duration-200"
            >
              <span aria-hidden="true" className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint group-hover:text-taupe transition-colors duration-200">
                § 0{i + 1}
              </span>
              <h2 className="font-serif text-display-md text-ink group-hover:text-paper transition-colors duration-200">
                {year.label}
              </h2>

              {year.stats.total > 0 && (
                <div className="flex flex-col gap-1 mt-1">
                  <p className="font-sans text-xs text-ink-muted group-hover:text-taupe transition-colors duration-200">
                    {year.stats.major} major · {year.stats.minor} minor
                  </p>
                  <p className="font-sans text-xs text-ink-faint group-hover:text-taupe/70 transition-colors duration-200">
                    Sem 1: {year.stats.sem1} subjects · Sem 2: {year.stats.sem2} subjects
                  </p>
                </div>
              )}

              <span className="font-sans text-sm text-ink-muted mt-auto group-hover:text-paper transition-colors duration-200">
                View subjects →
              </span>

              <div className="flex items-center gap-2 pt-3 border-t border-ink-faint/20 group-hover:border-taupe/20 transition-colors duration-200">
                <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint group-hover:text-taupe transition-colors duration-200">
                  <span className="text-ink-muted group-hover:text-taupe/80 transition-colors duration-200">
                    {formatCount(year.readers)}
                  </span>{" "}
                  readers
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {activeLabel && (
        <ComingSoonModal
          yearLabel={activeLabel}
          onClose={() => setActiveLabel(null)}
        />
      )}
    </>
  );
}
