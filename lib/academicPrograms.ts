// Canonical academic program names, plus lookup from the free-text variants
// that have accumulated in profile.major. Twelve profiles currently render
// as four different majors — BS Information Technology (9),
// BS INFORMATION TECHNOLOGY (1), BSIT (1), BS Information technology (1) —
// purely from capitalisation and abbreviation differences. This module
// collapses known variants to one label at both read time (existing rows)
// and write time (lib/profile.ts's validateProfile).
//
// canonicalProgram is a total function: an unrecognised program is returned
// trimmed, never dropped and never coerced to a lossy bucket like "Other" —
// a student on a program we haven't listed must still show up as that
// program.
//
// The app (README: "Study companion web app for BSIT ... students in the
// Philippines") is scoped to one program, so the list below deliberately
// holds only the entry backed by real, observed data. Anyone on a different
// program (a handful of outliers, or a program this list hasn't caught up
// to yet) is served by the free-text escape in the picker, not by inventing
// unverified sibling programs here.

import { matchUniversity } from "./universities";

export interface ProgramEntry {
  canonical: string;
  aliases: string[];
}

export const PROGRAMS: ProgramEntry[] = [
  {
    canonical: "BS Information Technology",
    aliases: ["BSIT", "BS Information Technology", "BS Info Tech"],
  },
];

// Uppercases and strips everything but letters and digits, so
// "BS Information Technology", "BS  information-technology", and
// "bs.information.technology" all collapse to the same lookup key.
function normalize(s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

const PROGRAM_LOOKUP = new Map<string, string>();
for (const entry of PROGRAMS) {
  for (const alias of entry.aliases) {
    PROGRAM_LOOKUP.set(normalize(alias), entry.canonical);
  }
}

export function canonicalProgram(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "Not specified";
  const hit = PROGRAM_LOOKUP.get(normalize(trimmed));
  return hit ?? trimmed;
}

export function canonicalUniversity(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "Not specified";
  const match = matchUniversity(trimmed);
  return match ? match.name : trimmed;
}
