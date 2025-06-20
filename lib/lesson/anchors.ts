/** DOM id SectionRenderer puts on each section, so topics can link to it. */
export function sectionAnchor(sectionId: string) {
  return `sec-${sectionId}`;
}

/** Prefix shared by every section anchor, for querying them back out. */
export const SECTION_ANCHOR_PREFIX = "sec-";
