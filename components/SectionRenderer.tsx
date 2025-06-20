"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
// Only the module reader renders math, so KaTeX styles load here, not globally.
import "katex/dist/katex.min.css";
import { LockedReviewer } from "./LockedReviewer";
import { ProBadge } from "./ProBadge";
import { LockIcon } from "./ProIcons";
import { logEvent, logSectionView } from "@/lib/analytics";
import { sectionAnchor } from "@/lib/lesson/anchors";
import { buildUnlockHref, modulePath } from "@/lib/subscribeRedirect";
import type { TopologyData } from "@/lib/topology/types";

const Playground = dynamic(
  () => import("./ide/Playground").then((m) => ({ default: m.Playground })),
  { ssr: false, loading: () => <div className="h-48 bg-ink-faint/10 animate-pulse" /> }
);

const TopologyViewer = dynamic(
  () => import("./topology/TopologyViewer").then(m => ({ default: m.TopologyViewer })),
  { ssr: false, loading: () => <div className="h-56 bg-ink-faint/10 animate-pulse" /> }
);

interface Section {
  id: string;
  kind: string;
  heading: string;
  body_md: string;
  sort_order: number;
  ide_language?: "python" | "sql" | "java" | "c" | null;
  starter_code?: string | null;
  topology_data?: TopologyData | null;
}

interface Props {
  section: Section;
  index: number;
  moduleId: string;
  yearId: string;
  subjectId: string;
  unlockAll: boolean;
  subjectTitle?: string;
  /**
   * The subject's free-sample reviewers (lib/freeSample.ts), in sort order;
   * rendered in full even when locked. The upsell sits under the last one.
   */
  freeSectionIds?: string[];
  /** Total gated reviewers in the subject — shown in the free-sample upsell. */
  reviewerCount?: number;
  /**
   * False once the reader is known to have access (or is mid-payment, or is
   * a signed-in reader whose status is still loading): the free-sample label
   * and "Unlock all reviewers" card are for readers who have not paid.
   * Defaults to true — the prerendered locked view.
   */
  showUpsell?: boolean;
}

