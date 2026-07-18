# University landmark photo on the dashboard

## Problem

The account dashboard (`ProfileCard`) shows the student's name, school, and
pathways as plain text — no visual identity. We have landmark illustrations
for 25 Philippine universities sitting in `assets/university_landmark/`
(not web-servable) plus a "default" fallback pair, but nothing wires them to
a student's profile. Profile setup also asks for university as a bare free
text field, so students have to type their school's exact name with no
guidance, and we can't reliably match variant spellings/casing back to an
asset.

## Goals

- Show the right landmark photo on the dashboard, derived from
  `profile.university`, case- and whitespace-insensitively.
- Unmatched or empty university → the "default" landmark, never a broken
  image or no image.
- Profile setup gets a searchable list of known schools (scroll + type to
  filter) while still accepting fully free-form text for schools not in the
  list.
- Keep `profiles.university` as a plain string (no schema/migration change,
  no enum constraint) — matching happens in application code, not the DB.

## Non-goals

- No autocomplete/geocoding against a real-world university database beyond
  our 25 known schools.
- No admin UI for managing the university list — it's a static source file.
- Not attempting to support every Philippine HEI; only the 25 we have art
  for, plus default.

## University catalog

New `lib/universities.ts`, a pure data + matching module:

```ts
export interface UniversityEntry {
  slug: string;       // "ust", "up-cebu" — matches public/university-landmarks/<slug>.png
  name: string;        // canonical full name, used to populate the picker
  aliases: string[];   // abbreviations / common alt-spellings
}

export const UNIVERSITIES: UniversityEntry[];

// Case-insensitive, whitespace-trimmed exact match against name or any
// alias. No fuzzy/partial matching for the RESULT (partial matching is only
// used for the picker's live filter, see below) — a student who types
// "University of Sto. Tomas" and means UST but doesn't hit a listed alias
// falls through to default, same as any other unmatched school.
export function matchUniversity(input: string | null): UniversityEntry | null;

// Wraps matchUniversity + the default fallback into a ready-to-render path.
export function universityImagePath(input: string | null): string;
```

The 25 entries (confirmed with user):

| slug | canonical name |
|---|---|
| adamson | Adamson University |
| caraga | Caraga State University |
| citu | Cebu Institute of Technology – University |
| cpu | Central Philippine University |
| dlsu | De La Salle University |
| feu | Far Eastern University |
| mapua | Mapúa University |
| msu | Mindanao State University |
| msuiit | Mindanao State University – Iligan Institute of Technology |
| nu | National University |
| plm | Pamantasan ng Lungsod ng Maynila |
| pup | Polytechnic University of the Philippines - Main Campus|
| siliman | Silliman University |
| tup | Technological University of the Philippines |
| unor | Universidad de Negros Oriental |
| up | University of the Philippines Diliman |
| up-cebu | University of the Philippines Cebu |
| upv | University of the Philippines Visayas |
| usc | University of San Carlos |
| usep | University of Southeastern Philippines |
| usjr | University of San Jose–Recoletos |
| usls | University of St. La Salle |
| ust | University of Santo Tomas |
| wmsu | Western Mindanao State University |
| wvsu | West Visayas State University |

Each entry's `aliases` includes at minimum its abbreviation slug in
uppercase and common short forms (e.g. `ust` → `["UST"]`,
`dlsu` → `["DLSU", "La Salle"]`). Kept intentionally small — this is not
meant to be exhaustive, just cover the obvious cases.

## Asset pipeline

1. Resize the 25 "cream" variant PNGs (skip "transparent" — unused) to a
   dashboard-appropriate max width (~800px) and re-compress, cutting them
   from 1.3–2.4MB down to a reasonable web size.
2. `git mv` (post-resize) into `public/university-landmarks/<slug>.png`
   using the slugs above — fixes the inconsistent source filenames (stray
   spaces like `"caraga cream .png"`, `"msu transparent .png"`).
3. `default.png` goes in the same folder as the no-match fallback.
4. Remove the now-empty `assets/university_landmark/` directory (including
   the empty `list_of_uni.txt`) once the new location is verified working.

## Profile setup picker

New client component `components/account/UniversityCombobox.tsx`:

- Renders a text input (`name="university"`, same form field contract as
  today) plus a dropdown list beneath it, shown while focused.
- List filters live via case-insensitive substring match against
  `UNIVERSITIES[].name` as the user types.
- Clicking a list item sets the input's value to that entry's canonical
  `name` and closes the dropdown.
- The user can ignore the list entirely and type any custom text — on
  submit, whatever string is in the input is sent as `university`, exactly
  like today. No validation requiring a list match.
- Swapped into `EditProfileModal` in place of the current plain
  `<input name="university">`. No changes to `lib/profile.ts` validation or
  the `profiles` table.

## Dashboard display

In `ProfileCard.tsx`'s populated (non-empty) state:

- Add a banner image above the name/school text, using `next/image` (local
  `public/` asset, so it needs zero remote-pattern config) sized as a
  `16:9`-ish crop with rounded top corners matching the card's own
  `rounded-xl`.
- Source: `universityImagePath(profile.university)`.
- No image in the empty/"Set up your profile" state — there's no
  university to key off yet.

## Testing

- `lib/universities.test.ts`: matching is case-insensitive, trims
  whitespace, matches on alias, unknown/empty input returns `null` from
  `matchUniversity` and the default path from `universityImagePath`.
- Manual dev verification: set profile university to (a) an exact catalog
  name, (b) a known alias in different casing, (c) an unmatched free-text
  school, (d) empty — confirm the dashboard renders the correct image (or
  default) in each case, and confirm the picker filters and still accepts
  free text.

## Files touched

- New: `lib/universities.ts`, `lib/universities.test.ts`,
  `components/account/UniversityCombobox.tsx`
- New: `public/university-landmarks/*.png` (26 files: 25 schools + default)
- Removed: `assets/university_landmark/` (after verifying the new location)
- Modified: `components/account/ProfileCard.tsx` (banner image, swap in
  combobox)
