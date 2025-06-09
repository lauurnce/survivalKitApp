import Link from "next/link";
import { BackLink } from "@/components/BackLink";

interface Props {
  /** locked: no active plan covers the subject. unfinished: unlocked, but no module in it is done yet. */
  reason: "locked" | "unfinished";
  subjectTitle: string;
  ctaHref: string;
}

const COPY = {
  locked: {
    heading: (title: string) => `Unlock ${title} to take its quiz`,
    body: "Subject quizzes come with an unlocked subject. Unlock it, finish a module, and the quiz opens here.",
    cta: "Unlock this subject",
  },
  unfinished: {
    heading: (title: string) => `Finish a module in ${title} to unlock its quiz`,
    body: "The quiz draws on modules you've marked done. Mark at least one module in this subject as done, then come back.",
    cta: "Go to the modules",
  },
} as const;

/**
 * Shown to a signed-in student for a quiz that exists but that they can't
 * take yet, so they get a reason and a next step instead of the generic 404.
 */
export function QuizUnavailable({ reason, subjectTitle, ctaHref }: Props) {
  const copy = COPY[reason];
  return (
    <main className="mx-auto max-w-wide px-4 sm:px-8 py-12 space-y-10">
      <BackLink href="/resources" label="Resources" />
      <div className="rounded-xl border border-taupe/30 p-8 text-center space-y-4">
        <p className="label-sm text-accent">{subjectTitle}</p>
        <h1 className="font-serif text-2xl text-ink">{copy.heading(subjectTitle)}</h1>
        <p className="text-ink-muted">{copy.body}</p>
        <Link
          href={ctaHref}
          className="inline-block rounded-lg bg-accent px-5 py-2 text-sm font-medium text-paper hover:bg-accent-dark transition-colors"
        >
          {copy.cta} →
        </Link>
      </div>
    </main>
  );
}
