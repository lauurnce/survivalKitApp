import type { Metadata } from "next";
import Link from "next/link";
import { PLANS } from "@/lib/paymongo";
import { formatPeso } from "@/lib/pricing";

// Every amount comes from PLANS, so a price change in lib/paymongo.ts reaches
// this page without a second edit.
const price = {
  subjectMonth: formatPeso(PLANS.subject_month.amount),
  subjectSem: formatPeso(PLANS.subject_sem.amount),
  yearSem: formatPeso(PLANS.year_sem.amount),
};

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about BSIT Survival Kit — cost, what your email is used for, whether you need an account, how content is organized, and when \"coming soon\" sections are ready.",
};

const FAQS: { question: string; answer: React.ReactNode }[] = [
  {
    question: "Is this actually free?",
    answer: (
      <p>
        The lessons are. Module notes, programming guides, and computation
        walkthroughs are free to read, with or without an account. The
        reviewers &mdash; practice drills, code labs, and full worked solutions
        with answer keys &mdash; are paid. Each subject&apos;s first set of
        reviewers is free to try, so you can see what you&apos;d be paying for.
      </p>
    ),
  },
  {
    question: "How much do the reviewers cost?",
    answer: (
      <p>
        {price.subjectMonth} unlocks every reviewer in one subject for a month,
        or {price.subjectSem} for the whole semester. {price.yearSem} unlocks every
        subject in your year for the semester. Each is a one-time payment by
        GCash, Maya, or card &mdash; nothing renews automatically.
      </p>
    ),
  },
  {
    question: "What is my email used for?",
    answer: (
      <p>
        Your email is collected when you create an account, so you can sign in
        and keep your progress synced. We never sell your data.
        See the{" "}
        <Link
          href="/privacy"
          className="text-ink hover:text-accent transition-colors underline underline-offset-2"
        >
          Privacy Policy
        </Link>{" "}
        for the full detail on what we collect and why.
      </p>
    ),
  },
  {
    question: "Do I need an account to read modules?",
    answer: (
      <p>
        No &mdash; modules are readable without signing in. An account is only
        needed for things tied to you personally, like taking quizzes or keeping
        your unlocked subjects and reading progress synced across devices.
      </p>
    ),
  },
  {
    question: "What's covered, and how is content organized?",
    answer: (
      <p>
        Content is a study guide with original explanations, covering standard
        curriculum topics. It&apos;s organized by year and then by subject, so you
        can start wherever you need to &mdash; from the{" "}
        <Link
          href="/year"
          className="text-ink hover:text-accent transition-colors underline underline-offset-2"
        >
          Start here
        </Link>{" "}
        page.
      </p>
    ),
  },
  {
    question: "Some sections say \"coming soon\" — when will they be ready?",
    answer: (
      <p>
        Every year is open now. A section marked &quot;coming soon&quot; is
        still being written and will appear here as soon as it&apos;s ready.
      </p>
    ),
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-paper px-6 py-12 md:px-16 md:py-20">
      <div className="max-w-prose mx-auto">

        <Link
          href="/"
          className="font-sans text-sm text-ink-muted hover:text-ink transition-colors mb-10 inline-block"
        >
          ← Back to home
        </Link>

        <p className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted mb-4">
          Help
        </p>
        <h1 className="font-serif text-display-lg text-ink mb-3 leading-tight">
          Frequently Asked Questions
        </h1>
        <p className="font-sans text-sm text-ink-faint mb-12">
          Quick answers before you dive in.
        </p>

        <div className="font-sans text-base text-ink-muted leading-relaxed space-y-10">
          {FAQS.map(({ question, answer }) => (
            <section key={question}>
              <h2 className="font-serif text-xl text-ink mb-3">{question}</h2>
              {answer}
            </section>
          ))}
        </div>

      </div>
    </main>
  );
}
