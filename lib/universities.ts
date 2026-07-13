// Catalog of universities we have landmark art for, plus case-insensitive
// matching from free-text profile.university values back to that art.
// Image files live at public/university-landmarks/<slug>.png — see
// docs/superpowers/specs/2026-07-14-university-landmark-dashboard-design.md.

export interface UniversityEntry {
  slug: string;
  name: string;
  aliases: string[];
}

export const UNIVERSITIES: UniversityEntry[] = [
  { slug: "adamson", name: "Adamson University", aliases: ["Adamson"] },
  { slug: "caraga", name: "Caraga State University", aliases: ["CSU Caraga", "Caraga State"] },
  { slug: "citu", name: "Cebu Institute of Technology – University", aliases: ["CIT-U", "CITU", "Cebu Institute of Technology"] },
  { slug: "cpu", name: "Central Philippine University", aliases: ["CPU"] },
  { slug: "dlsu", name: "De La Salle University", aliases: ["DLSU", "La Salle"] },
  { slug: "feu", name: "Far Eastern University", aliases: ["FEU"] },
  { slug: "mapua", name: "Mapúa University", aliases: ["Mapua", "Mapua University", "MIT Mapua"] },
  { slug: "msu", name: "Mindanao State University", aliases: ["MSU", "MSU Marawi"] },
  { slug: "msuiit", name: "Mindanao State University – Iligan Institute of Technology", aliases: ["MSU-IIT", "MSUIIT", "MSU IIT"] },
  { slug: "nu", name: "National University", aliases: ["NU"] },
  { slug: "plm", name: "Pamantasan ng Lungsod ng Maynila", aliases: ["PLM"] },
  { slug: "pup", name: "Polytechnic University of the Philippines", aliases: ["PUP"] },
  { slug: "siliman", name: "Silliman University", aliases: ["Silliman"] },
  { slug: "tup", name: "Technological University of the Philippines", aliases: ["TUP"] },
  { slug: "unor", name: "Universidad de Negros Oriental", aliases: ["UNO-R", "UNOR"] },
  { slug: "up", name: "University of the Philippines Diliman", aliases: ["UP", "UP Diliman", "UPD"] },
  { slug: "up-cebu", name: "University of the Philippines Cebu", aliases: ["UP Cebu", "UPC"] },
  { slug: "upv", name: "University of the Philippines Visayas", aliases: ["UPV", "UP Visayas"] },
  { slug: "usc", name: "University of San Carlos", aliases: ["USC"] },
  { slug: "usep", name: "University of Southeastern Philippines", aliases: ["USEP"] },
  { slug: "usjr", name: "University of San Jose–Recoletos", aliases: ["USJR", "University of San Jose-Recoletos"] },
  { slug: "usls", name: "University of St. La Salle", aliases: ["USLS", "St. La Salle Bacolod"] },
  { slug: "ust", name: "University of Santo Tomas", aliases: ["UST"] },
  { slug: "wmsu", name: "Western Mindanao State University", aliases: ["WMSU"] },
  { slug: "wvsu", name: "West Visayas State University", aliases: ["WVSU"] },
];

const DEFAULT_IMAGE_PATH = "/university-landmarks/default.png";

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export function matchUniversity(input: string | null): UniversityEntry | null {
  if (!input) return null;
  const needle = normalize(input);
  if (!needle) return null;

  for (const entry of UNIVERSITIES) {
    if (normalize(entry.name) === needle) return entry;
    if (entry.aliases.some((alias) => normalize(alias) === needle)) return entry;
  }
  return null;
}

export function universityImagePath(input: string | null): string {
  const match = matchUniversity(input);
  return match ? `/university-landmarks/${match.slug}.png` : DEFAULT_IMAGE_PATH;
}
