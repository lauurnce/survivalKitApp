/**
 * School landmark registry for the dashboard hero illustration.
 *
 * TO ADD A SCHOOL:
 *   1. Drop the PNG at public/landmarks/<slug>.png (see public/landmarks/README.md)
 *   2. Add/extend the entry below and set `image: "/landmarks/<slug>.png"`.
 * Until `image` is set, the hero renders the generic fallback — never a broken image.
 */
export interface Landmark {
  slug: string;
  school: string;    // canonical display name (what the profile form suggests)
  landmark: string;  // name of the illustrated landmark, used as accessible label
  aliases: string[]; // abbreviations / alternate names, matched case-insensitively
  image?: string;    // set ONLY once the art file exists in public/landmarks/
}

export const FALLBACK_LANDMARK_IMAGE = "/landmarks/fallback.svg";

export const LANDMARKS: Landmark[] = [
  { slug: "pup", school: "Polytechnic University of the Philippines", landmark: "PUP Obelisk", aliases: ["pup", "pup sta mesa", "pup main"] },
  { slug: "up", school: "University of the Philippines", landmark: "The Oblation", aliases: ["up", "up diliman", "upd", "up los banos", "uplb", "up manila"] },
  { slug: "ust", school: "University of Santo Tomas", landmark: "UST Main Building", aliases: ["ust"] },
  { slug: "dlsu", school: "De La Salle University", landmark: "St. La Salle Hall", aliases: ["dlsu", "la salle"] },
  { slug: "admu", school: "Ateneo de Manila University", landmark: "Gate 2.5 / Church of the Gesu", aliases: ["admu", "ateneo"] },
  { slug: "ustp", school: "University of Science and Technology of Southern Philippines", landmark: "USTP Gymnasium Arch", aliases: ["ustp"] },
  { slug: "plv", school: "Pamantasan ng Lungsod ng Valenzuela", landmark: "PLV Main Building", aliases: ["plv"] },
  { slug: "catsu", school: "Catanduanes State University", landmark: "CatSU Main Gate", aliases: ["catsu", "csu catanduanes"] },
  { slug: "uep", school: "University of Eastern Pangasinan", landmark: "UEP Main Building", aliases: ["uep"] },
  { slug: "westmead", school: "Westmead International School", landmark: "Westmead Campus", aliases: ["westmead", "wis"] },
];

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

export function findLandmark(university: string | null | undefined): Landmark | null {
  if (!university) return null;
  const q = normalize(university);
  if (!q) return null;

  for (const l of LANDMARKS) {
    if (normalize(l.school) === q) return l;
    if (l.aliases.some((a) => normalize(a) === q)) return l;
  }
  // Containment pass for campus-suffixed variants ("UST Manila"). Longest
  // canonical name first so PUP wins over UP's substring.
  const byLength = [...LANDMARKS].sort(
    (a, b) => normalize(b.school).length - normalize(a.school).length,
  );
  for (const l of byLength) {
    const c = normalize(l.school);
    if (q.includes(c)) return l;
  }
  return null;
}

export function landmarkArt(l: Landmark | null): { src: string; label: string } {
  if (l?.image) return { src: l.image, label: l.landmark };
  return { src: FALLBACK_LANDMARK_IMAGE, label: "Campus building" };
}
