"use client";

import { useEffect, useMemo } from "react";
import { ModuleCompletionProvider } from "@/hooks/useModuleCompletion";
import { useFeedbackPrompt } from "@/hooks/useFeedbackPrompt";
import { useSession } from "@/hooks/useSession";

interface ModuleReaderClientProps {
  moduleId: string;
  moduleTitle?: string;
  children: React.ReactNode;
}

export function ModuleReaderClient({
  moduleId,
  moduleTitle,
  children,
}: ModuleReaderClientProps) {
  // The reader page is prerendered, so the session arrives after hydration.
  const { userId } = useSession();
  const { isOpen, currentModuleId, open, closeFeedback, markRated } =
    useFeedbackPrompt(moduleId);

  // Arriving from a "Submit quality feedback" link (?feedback=1) is an
  // explicit request: open the survey on mount even if the cooldown or the
  // rated-module list would normally hold it back. ModuleSurveyCard scrolls
  // itself into view for this same param.
  useEffect(() => {
    if (
      new URLSearchParams(window.location.search).get("feedback") === "1"
    ) {
      open({ force: true });
    }
  }, [open]);

  const value = useMemo(
    () => ({
      isOpen,
      moduleId: currentModuleId,
      moduleTitle,
      userId,
      notifyCompleted: open,
      dismissSurvey: closeFeedback,
      markRated,
    }),
    [isOpen, currentModuleId, moduleTitle, userId, open, closeFeedback, markRated]
  );

  return <ModuleCompletionProvider value={value}>{children}</ModuleCompletionProvider>;
}
