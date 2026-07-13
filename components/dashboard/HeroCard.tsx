// components/dashboard/HeroCard.tsx
import Link from "next/link";
import type { CurrentTerm, Recommendation } from "@/lib/dashboard";
import { continueHref } from "@/lib/dashboard";
import type { Profile } from "@/lib/profile";
import { findLandmark, landmarkArt } from "@/lib/landmarks";
import { LandmarkArt } from "./LandmarkArt";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

interface Props {
  term: CurrentTerm | null;
  topPick: Recommendation | undefined;
  profile: Profile | null;
}

export function HeroCard({ term, topPick, profile }: Props) {
  const landmarkLabel = landmarkArt(findLandmark(profile?.university ?? null)).label;

  return (
    <div>
      <p className="font-serif text-lg text-ink mb-4">
        {greeting()}
        {profile?.firstName ? `, ${profile.firstName}` : ""}
      </p>

      <div className="rounded-xl border border-taupe/30 bg-paper p-6 sm:p-8 flex items-center gap-8">
        <div className="flex-1 min-w-0">
          <p className="label-sm mb-3">Current semester</p>

          <h1 className="font-serif text-display-md text-ink">
            {term ? `${term.yearLabel} · ${term.semester === 1 ? "1st" : "2nd"} Semester` : "Start your roadmap"}
          </h1>

          <p className="mt-2 text-sm text-ink-muted">
            {term
              ? "Build your foundation one module at a time."
              : "Unlock a subject to begin your first semester."}
          </p>

          {term && (
            <dl className="mt-6 flex items-center gap-6">
              <div className="flex flex-col">
                <dd className="font-serif text-2xl text-ink">
                  {term.modulesDone} / {term.modulesTotal}
                </dd>
                <dt className="label-sm">Modules done</dt>
              </div>
              <div className="h-10 w-px bg-taupe/30" aria-hidden="true" />
              <div className="flex flex-col">
                <dd className="font-serif text-2xl text-ink">{term.inProgress}</dd>
                <dt className="label-sm">In progress</dt>
              </div>
              <div className="h-10 w-px bg-taupe/30" aria-hidden="true" />
              <div className="flex flex-col">
                <dd className="font-serif text-2xl text-ink">{term.ready}</dd>
                <dt className="label-sm">Ready to start</dt>
              </div>
            </dl>
          )}

          <div className="mt-6 flex items-center gap-4">
            <Link
              href={continueHref(topPick)}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-paper hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {term ? "Continue this week →" : "Browse subjects →"}
            </Link>
            {term && (
              <Link
                href={`/year/${term.yearId}/subjects`}
                className="text-sm text-ink-muted underline hover:text-ink"
              >
                View semester details
              </Link>
            )}
          </div>
        </div>

        <div className="hidden sm:block w-56 lg:w-72 shrink-0">
          <LandmarkArt university={profile?.university ?? null} className="w-full" />
          <span className="sr-only">Illustration: {landmarkLabel}</span>
        </div>
      </div>
    </div>
  );
}
