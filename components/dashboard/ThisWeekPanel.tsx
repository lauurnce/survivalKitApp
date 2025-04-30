import Link from "next/link";
import type { Recommendation } from "@/lib/dashboard";
import { continueHref } from "@/lib/dashboard";
import { StatusChip } from "./StatusChip";
import { SubjectIcon } from "./SubjectIcon";

interface Props {
  recs: Recommendation[];
  /** No subject unlocked yet: a new account, not one that finished everything. */
  nothingUnlocked?: boolean;
}

export function ThisWeekPanel({ recs, nothingUnlocked = false }: Props) {
  return (
    <div className="rounded-xl border border-taupe/30 bg-paper">
      <div className="px-6 pt-6">
        <p className="label-sm">This week</p>
        <h2 className="font-serif text-lg text-ink mt-1">Your next modules</h2>
      </div>

      {recs.length === 0 && nothingUnlocked ? (
        <div className="px-6 py-6">
          <p className="text-sm font-medium text-ink">Start your first module</p>
          <p className="mt-1 text-sm text-ink-muted">
            Every subject opens with a free lesson. Pick one to begin, and it will show up here.
          </p>
          <Link
            href="/year"
            className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-paper hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Browse subjects →
          </Link>
        </div>
      ) : recs.length === 0 ? (
        <div className="px-6 py-6">
          <p className="text-sm text-ink-muted">
            You&apos;re all caught up. Browse subjects to unlock your next one.{" "}
            <Link
              href="/year"
              className="underline hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Browse subjects
            </Link>
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-taupe/20">
          {recs.map((rec) => (
            <li key={rec.moduleId}>
              <Link
                href={continueHref(rec)}
                className="flex items-center justify-between gap-3 px-6 py-4 hover:bg-taupe/5 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <SubjectIcon title={rec.subjectTitle} className="w-9 h-9" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{rec.moduleTitle}</p>
                    <p className="text-xs text-ink-muted truncate">{rec.subjectTitle}</p>
                  </div>
                </div>
                <StatusChip status={rec.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
