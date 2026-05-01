import { getYears, getSubjectsByYear, getModulesBySubject } from "@/lib/cache/queries";

// First-years are 82% of readers and Computer Programming 1 is the subject
// they read and buy most; its Lesson 1 is also where the free sample lives
// (lib/freeSample.ts). The landing page leads with a straight path into it.
//
// Looked up by stable keys rather than ids: the first year by sort_order, the
// subject by slug, the lesson by module order.
export const CP1_SLUG = "computer-programming-1";

export interface StartPath {
  href: string;
  subjectTitle: string;
  moduleTitle: string;
}

export async function getCp1StartPath(): Promise<StartPath | null> {
  try {
    const years = (await getYears()) as { id: string; sort_order: number }[];
    const firstYear = [...years].sort((a, b) => a.sort_order - b.sort_order)[0];
    if (!firstYear) return null;

    const subjects = await getSubjectsByYear(firstYear.id);
    const cp1 = subjects.find((s) => s.slug === CP1_SLUG);
    if (!cp1) return null;

    const modules = await getModulesBySubject(cp1.id);
    const lesson1 = [...modules].sort((a, b) => a.sort_order - b.sort_order)[0];
    if (!lesson1) return null;

    return {
      href: `/year/${firstYear.id}/subjects/${cp1.id}/modules/${lesson1.id}`,
      subjectTitle: cp1.title,
      moduleTitle: lesson1.title,
    };
  } catch {
    // The landing page must still render if the lookup fails; it falls back to
    // the all-subjects entry point.
    return null;
  }
}
