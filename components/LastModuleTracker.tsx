"use client";

import { useEffect } from "react";

interface Props {
  moduleId: string;
  subjectId: string;
  yearId: string;
  moduleTitle: string;
  subjectTitle: string;
}

export function LastModuleTracker({
  moduleId,
  subjectId,
  yearId,
  moduleTitle,
  subjectTitle,
}: Props) {
  useEffect(() => {
    try {
      localStorage.setItem(
        "bsit_last_module",
        JSON.stringify({ moduleId, subjectId, yearId, moduleTitle, subjectTitle })
      );
    } catch {
      // localStorage unavailable (private browsing, storage full) — silent fail
    }
  }, [moduleId, subjectId, yearId, moduleTitle, subjectTitle]);

  return null;
}
