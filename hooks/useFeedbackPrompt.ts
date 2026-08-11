'use client';

import { useState, useEffect, useCallback } from 'react';

const LAST_PROMPT_KEY = 'last-feedback-prompt';
const RATED_MODULES_KEY = 'rated-modules';
const PROMPT_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    // Blocked storage must not break the reader.
    return null;
  }
}

// An older payload or a truncated write can leave anything at all under this
// key. `open()` runs synchronously inside the "Mark done" handler, so a throw
// here takes the share-progress prompt down with it.
function readRatedModules(): string[] {
  try {
    const parsed: unknown = JSON.parse(readRaw(RATED_MODULES_KEY) ?? 'null');
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function isOnCooldown(now: number): boolean {
  const raw = readRaw(LAST_PROMPT_KEY);
  if (!raw) return false;
  const last = Number.parseInt(raw, 10);
  return Number.isFinite(last) && now - last < PROMPT_COOLDOWN_MS;
}

/**
 * Owns whether the end-of-module survey is showing.
 *
 * The open state is deliberately NOT persisted. The survey only ever opens for
 * a completion the reader confirmed on this page, so the single thing storage
 * could buy is surviving a mid-survey reload of the same module — and that is
 * worth far less than the failure it costs: a stale `isOpen` greeting the next
 * reader with a survey on mount, before they have read a word. What does need
 * to outlive the page is the memory of having asked: the rated-module list and
 * the 24h cooldown, both read below.
 */
export function useFeedbackPrompt(moduleId: string | null) {
  const [openFor, setOpenFor] = useState<string | null>(null);

  // Moving to another module inside the same reader retires the old survey.
  useEffect(() => {
    setOpenFor(null);
  }, [moduleId]);

  // Called by the completion event, never on mount.
  const open = useCallback(() => {
    if (!moduleId) return;

    const now = Date.now();
    if (isOnCooldown(now)) return;
    if (readRatedModules().includes(moduleId)) return;

    try {
      localStorage.setItem(LAST_PROMPT_KEY, now.toString());
    } catch {
      // Losing the cooldown stamp is better than losing the reader's page.
    }
    setOpenFor(moduleId);
  }, [moduleId]);

  const closeFeedback = useCallback(() => {
    setOpenFor(null);
  }, []);

  const markRated = useCallback(() => {
    if (!moduleId) return;
    const rated = readRatedModules();
    if (rated.includes(moduleId)) return;
    try {
      localStorage.setItem(RATED_MODULES_KEY, JSON.stringify([...rated, moduleId]));
    } catch {
      // Non-fatal: the 24h cooldown still holds the survey back.
    }
  }, [moduleId]);

  return {
    isOpen: openFor !== null && openFor === moduleId,
    currentModuleId: moduleId,
    open,
    closeFeedback,
    markRated,
  };
}
