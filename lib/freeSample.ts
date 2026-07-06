// The one activity section per subject that locked visitors get in full — a
// taste of what the paid reviewers look like. Selection: first module (by the
// caller's module ordering) that has any activity section, then that module's
// lowest sort_order activity.
export function pickFirstActivity(
  orderedModuleIds: string[],
  sections: { id: string; module_id: string; sort_order: number }[]
): string | null {
  for (const moduleId of orderedModuleIds) {
    const candidates = sections.filter((s) => s.module_id === moduleId);
    if (candidates.length === 0) continue;
    candidates.sort((a, b) => a.sort_order - b.sort_order);
    return candidates[0].id;
  }
  return null;
}
