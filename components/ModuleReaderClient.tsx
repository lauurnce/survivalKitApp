'use client';

import { useEffect } from 'react';
import { FeedbackPrompt } from '@/components/FeedbackPrompt';
import { useFeedbackPrompt } from '@/hooks/useFeedbackPrompt';

interface ModuleReaderClientProps {
  moduleId: string;
  userId?: string | null;
  children: React.ReactNode;
}

export function ModuleReaderClient({
  moduleId,
  userId,
  children,
}: ModuleReaderClientProps) {
  const { isOpen, currentModuleId, trackModuleView, closeFeedback } = useFeedbackPrompt(moduleId);

  useEffect(() => {
    trackModuleView(moduleId);
  }, [moduleId, trackModuleView]);

  return (
    <>
      {children}
      <FeedbackPrompt
        isOpen={isOpen}
        moduleId={currentModuleId}
        onClose={closeFeedback}
        userId={userId}
      />
    </>
  );
}
