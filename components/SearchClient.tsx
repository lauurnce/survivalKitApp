"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export interface SearchItem {
  type: "subject" | "module";
  id: string;
  title: string;
  href: string;
  // Breadcrumb context, e.g. "1st Year" or "1st Year · Data Structures"
  context: string;
}

interface Props {
  items: SearchItem[];
}

export function SearchClient({ items }: Props) {
  const [query, setQuery] = useState("");

  const trimmed = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!trimmed) return [];
    return items
      .filter(
        (item) =>
          item.title.toLowerCase().includes(trimmed) ||
          item.context.toLowerCase().includes(trimmed)
      )
      .slice(0, 50);
  }, [items, trimmed]);

  return (
    <div className="flex flex-col gap-8 max-w-wide">
      {/* Search input */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint font-sans text-lg select-none">
          ⌕
        </span>
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search subjects and modules…"
          className="w-full bg-transparent border border-ink-faint focus:border-navy outline-none font-sans text-base text-ink placeholder:text-ink-faint pl-11 pr-4 py-4 transition-colors duration-150"
          aria-label="Search subjects and modules"
        />
      </div>

      {/* Results */}
      {trimmed === "" ? (
        <p className="font-sans text-sm text-ink-muted">
          Start typing to find a subject or module by name.
        </p>
      ) : results.length === 0 ? (
        <p className="font-sans text-sm text-ink-muted">
          No matches for{" "}
          <span className="text-ink">&ldquo;{query.trim()}&rdquo;</span>.
        </p>
      ) : (
        <>
          <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          <div className="flex flex-col divide-y divide-ink-faint/30 -mt-2">
            {results.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.href}
                className="group flex items-start gap-6 py-6 hover:bg-ink/[0.02] -mx-4 px-4 transition-colors duration-150"
              >
                <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mt-1 w-16 shrink-0">
                  {item.type}
                </span>
                <div className="flex-1">
                  <h2 className="font-serif text-xl text-ink group-hover:text-accent transition-colors duration-150 mb-1">
                    {item.title}
                  </h2>
                  <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
                    {item.context}
                  </span>
                </div>
                <span className="font-sans text-sm text-ink-faint group-hover:text-ink transition-colors mt-1">
                  →
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
