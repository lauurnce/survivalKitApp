/**
 * Subject read totals, derived from module reads (QA CT-12).
 *
 * The subject cards used to show the subject's own `read_count`, which counts
 * opens of the subject's module-list page (`subject_open`). Most readers never
 * see that page: they deep-link into a lesson from the landing page, a shared
 * link or "Popular right now", which records only a module read. So a subject
 * could show fewer reads than its own first lesson (CP1: 5.7k vs 6.4k).
 *
 * A subject's "reads" is now the sum of its modules' reads: every lesson open
 * across the subject, counted the same way as the module rows beneath it, so
 * a subject can never trail one of its own lessons. Year cards keep their
 * distinct metric, unique devices, and its distinct label, "readers".
 */
export function sumReadsBySubject(
  moduleIdsBySubject: ReadonlyMap<string, readonly string[]>,
  moduleCounters: ReadonlyArray<{ resource_id: string; read_count: number }>,
): Map<string, number> {
  const readsByModule = new Map(moduleCounters.map((c) => [c.resource_id, c.read_count]));
  const totals = new Map<string, number>();
  for (const [subjectId, moduleIds] of moduleIdsBySubject) {
    totals.set(
      subjectId,
      moduleIds.reduce((sum, id) => sum + (readsByModule.get(id) ?? 0), 0),
    );
  }
  return totals;
}
