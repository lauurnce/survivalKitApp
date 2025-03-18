"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
// Only the module reader renders math, so KaTeX styles load here, not globally.
import "katex/dist/katex.min.css";

// A section body: GitHub-flavoured markdown with KaTeX math. Imported only
// through next/dynamic in SectionRenderer, so this stack ships in its own chunk.
export function BodyMarkdown({ body }: { body: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // Headings
        h1: ({ children }) => (
          <h1 className="max-w-prose font-serif text-2xl text-ink mt-8 mb-3 leading-tight">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="max-w-prose font-serif text-xl text-ink mt-6 mb-2 leading-tight">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="max-w-prose font-sans text-base font-semibold text-ink mt-5 mb-2 tracking-wide">{children}</h3>
        ),
        // Running text: main ink at a ~70-character measure (QA DS-12). Grey
        // body copy and 109-character lines made whole lessons tiring to read.
        // Code blocks and tables keep the full column width.
        p: ({ children }) => (
          <p className="max-w-prose font-sans text-base text-ink leading-relaxed mb-4">{children}</p>
        ),
        // Bold / italic
        strong: ({ children }) => (
          <strong className="font-semibold text-ink">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic">{children}</em>
        ),
        // Lists
        ul: ({ children }) => (
          <ul className="max-w-prose list-disc pl-5 space-y-1 mb-4 font-sans text-base text-ink">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="max-w-prose list-decimal pl-5 space-y-1 mb-4 font-sans text-base text-ink">{children}</ol>
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
          <blockquote className="max-w-prose border-l-2 border-accent pl-4 italic text-ink-muted mb-4">{children}</blockquote>
        ),
      }}
    >
      {body}
    </ReactMarkdown>
  );
}
