import { notFound, permanentRedirect } from "next/navigation";
import { modulePath } from "@/lib/subscribeRedirect";
import { isUuid } from "@/lib/validation";

// One lesson, one URL.
//
// The reader lives at /year/<year>/subjects/<subject>/modules/<module>, but
// the pages used to look rows up by the last id alone, so any year id (and,
// for the module list, any subject id) in front of a real id still rendered
// the full page with a 200. Search engines saw duplicate URLs, and the
// breadcrumbs and share links built from the path pointed at the wrong year.
//
// These verdicts compare the path against the rows the page already fetched:
// - every id matches its real parent   -> "ok", render
// - the target exists under other ids  -> "redirect" (308) to its real URL,
//   so links shared before the fix keep working
// - the target does not exist          -> "notFound" (404)

export type ChainVerdict =
  | { kind: "ok"; path: string }
  | { kind: "redirect"; path: string }
  | { kind: "notFound" };

export function subjectsPath(yearId: string): string {
  return `/year/${yearId}/subjects`;
}

export function modulesPath(yearId: string, subjectId: string): string {
  return `/year/${yearId}/subjects/${subjectId}/modules`;
}

/** True when every id in the path is a well-formed UUID: no row can match otherwise. */
export function wellFormedIds(...ids: string[]): boolean {
  return ids.every((id) => isUuid(id));
}

/** A subject row as the modules list fetches it: its id and real year. */
export interface SubjectParent {
  id: string;
  year_id: string;
}

/** The module list: /year/<year>/subjects/<subject>/modules. */
export function subjectChain(
  requested: { yearId: string; subjectId: string },
  subject: SubjectParent | null | undefined,
): ChainVerdict {
  if (!subject || subject.id !== requested.subjectId || !subject.year_id) return { kind: "notFound" };
  const path = modulesPath(subject.year_id, subject.id);
  return subject.year_id === requested.yearId ? { kind: "ok", path } : { kind: "redirect", path };
}

/** Where a module really lives: its own id, its subject, and that subject's year. */
export interface ModuleOwner {
  moduleId: string;
  subjectId: string;
  yearId: string;
}

/** The lesson reader: /year/<year>/subjects/<subject>/modules/<module>. */
export function moduleChain(
  requested: { yearId: string; subjectId: string; moduleId: string },
  owner: ModuleOwner | null | undefined,
): ChainVerdict {
  if (!owner || owner.moduleId !== requested.moduleId || !owner.subjectId || !owner.yearId) {
    return { kind: "notFound" };
  }
  const path = modulePath(owner.yearId, owner.subjectId, owner.moduleId);
  const exact = owner.subjectId === requested.subjectId && owner.yearId === requested.yearId;
  return exact ? { kind: "ok", path } : { kind: "redirect", path };
}

/**
 * Acts on a verdict inside a page: 404s or permanently redirects (308), and
 * otherwise returns the canonical path. Both throw, so they must run before
 * anything renders — and no loading.tsx may sit above the page, or the 200
 * shell streams first and the status is lost.
 */
export function enforceChain(verdict: ChainVerdict): string {
  if (verdict.kind === "notFound") notFound();
  if (verdict.kind === "redirect") permanentRedirect(verdict.path);
  return verdict.path;
}
