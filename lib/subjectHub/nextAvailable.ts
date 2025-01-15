import { pickStartModule, type HubModule } from "./startHere";

// Where to send a student who opened a subject with nothing to read yet.
//
// The coming-soon state was a waitlist form and nothing else: a dead end with
// no lesson link. This picks a sibling subject in the same year that does have
// a lesson, preferring the same semester, then the nearest by sort order.

export interface HubSubject {
  id: string;
  title: string;
  sort_order: number;
  semester?: number | null;
}

export interface NextAvailable<S extends HubSubject = HubSubject, M extends HubModule = HubModule> {
  subject: S;
  module: M;
}

export function pickNextAvailableSubject<S extends HubSubject, M extends HubModule & { subject_id: string }>(
  currentSubjectId: string,
  yearSubjects: S[],
  modules: M[],
): NextAvailable<S, M> | null {
  const current = yearSubjects.find((s) => s.id === currentSubjectId);
  const bySubject = new Map<string, M[]>();
  for (const m of modules) {
    const list = bySubject.get(m.subject_id) ?? [];
    list.push(m);
    bySubject.set(m.subject_id, list);
  }

  const candidates = yearSubjects
    .filter((s) => s.id !== currentSubjectId)
    .map((s) => ({ s, pick: pickStartModule(bySubject.get(s.id) ?? []) }))
    .filter((c): c is { s: S; pick: NonNullable<typeof c.pick> } => c.pick !== null);

  if (candidates.length === 0) return null;

  const sameSemester = (s: S) =>
    current?.semester != null && s.semester === current.semester ? 0 : 1;
  const distance = (s: S) => (current ? Math.abs(s.sort_order - current.sort_order) : s.sort_order);

  candidates.sort(
    (a, b) =>
      sameSemester(a.s) - sameSemester(b.s) ||
      distance(a.s) - distance(b.s) ||
      a.s.sort_order - b.s.sort_order,
  );
  return { subject: candidates[0].s, module: candidates[0].pick.module };
}
