"use client";

import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fetchCompletedModules, setModuleCompleted } from "@/lib/progress";
import { ShareProgressCard } from "@/components/share/ShareProgressCard";

interface ShareContext {
  subjectId: string;
  subjectTitle: string;
  moduleTitle: string;
  moduleIds: string[];
}

interface Props {
  moduleId: string;
  /** When present, completing the module offers a share-card prompt. */
  share?: ShareContext;
}

const PROMPT_DISMISS_MS = 10_000;

// A compact "mark as done" toggle shown on each module row / module detail page.
// State is per-device and persisted via /api/progress.
export function ModuleDoneToggle({ moduleId, share }: Props) {
  const [done, setDone] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [prompt, setPrompt] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const promptTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (promptTimer.current) clearTimeout(promptTimer.current);
    };
  }, [moduleId]);

  function showPrompt() {
    setPrompt(true);
    if (promptTimer.current) clearTimeout(promptTimer.current);
    promptTimer.current = setTimeout(() => setPrompt(false), PROMPT_DISMISS_MS);
  }

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

    // Celebrate only confirmed completions (not un-marks, not failures).
    if (share && result === true) showPrompt();
  }

  return (
    <>
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

      {share && prompt && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4">
            <div className="flex items-center gap-3 bg-navy text-paper px-5 py-3 shadow-lg">
              <span className="font-sans text-sm">🎉 Nice! One more down.</span>
              <button
                type="button"
                onClick={() => {
                  setPrompt(false);
                  setDialogOpen(true);
                }}
                className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent hover:text-paper transition-colors duration-150"
              >
                Share your progress →
              </button>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setPrompt(false)}
                className="text-taupe hover:text-paper leading-none"
              >
                ×
              </button>
            </div>
          </div>,
          document.body
        )}

      {share && dialogOpen && (
        <ShareProgressCard
          subjectId={share.subjectId}
          subjectTitle={share.subjectTitle}
          moduleIds={share.moduleIds}
          moduleId={moduleId}
          moduleTitle={share.moduleTitle}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </>
  );
}