export function SectionRenderer({ section, index, moduleId, yearId, subjectId, unlockAll, subjectTitle, freeSectionIds = [], reviewerCount, showUpsell = true }: Props) {
  useEffect(() => {
    if (section.kind === "content") {
      logSectionView(section.id, moduleId);
    }
  }, [section.id, section.kind, moduleId]);

  const isFreeSample =
    section.kind === "activity" && !unlockAll && freeSectionIds.includes(section.id);
  // When the sample is every reviewer the subject has (Operating Systems: 3 of
  // 3), there is no "rest" to unlock: render the reviewers as plain content,
  // with no sample label and no upsell (QA CT-07).
  const sampleIsEverything =
    reviewerCount !== undefined && reviewerCount > 0 && freeSectionIds.length >= reviewerCount;
  const showSampleChrome = isFreeSample && !sampleIsEverything;
  const isLastFreeSample =
    showSampleChrome && freeSectionIds[freeSectionIds.length - 1] === section.id;

  // Where payment should drop the reader back — this very module page.
  const returnPath = modulePath(yearId, subjectId, moduleId);

  function handleUnlockClick() {
    void logEvent("unlock_click", { year_id: yearId, subject_id: subjectId });
  }

  if (section.kind === "activity" && !unlockAll && !isFreeSample) {
    return (
      <section id={sectionAnchor(section.id)} className="print-section scroll-mt-20" data-kind={section.kind}>
        {/* Locked preview: the server only ever sent the heading, so the
            blurred layer is that heading plus decorative ghost lines — never
            gated bodies. The overlay chip is deliberately inert (no link, no
            pointer events); the actionable row stays in LockedReviewer below. */}
        {/* On paper a locked reviewer is just its title and a note — there is
            no body to print, and the blurred preview prints as noise. */}
        <p className="hidden print:block font-serif text-lg text-ink">
          {String(index + 1).padStart(2, "0")} — {section.heading}
          <span className="block font-sans text-sm text-ink-muted">
            Pro reviewer — not included in this printout.
          </span>
        </p>
        <div className="relative print:hidden">
          <div className="select-none pointer-events-none opacity-60 blur-[1px]">
            <div className="flex items-baseline gap-4 mb-5">
              <span className="label-sm shrink-0">{String(index + 1).padStart(2, "0")}</span>
              <h2 className="font-serif text-2xl md:text-3xl text-ink leading-tight">{section.heading}</h2>
            </div>
            <div className="pl-10 md:pl-12 space-y-3" aria-hidden="true">
              <div className="h-3 w-3/4 bg-ink-faint/20" />
              <div className="h-3 w-2/3 bg-ink-faint/20" />
              <div className="h-3 w-1/2 bg-ink-faint/20" />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="flex items-center gap-2 border border-amber-300/60 bg-paper/90 px-4 py-2 shadow-sm dark:border-amber-300/25">
              <LockIcon className="h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-400" />
              <ProBadge />
              <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-muted">
                Pro activity
              </span>
            </span>
          </div>
        </div>
        <div className="pl-10 md:pl-12 mt-6 print:hidden">
          <LockedReviewer yearId={yearId} subjectId={subjectId} from={returnPath} />
        </div>
      </section>
    );
  }

  return (
    <section id={sectionAnchor(section.id)} className="print-section scroll-mt-20" data-kind={section.kind}>
      <div className="flex items-baseline gap-4 mb-6">
        <span className="label-sm shrink-0">{String(index + 1).padStart(2, "0")}</span>
        <h2 className="font-serif text-2xl md:text-3xl text-ink leading-tight">{section.heading}</h2>
      </div>
      <div className="pl-10 md:pl-12">
        <BodyMarkdown body={section.body_md} />
      </div>
      {section.topology_data && (
        <div className="mt-6 pl-10 md:pl-12">
          <TopologyViewer data={section.topology_data} />
        </div>
      )}
      {section.ide_language && (
        <div className="mt-6 pl-10 md:pl-12">
          <div className="print:hidden">
            <Playground
              languageId={section.ide_language}
              initialCode={section.starter_code ?? undefined}
              moduleId={moduleId}
            />
          </div>
          {/* The editor is interactive-only; paper gets the starter code. */}
          {section.starter_code && (
            <pre className="hidden print:block font-mono text-sm p-4">
              <code>{section.starter_code}</code>
            </pre>
          )}
        </div>
      )}
      {section.kind === "activity" && unlockAll && (
        <div className="mt-4 pl-10 md:pl-12">
          <span className="label-sm text-accent">Activity (UNLOCK_ALL active)</span>
        </div>
      )}
      {showSampleChrome && !isLastFreeSample && showUpsell && (
        <div className="mt-4 pl-10 md:pl-12">
          <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent">
            Free sample
          </span>
        </div>
      )}
      {isLastFreeSample && showUpsell && (
        <div className="mt-6 pl-10 md:pl-12 print:hidden">
          <div className="border border-accent/40 bg-accent/[0.03] p-5">
            <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent mb-2">
              Free Sample
            </p>
            <p className="font-sans text-base text-ink-muted mb-4">
              That was the free sample: {freeSectionIds.length} of {reviewerCount || "several"}{" "}
              reviewers with answer keys in {subjectTitle ?? "this subject"}. Unlock the rest for
              the semester.
            </p>
            <Link
              href={buildUnlockHref({ yearId, subjectId, from: returnPath })}
              onClick={handleUnlockClick}
              className="inline-block bg-accent text-paper font-sans text-sm px-4 py-3 hover:bg-ink transition-colors duration-150"
            >
              Unlock all reviewers →
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

function BodyMarkdown({ body }: { body: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // Headings
        h1: ({ children }) => (
          <h1 className="font-serif text-2xl text-ink mt-8 mb-3 leading-tight">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="font-serif text-xl text-ink mt-6 mb-2 leading-tight">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="font-sans text-base font-semibold text-ink mt-5 mb-2 tracking-wide">{children}</h3>
        ),
        // Paragraphs
        p: ({ children }) => (
          <p className="font-sans text-base text-ink-muted leading-relaxed mb-4">{children}</p>
        ),
        // Bold / italic
        strong: ({ children }) => (
          <strong className="font-semibold text-ink">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-ink-muted">{children}</em>
        ),
        // Lists
        ul: ({ children }) => (
          <ul className="list-disc pl-5 space-y-1 mb-4 font-sans text-base text-ink-muted">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 space-y-1 mb-4 font-sans text-base text-ink-muted">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        // Code blocks
        pre: ({ children }) => (
          <pre className="bg-ink text-paper font-mono text-sm p-4 overflow-x-auto leading-relaxed rounded-none mb-4 whitespace-pre">
            {children}
          </pre>
        ),
        code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) =>
          inline ? (
            <code className="font-mono text-sm bg-ink-faint/20 text-ink px-1 py-0.5 rounded">{children}</code>
          ) : (
            <code>{children}</code>
          ),
        // Tables
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4">
            <table className="w-full font-sans text-sm border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="border-b border-ink-faint">{children}</thead>,
        tbody: ({ children }) => <tbody className="divide-y divide-ink-faint/30">{children}</tbody>,
        th: ({ children }) => (
          <th className="text-left py-2 pr-4 font-semibold text-ink label-sm">{children}</th>
        ),
        td: ({ children }) => (
          <td className="py-2 pr-4 text-ink-muted">{children}</td>
        ),
        // Horizontal rule
        hr: () => <hr className="border-ink-faint/30 my-6" />,
        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-accent pl-4 italic text-ink-muted mb-4">{children}</blockquote>
        ),
      }}
    >
      {body}
    </ReactMarkdown>
  );
}
