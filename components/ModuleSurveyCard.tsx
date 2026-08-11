"use client";

import { FeedbackPrompt } from "@/components/FeedbackPrompt";
import { useModuleCompletion } from "@/hooks/useModuleCompletion";

// The survey's slot in the module footer. It renders nothing until a confirmed
// "Mark done" opens it, so the reader is never asked before they've read.
export function ModuleSurveyCard() {
  const { isOpen, moduleId, moduleTitle, userId, dismissSurvey, markRated } =
    useModuleCompletion();

  if (!isOpen) return null;

  return (
    <div className="mb-10">
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
