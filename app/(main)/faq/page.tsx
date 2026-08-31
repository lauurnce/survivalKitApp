import type { Metadata } from "next";
import Link from "next/link";

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
        Yes. BSIT Survival Kit is free to read &mdash; that&apos;s stated right on
        the homepage. Module notes, programming guides, and reviewers are available
        at no cost.
      </p>
    ),
  },
  {
    question: "What does the waitlist email get used for?",
    answer: (
      <p>
        We collect emails only to notify you when content is ready. We don&apos;t
        sell or share your data. See the{" "}
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
        Content is being written year by year. A section marked &quot;coming
        soon&quot; isn&apos;t ready yet &mdash; leave your email on that page and
        we&apos;ll notify you the moment it is.
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
