"use client";

import { useEffect, useRef, useState } from "react";

// A markdown table that may be wider than the reader column (QA DS-13). It
// scrolls sideways, and while there is more to the right it shows a fade on
// the right edge and a "Scroll →" hint. Both are absolutely positioned (the
// hint sits in the wrapper's bottom margin), so they never move the layout.
export function ScrollTable({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro?.disconnect();
    };
  }, []);

  return (
    <div className="relative mb-8" data-scroll-table={more ? "more" : "end"}>
      <div
        ref={ref}
        // Focusable so keyboard users can scroll it; labelled for screen readers.
        tabIndex={0}
        role="region"
        aria-label="Table (scrolls sideways)"
        className="overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        {children}
      </div>
      {more && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-paper to-transparent print:hidden"
          />
          <p
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-full mt-1 font-mono text-label-sm uppercase tracking-[0.12em] text-ink-muted print:hidden"
          >
            Scroll →
          </p>
        </>
      )}
    </div>
  );
}
