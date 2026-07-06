import Link from "next/link";
import { pct, type SubjectSummary } from "@/lib/account";

interface Props {
  /** Unlocked subjects only — the caller filters. */
  subjects: SubjectSummary[];
  overallDone: number;
  overallTotal: number;
}

// Donut geometry: viewBox 120×120, radius leaves room for the 10px stroke.
const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Server-rendered progress summary for the account page: an overall
 * completion donut, three stat tiles, and slim per-subject bars. Pure
 * presentation from props — no fetching, no client JS.
 */
export function ProgressOverview({ subjects, overallDone, overallTotal }: Props) {
  const percent = pct(overallDone, overallTotal);
  const inProgress = subjects.filter(
    (s) => s.doneCount > 0 && s.doneCount < s.totalCount
  ).length;
  const completedSubjects = subjects.filter(
    (s) => s.totalCount > 0 && s.doneCount === s.totalCount
  ).length;

  return (
    <section className="rounded-xl border border-taupe/30 bg-taupe/5 p-6 sm:p-7">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
        {/* Donut — single-hue meter: accent fill on a faint same-neutral track. */}
        <div
          role="img"
          aria-label={`Overall progress: ${percent}% complete — ${overallDone} of ${overallTotal} modules done`}
          className="relative h-32 w-32 shrink-0"
        >
          <svg viewBox="0 0 120 120" aria-hidden="true" className="h-full w-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-ink-faint/20"
            />
            {percent > 0 && (
              <circle
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)}
                className="text-accent"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-serif text-3xl leading-none text-ink">{percent}%</span>
            <span className="mt-1.5 font-mono text-label-sm uppercase tracking-[0.12em] text-ink-muted">
              complete
            </span>
          </div>
        </div>

        {/* Stat tiles */}
        <div className="grid w-full grid-cols-3 divide-x divide-taupe/30">
          <StatTile value={overallDone} label="Modules done" />
          <StatTile value={inProgress} label="In progress" />
          <StatTile value={completedSubjects} label="Completed subjects" />
        </div>
      </div>

      {/* Per-subject slim bars */}
      {subjects.length > 0 && (
        <div className="mt-6 border-t border-taupe/30 pt-5">
          <p className="mb-3 font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
            By subject
          </p>
          <ul>
            {subjects.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/year/${s.yearId}/subjects/${s.id}/modules`}
                  className="group block py-2.5"
                >
                  <div className="mb-1.5 flex items-baseline justify-between gap-4">
                    <span className="truncate text-sm text-ink transition-colors duration-200 group-hover:text-accent">
                      {s.title}
                    </span>
                    <span className="shrink-0 font-mono text-label-sm uppercase tracking-[0.12em] text-ink-muted">
                      {s.doneCount} / {s.totalCount}
                    </span>
                  </div>
                  <div
                    aria-hidden="true"
                    className="h-1.5 w-full overflow-hidden rounded-full bg-ink-faint/20"
                  >
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${pct(s.doneCount, s.totalCount)}%` }}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-2 text-center sm:items-start sm:px-4 sm:text-left sm:first:pl-0">
      <span className="font-serif text-3xl leading-none text-ink">{value}</span>
      <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </span>
    </div>
  );
}
