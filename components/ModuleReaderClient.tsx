"use client";

import { useMemo } from "react";
import { ModuleCompletionProvider } from "@/hooks/useModuleCompletion";
import { useFeedbackPrompt } from "@/hooks/useFeedbackPrompt";

interface ModuleReaderClientProps {
  moduleId: string;
  moduleTitle?: string;
  userId?: string | null;
  children: React.ReactNode;
}

export function ModuleReaderClient({
  moduleId,
  moduleTitle,
  userId,
  children,
}: ModuleReaderClientProps) {
  const { isOpen, currentModuleId, open, closeFeedback, markRated } =
    useFeedbackPrompt(moduleId);

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
