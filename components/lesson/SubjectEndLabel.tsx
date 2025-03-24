"use client";

import { useEffect, useState } from "react";
import { fetchCompletedModules } from "@/lib/progress";
import { useModuleCompletion } from "@/hooks/useModuleCompletion";

interface Props {
  /** Every module id in the subject. */
  moduleIds: string[];
  className?: string;
}

// The heading over the last module's footer. It said "You've finished this
// subject" to everyone, including a first-time, signed-out reader with nothing
// marked done (QA CT-14). The page is prerendered for every visitor, so it
// says "End of this subject" until this device's progress confirms every
// module is done, and checks again when the reader marks this one done.
export function SubjectEndLabel({ moduleIds, className }: Props) {
  const [finished, setFinished] = useState(false);
  // Opens right after a confirmed "mark done" on this page.
  const { isOpen } = useModuleCompletion();
  const key = moduleIds.join(",");

  useEffect(() => {
    if (moduleIds.length === 0) return;
    let active = true;
    fetchCompletedModules(moduleIds).then((done) => {
      if (active) setFinished(moduleIds.every((id) => done.has(id)));
    });
    return () => {
      active = false;
    };
    // moduleIds is server data, stable per page; key stands in for it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, isOpen]);

  return (
    <p className={className}>{finished ? "You’ve finished this subject" : "End of this subject"}</p>
  );
}
