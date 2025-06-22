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

// Fires once per page view. Keyed on the ids, not on mount alone: if a
// client-side navigation from one lesson to the next ever reuses this
// instance instead of remounting it, the new lesson must still count.
// Repeat views of the same lesson inside 10 minutes are deduped server-side
// by record_visit, so back/forward cannot inflate the counters.
export function PageTracker({ event, yearId, subjectId, moduleId }: Props) {
  useEffect(() => {
    void logEvent(event, {
      year_id: yearId,
      subject_id: subjectId,
      module_id: moduleId,
    });
  }, [event, yearId, subjectId, moduleId]);

  return null;
}
