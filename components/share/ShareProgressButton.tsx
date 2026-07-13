"use client";

import { useEffect, useState } from "react";
import { fetchCompletedModules } from "@/lib/progress";
import { ShareProgressCard } from "./ShareProgressCard";

interface Props {
  subjectId: string;
  subjectTitle: string;
  moduleIds: string[];
}

// Subject-page "Share progress" entry point. Hidden until the device has
// completed at least one module in this subject.
export function ShareProgressButton({ subjectId, subjectTitle, moduleIds }: Props) {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetchCompletedModules(moduleIds).then((set) => {
      if (active) setCount(set.size);
    });
    return () => {
      active = false;
    };
  }, [moduleIds]);

  if (count === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border border-accent text-accent hover:bg-accent hover:text-paper font-mono text-label-md uppercase tracking-[0.1em] px-4 py-2.5 transition-colors duration-150"
      >
        <span aria-hidden="true">✦</span>
        <span>Share progress · {count} done</span>
      </button>
      {open && (
        <ShareProgressCard
          subjectId={subjectId}
          subjectTitle={subjectTitle}
          moduleIds={moduleIds}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
