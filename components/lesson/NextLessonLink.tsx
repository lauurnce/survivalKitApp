"use client";

import Link from "next/link";
import { logEvent } from "@/lib/analytics";

export interface NextLessonTarget {
  href: string;
  title: string;
}

interface Props extends NextLessonTarget {
  /** The lesson being left, so continuation is measured per lesson. */
  moduleId: string;
  subjectId: string;
  yearId: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * A link to the next lesson that records `next_lesson_click` against the
 * lesson being left. `module_open` on the next lesson can't tell a reader who
 * tapped "next" from one who came back later via a group-chat link; this can.
 */
export function NextLessonLink({ href, title, moduleId, subjectId, yearId, className, children }: Props) {
  return (
    <Link
      href={href}
      prefetch={true}
      aria-label={`Next lesson: ${title}`}
      className={className}
      onClick={() => {
        void logEvent("next_lesson_click", { module_id: moduleId, subject_id: subjectId, year_id: yearId });
      }}
    >
      {children}
    </Link>
  );
}
