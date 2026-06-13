"use client";

import { useEffect } from "react";
import { logEvent } from "@/lib/analytics";
import type { EventType } from "@/lib/supabase/types";

interface Props {
  event: EventType;
  yearId?: string;
  subjectId?: string;
  moduleId?: string;
}

export function PageTracker({ event, yearId, subjectId, moduleId }: Props) {
  useEffect(() => {
    logEvent(event, {
      year_id: yearId,
      subject_id: subjectId,
      module_id: moduleId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
