"use client";

import { createContext, useContext } from "react";

export interface ModuleCompletionValue {
  isOpen: boolean;
  moduleId: string | null;
  moduleTitle?: string;
  userId?: string | null;
  notifyCompleted: () => void;
  dismissSurvey: () => void;
  markRated: () => void;
}

const noop = () => {};

// Default is inert so <ModuleDoneToggle> can live on pages with no survey
// (the modules list) without a provider and without blowing up.
const ModuleCompletionContext = createContext<ModuleCompletionValue>({
  isOpen: false,
  moduleId: null,
  notifyCompleted: noop,
  dismissSurvey: noop,
  markRated: noop,
});

export const ModuleCompletionProvider = ModuleCompletionContext.Provider;

export function useModuleCompletion(): ModuleCompletionValue {
  return useContext(ModuleCompletionContext);
}
