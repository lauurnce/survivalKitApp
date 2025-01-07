"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchItems } from "@/lib/searchMatch";
import { logEvent } from "@/lib/analytics";
import { SEARCH_SETTLE_MS, normalizeSearchQuery } from "@/lib/analyticsSearch";

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
  /** Pre-computed keyword chips shown before the student types anything. */
  suggestions?: string[];
}

export function SearchClient({ items, suggestions = [] }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const seeded = useRef(false);
  // A ?q= link is a finished search, not one being typed: log it without
  // waiting for the settle delay.
  const settleNow = useRef(false);

  // /search?q=… (shared links, the landing page, site-search integrations)
  // opens with that query. Read from window.location rather than
  // useSearchParams so the page stays prerendered without a Suspense
  // boundary; the URL only exists post-mount anyway.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      settleNow.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(q);
    }
  }, []);

  // Mirror the query back into the URL so a search can be shared or
  // bookmarked. replaceState, not router.replace: no RSC round trip and no
  // history entry per keystroke.
  useEffect(() => {
    // Skip the first run: it sees the empty initial state, before the seed
    // above has landed, and would strip ?q= from the URL.
    if (!seeded.current) {
      seeded.current = true;
      return;
    }
    const url = new URL(window.location.href);
    const q = query.trim();
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    if (url.href !== window.location.href) {
      window.history.replaceState(window.history.state, "", url.href);
    }
  }, [query]);

  const trimmed = query.trim().toLowerCase();

  const results = useMemo(() => searchItems(items, trimmed), [items, trimmed]);

  // ── Search usage tracking ────────────────────────────────────────────────
  // A search "settles" SEARCH_SETTLE_MS after typing stops, on Enter, or when
  // a ?q= link opens. Each settled query is logged once as search_query (with
  // its result count), plus search_no_results when it found nothing. Only the
  // normalized query is sent (lib/analyticsSearch.ts) — never keystrokes.
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLogged = useRef<string | null>(null);

  const logSettled = useCallback((text: string, resultCount: number) => {
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
    const normalized = normalizeSearchQuery(text);
    // The same settled query twice in a row (a pause, then Enter) is one search.
    if (normalized === null || normalized === lastLogged.current) return;
    lastLogged.current = normalized;
    void logEvent("search_query", { search_query: normalized, result_count: resultCount });
    if (resultCount === 0) {
      void logEvent("search_no_results", { search_query: normalized, result_count: 0 });
    }
  }, []);

  useEffect(() => {
    if (trimmed === "") {
      // Clearing the box ends the search; typing the same words again later
      // is a new search.
      lastLogged.current = null;
      return;
    }
    const resultCount = results.length;
    if (settleNow.current) {
      settleNow.current = false;
      logSettled(trimmed, resultCount);
      return;
    }
    const timer = setTimeout(() => logSettled(trimmed, resultCount), SEARCH_SETTLE_MS);
    settleTimer.current = timer;
    return () => clearTimeout(timer);
  }, [trimmed, results.length, logSettled]);

  return (
    <div className="flex flex-col gap-8 max-w-wide">
      {/* Search input */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint font-sans text-lg select-none">
          ⌕
        </span>
        <input
          type="search"
          data-search-input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // Enter jumps straight to the top match — fastest path for
            // returning students who know what they're looking for.
            if (e.key === "Enter") {
              logSettled(trimmed, results.length);
              if (results.length > 0) {
                e.preventDefault();
                router.push(results[0].href);
              }
            }
          }}
          placeholder="Search subjects and modules…"
          className="w-full bg-transparent border border-ink-faint focus:border-navy outline-none font-sans text-base text-ink placeholder:text-ink-faint pl-11 pr-4 py-4 transition-colors duration-150"
          aria-label="Search subjects and modules"
        />
      </div>

      {/* Results */}
      {trimmed === "" ? (
        suggestions.length > 0 ? (
          <div className="flex flex-col gap-4">
            <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
              Popular topics
            </p>
            <div className="flex flex-wrap gap-2" aria-label="Popular searches">
              {suggestions.map((keyword) => (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => setQuery(keyword)}
                  className="border border-ink-faint/40 px-3 py-1.5 font-mono text-label-sm uppercase tracking-[0.12em] text-ink-muted transition-colors duration-150 hover:border-navy hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="font-sans text-sm text-ink-muted">
            Start typing to find a subject or module by name.
          </p>
        )
      ) : results.length === 0 ? (
        <div className="flex flex-col gap-4">
          {/* break-words: a pasted URL or a 300-character query used to
              push the page sideways (QA FL-08). */}
          <p className="font-sans text-sm text-ink-muted break-words [overflow-wrap:anywhere]">
            No matches for{" "}
            <span className="text-ink">&ldquo;{query.trim()}&rdquo;</span>.
            Try a shorter keyword, or browse by year instead.
          </p>
          <Link
            href="/year"
            prefetch={true}
            className="inline-flex items-center gap-2 font-sans text-sm text-ink hover:text-accent transition-colors duration-150"
          >
            <span>Browse all subjects</span>
            <span className="text-accent" aria-hidden="true">→</span>
          </Link>
        </div>
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
                prefetch={true}
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
