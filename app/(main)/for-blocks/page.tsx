import type { Metadata } from "next";
import { BackLink } from "@/components/BackLink";

export const metadata: Metadata = {
  title: "Unlock a subject for your whole block",
  description:
    "One class rep pays once, every classmate joins with a 6-character code — a subject's full exam-prep modules unlocked for the whole section.",
};

export default function ForBlocksPage() {
  return (
    <main className="min-h-screen bg-paper px-6 py-12 md:px-16 md:py-20">
      <div className="max-w-prose mx-auto">
        <BackLink href="/" label="Back to home" className="text-ink-muted hover:text-ink mb-10" />

        <p className="label-sm mb-4">For Class Reps</p>
        <h1 className="font-serif text-display-lg text-ink mb-3 leading-tight">
          Unlock a subject for your whole section
        </h1>
        <p className="font-sans text-base text-ink-muted leading-relaxed mb-8">
          ₱999 per semester — about ₱22 per student for a 45-person block. Your
          class rep pays once, and every classmate joins with a single class
          code.
        </p>

        <ul className="font-sans text-base text-ink-muted leading-relaxed space-y-3 mb-10">
          <li>✓ Full exam-prep modules for one subject, all semester</li>
          <li>✓ Every classmate joins with a single 6-character code</li>
          <li>✓ Class progress tracking for the rep</li>
        </ul>

        {/*
          Placeholder pending the real Facebook Messenger page link — replace
          PASTE_CONFIRMED_MESSENGER_LINK_HERE with the confirmed m.me URL
          before this page goes live.
        */}
        <a
          href="PASTE_CONFIRMED_MESSENGER_LINK_HERE"
          className="inline-block bg-accent text-paper font-sans text-sm px-6 py-3 hover:bg-ink transition-colors duration-150"
        >
          Message us to set up your block →
        </a>

        <p className="font-sans text-sm text-ink-faint mt-6">
          Already have a class code?{" "}
          <a
            href="/class/join"
            className="text-ink hover:text-accent transition-colors underline underline-offset-2"
          >
            Join here
          </a>
          .
        </p>
      </div>
    </main>
  );
}
