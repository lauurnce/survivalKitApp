// The free sample: what a locked visitor gets in full, so they can feel the
// paid loop before deciding (docs/superpowers/specs/
// 2026-07-25-august-conversion-package-design.md, workstream 3).
//
// Rule: EVERY activity section — drills, worked solutions, code lab — of the
// first module (by the caller's module ordering) that has any activity
// sections. For Computer Programming 1 that is all of Lesson 1's reviewers.
// Everything after it stays headings-only, gated server-side by the reader
// page, which is the only place activity bodies are fetched for locked
// visitors — so this function IS the free-sample boundary.
//
// Returned ids are ordered by sort_order, so the last id is the final free
// reviewer (where the upsell sits).
export function pickFreeActivities(
  orderedModuleIds: string[],
  sections: { id: string; module_id: string; sort_order: number }[]
): string[] {
  for (const moduleId of orderedModuleIds) {
    const candidates = sections.filter((s) => s.module_id === moduleId);
    if (candidates.length === 0) continue;
    return [...candidates].sort((a, b) => a.sort_order - b.sort_order).map((s) => s.id);
  }
  return [];
}

// Which of the free-sample ids belong to the module being rendered — the only
// sections whose full bodies the reader page may fetch for a locked visitor.
// Anything not in the module's own activity list is ignored, so a free id from
// another module can never pull a body into this page.
export function freeIdsInModule(moduleActivityIds: string[], freeIds: string[]): string[] {
  const free = new Set(freeIds);
  return moduleActivityIds.filter((id) => free.has(id));
}
