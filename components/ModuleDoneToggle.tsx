"use client";

import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { fetchCompletedModules, setModuleCompleted } from "@/lib/progress";

interface Props {
  moduleId: string;
}

// A compact "mark as done" toggle shown on each module row / module detail page.
// State is per-device and persisted via /api/progress.
export function ModuleDoneToggle({ moduleId }: Props) {
  const [done, setDone] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    fetchCompletedModules([moduleId]).then((set) => {
      if (active) {
        setDone(set.has(moduleId));
        setLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, [moduleId]);

  async function toggle(e: MouseEvent) {
    // Prevent the surrounding <Link> from navigating when used inside a row.
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;

    const optimistic = !done;
    setDone(optimistic);
    setPending(true);
    const result = await setModuleCompleted(moduleId, optimistic);
    if (result !== null) setDone(result);
    else setDone(!optimistic); // revert on failure
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={done}
      title={done ? "Mark as not done" : "Mark as done"}
      className={`shrink-0 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-label-sm uppercase tracking-[0.12em] transition-colors duration-150 ${
        done
          ? "border-accent bg-accent/10 text-accent"
          : "border-ink-faint/40 text-ink-faint hover:border-ink hover:text-ink"
      } ${!loaded ? "opacity-50" : ""}`}
    >
      <span aria-hidden="true">{done ? "✓" : "○"}</span>
      <span>{done ? "Done" : "Mark done"}</span>
    </button>
  );
}
