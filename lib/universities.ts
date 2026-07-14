// Catalog of universities we have landmark art for, plus case-insensitive
// matching from free-text profile.university values back to that art.
// Image files live at public/university-landmarks/<slug>.png — see
// docs/superpowers/specs/2026-07-14-university-landmark-dashboard-design.md.

export interface UniversityEntry {
  slug: string;
  name: string;
  aliases: string[];
  landmark?: string;
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
  { slug: "bisu", name: "Bohol Island State University", aliases: ["BISU"], landmark: "BISU Main Admin Building" },
  { slug: "norsu", name: "Negros Oriental State University", aliases: ["NORSU"], landmark: "Main Campus Pylon & Gate" },
  { slug: "asu", name: "Aklan State University", aliases: ["ASU"], landmark: "ASU Library Building" },
  { slug: "ssu", name: "Samar State University", aliases: ["SSU"], landmark: "SSU Main Admin Building" },
  { slug: "isatu", name: "Iloilo Science and Technology University", aliases: ["ISATU"], landmark: "Main Campus Admin & Gate" },
  { slug: "evsu", name: "Eastern Visayas State University", aliases: ["EVSU"], landmark: "EVSU Main Admin Building" },
  { slug: "uc", name: "University of Cebu", aliases: ["UC"], landmark: "UC Banilad Campus Facade" },
  { slug: "hnu", name: "Holy Name University", aliases: ["HNU"], landmark: "Church of the Immaculate Spouse" },
  { slug: "lnu", name: "Leyte Normal University", aliases: ["LNU"], landmark: "Brillo Hall (LNU Museum)" },
  { slug: "vsu", name: "Visayas State University", aliases: ["VSU"], landmark: "\"Malakas at Maganda\" Monument" },
  { slug: "siascc", name: "Siquijor State College", aliases: ["SIASCC"], landmark: "Admin Building" },
  { slug: "tca", name: "University of San Jose–Recoletos – Talavera Campus", aliases: ["TCA", "USJR Talavera"], landmark: "Talavera House of Prayer" },
  { slug: "uep", name: "University of Eastern Philippines", aliases: ["UEP"], landmark: "UEP Main Admin Building" },
  { slug: "ndu", name: "Notre Dame University", aliases: ["NDU"], landmark: "Burke Building" },
  { slug: "fsuu", name: "Father Saturnino Urios University", aliases: ["FSUU"], landmark: "FSUU CB / CBE Building" },
  { slug: "jrmsu", name: "Jose Rizal Memorial State University", aliases: ["JRMSU"], landmark: "Main Gate & Rizal Plaza" },
  { slug: "zppsu", name: "Zamboanga Peninsula Polytechnic State University", aliases: ["ZPPSU"], landmark: "Bernardo Ave Admin Building" },
  { slug: "usm", name: "University of Southern Mindanao", aliases: ["USM"], landmark: "Maguindanaon Welcome Gate" },
  { slug: "ldcu", name: "Liceo de Cagayan University", aliases: ["LDCU"], landmark: "Rodelsa Hall" },
  { slug: "xu", name: "Xavier University – Ateneo de Cagayan", aliases: ["XU", "Xavier University", "Ateneo de Cagayan"], landmark: "Lucas Hall" },
  { slug: "addu", name: "Ateneo de Davao University", aliases: ["ADDU", "Ateneo de Davao"], landmark: "Martin Hall" },
  { slug: "adzu", name: "Ateneo de Zamboanga University", aliases: ["ADZU", "Ateneo de Zamboanga"], landmark: "Chapel of the Sacred Heart" },
  { slug: "cmu", name: "Central Mindanao University", aliases: ["CMU"], landmark: "Main Entrance Gate" },
  { slug: "sksu", name: "Sultan Kudarat State University", aliases: ["SKSU"], landmark: "SKSU Admin Building" },
  { slug: "msugensan", name: "Mindanao State University – Gen. Santos", aliases: ["MSU-GenSan", "MSU Gensan", "MSU General Santos"], landmark: "MSU-Gensan Admin Building" },
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

export function landmarkLabel(entry: UniversityEntry | null): string {
  if (!entry) return "Campus building";
  return entry.landmark ?? entry.name;
}

export function universityImagePath(input: string | null): string {
  const match = matchUniversity(input);
  return match ? `/university-landmarks/${match.slug}.png` : DEFAULT_IMAGE_PATH;
}
