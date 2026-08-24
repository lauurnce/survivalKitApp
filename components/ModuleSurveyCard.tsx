"use client";

import { useEffect, useRef } from "react";
import { FeedbackPrompt } from "@/components/FeedbackPrompt";
import { useModuleCompletion } from "@/hooks/useModuleCompletion";

// The survey's slot in the module footer. It renders nothing until a confirmed
// "Mark done" opens it, so the reader is never asked before they've read.
export function ModuleSurveyCard() {
  const { isOpen, moduleId, moduleTitle, userId, dismissSurvey, markRated } =
    useModuleCompletion();
  const cardRef = useRef<HTMLDivElement>(null);

  // A "Submit quality feedback" link lands the reader at the top of a long
  // article with the survey rendered down here — bring it into view. Regular
  // completions already have the reader's eyes at the "Mark done" toggle just
  // above, so only the ?feedback=1 entry scrolls.
  useEffect(() => {
    if (!isOpen) return;
    if (
      new URLSearchParams(window.location.search).get("feedback") !== "1"
    ) {
      return;
    }
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="mb-10" ref={cardRef}>
      <FeedbackPrompt
        isOpen={isOpen}
        moduleId={moduleId}
        moduleTitle={moduleTitle}
        onClose={dismissSurvey}
        onSubmit={markRated}
        userId={userId}
      />
    </div>
  );
}
