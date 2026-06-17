"use client";

import { useEffect, useState } from "react";
import { fetchCompletedModules } from "@/lib/progress";

interface Props {
  // All module ids belonging to this subject (resolved server-side).
  moduleIds: string[];
}

// Per-subject progress bar: completed / total modules for the current device.
// Module ids are passed in from the server component; completion is fetched
// client-side because the device_id only exists in the browser.
export function SubjectProgressBar({ moduleIds }: Props) {
  const [completed, setCompleted] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const total = moduleIds.length;

  useEffect(() => {
    if (total === 0) {
      setLoaded(true);
      return;
    }
    let active = true;
    fetchCompletedModules(moduleIds).then((set) => {
      if (!active) return;
      let count = 0;
      for (const id of moduleIds) if (set.has(id)) count++;
      setCompleted(count);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
    // moduleIds is derived from server data and stable per render of this subject
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleIds.join(",")]);

  if (total === 0) return null;

  const pct = loaded ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mt-3 max-w-xs">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
          Progress
        </span>
        <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-muted">
          {loaded ? `${completed} / ${total}` : "—"}
        </span>
      </div>
      <div className="h-1.5 w-full bg-ink-faint/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-[width] duration-300"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={completed}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`${completed} of ${total} modules done`}
        />
      </div>
    </div>
  );
}
