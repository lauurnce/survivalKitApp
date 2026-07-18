'use client';

import { useState, useEffect, useCallback } from 'react';

interface FeedbackPromptState {
  isOpen: boolean;
  currentModuleId: string | null;
  modules: string[];
}

const STORAGE_KEY = 'feedback-prompt-state';
const LAST_PROMPT_KEY = 'last-feedback-prompt';
const PROMPT_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useFeedbackPrompt(moduleId: string | null) {
  const [state, setState] = useState<FeedbackPromptState>({
    isOpen: false,
    currentModuleId: moduleId,
    modules: [],
  });

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setState(JSON.parse(stored));
    }
  }, []);

  // Track module view and check if should show prompt
  const trackModuleView = useCallback((id: string) => {
    const lastPromptTime = localStorage.getItem(LAST_PROMPT_KEY);
    const now = Date.now();

    // Don't show if cooldown active
    if (lastPromptTime && now - parseInt(lastPromptTime, 10) < PROMPT_COOLDOWN_MS) {
      return;
    }

    setState((prev) => {
      const newModules = [...prev.modules, id];
      const randomTrigger = Math.floor(Math.random() * 3) + 3; // 3–5

      if (newModules.length >= randomTrigger) {
        // Reset counter and open prompt
        localStorage.setItem(LAST_PROMPT_KEY, now.toString());
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          isOpen: true,
          currentModuleId: id,
          modules: [],
        }));
        return {
          isOpen: true,
          currentModuleId: id,
          modules: [],
        };
      }

      // Update state
      const newState = { ...prev, modules: newModules, currentModuleId: id };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const closeFeedback = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  return {
    isOpen: state.isOpen,
    currentModuleId: state.currentModuleId,
    trackModuleView,
    closeFeedback,
  };
}
