# University Landmark Catalog Expansion (+25 schools) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 25 more Philippine universities (Visayas/Mindanao-heavy) to the existing landmark catalog built in `docs/superpowers/plans/2026-07-14-university-landmark-dashboard.md`, bringing the total to 50 schools + default, and introduce an optional `landmark` display-name field now that real per-school landmark names/descriptions are available.

**Architecture:** Same pipeline as the original plan: resize source PNGs with `sips`, add entries to `lib/universities.ts`'s existing `UNIVERSITIES` array, extend `UniversityEntry` with an optional `landmark?: string` field (backward compatible — existing 25 entries are untouched and simply omit it), and use it as the image's `title`/richer `alt` text in `LandmarkArt` and `ProfileCard` when present.

**Tech Stack:** Same as the original plan — Next.js 15, React 19, TypeScript, Vitest + Testing Library, macOS `sips`.

## Global Constraints

- All constraints from the original plan (`docs/superpowers/plans/2026-07-14-university-landmark-dashboard.md`) still apply: exact case/whitespace-insensitive matching (no fuzzy), unmatched/empty → default image always, free text always submittable, assets under `public/university-landmarks/<slug>.png`.
- The existing 25 `UNIVERSITIES` entries and their consumers (`ProfileCard.tsx`, `LandmarkArt.tsx`) must not regress — `landmark` is optional and additive only.
- `tca` (University of San Jose–Recoletos, Talavera Campus) gets a **distinct canonical name** — `"University of San Jose–Recoletos – Talavera Campus"` — so it never collides with the existing `usjr` entry (`"University of San Jose–Recoletos"`). A student typing the plain name still matches the original `usjr`.
- Source images live in `assets/additional university landmarks/` (25 PNGs + a populated `list of uni.txt` manifest with names/landmarks/descriptions per school) — this directory is untracked scratch material, not itself part of the repo's history.

---

### Task 1: Resize and relocate the 25 new landmark images

**Files:**
- Create: `public/university-landmarks/bisu.png`, `norsu.png`, `asu.png`, `ssu.png`, `isatu.png`, `evsu.png`, `uc.png`, `hnu.png`, `lnu.png`, `vsu.png`, `siascc.png`, `tca.png`, `uep.png`, `ndu.png`, `fsuu.png`, `jrmsu.png`, `zppsu.png`, `usm.png`, `ldcu.png`, `xu.png`, `addu.png`, `adzu.png`, `cmu.png`, `sksu.png`, `msugensan.png` (25 files)

**Interfaces:**
- Produces: static files reachable at `/university-landmarks/<slug>.png`, same convention as the original 25.

- [ ] **Step 1: Resize each source PNG to max-width 800px into the existing public directory**

```bash
resize_to() {
  src="$1"
  dest="$2"
  cp "$src" "$dest"
  sips --resampleWidth 800 "$dest" >/dev/null
}

SRC="assets/additional university landmarks"
DST="public/university-landmarks"

resize_to "$SRC/bisu cream.png"        "$DST/bisu.png"
resize_to "$SRC/norsu cream.png"       "$DST/norsu.png"
resize_to "$SRC/asu cream.png"         "$DST/asu.png"
resize_to "$SRC/ssu cream.png"         "$DST/ssu.png"
resize_to "$SRC/isatu cream.png"       "$DST/isatu.png"
resize_to "$SRC/evsu cream.png"        "$DST/evsu.png"
resize_to "$SRC/uc cream.png"          "$DST/uc.png"
resize_to "$SRC/hnu cream.png"         "$DST/hnu.png"
resize_to "$SRC/lnu cream.png"         "$DST/lnu.png"
resize_to "$SRC/vsu cream.png"         "$DST/vsu.png"
resize_to "$SRC/siascc cream.png"      "$DST/siascc.png"
resize_to "$SRC/tca cream.png"         "$DST/tca.png"
resize_to "$SRC/uep cream.png"         "$DST/uep.png"
resize_to "$SRC/ndu cream.png"         "$DST/ndu.png"
resize_to "$SRC/fsuu cream.png"        "$DST/fsuu.png"
resize_to "$SRC/jrmsu.png"             "$DST/jrmsu.png"
resize_to "$SRC/zppsu cream.png"       "$DST/zppsu.png"
resize_to "$SRC/usm cream.png"         "$DST/usm.png"
resize_to "$SRC/ldcu cream.png"        "$DST/ldcu.png"
resize_to "$SRC/xu cream.png"          "$DST/xu.png"
resize_to "$SRC/addu cream.png"        "$DST/addu.png"
resize_to "$SRC/adzu cream.png"        "$DST/adzu.png"
resize_to "$SRC/cmu cream.png"         "$DST/cmu.png"
resize_to "$SRC/sksu cream.png"        "$DST/sksu.png"
resize_to "$SRC/msugensan cream .png"  "$DST/msugensan.png"
```

Note: `jrmsu.png` has no "cream" suffix in the source filename (unlike the rest) — the resize_to call above already accounts for this (`"$SRC/jrmsu.png"`, not `"$SRC/jrmsu cream.png"`).

- [ ] **Step 2: Verify all 25 files exist and are non-trivial size**

```bash
ls public/university-landmarks/{bisu,norsu,asu,ssu,isatu,evsu,uc,hnu,lnu,vsu,siascc,tca,uep,ndu,fsuu,jrmsu,zppsu,usm,ldcu,xu,addu,adzu,cmu,sksu,msugensan}.png | wc -l
```

Expected: 25.

```bash
find public/university-landmarks -newer public/university-landmarks/default.png -size -1k
```

Expected: empty output (no truncated files among the newly added ones).

- [ ] **Step 3: Verify total catalog image count is now 51 (50 schools + default)**

```bash
ls public/university-landmarks/*.png | wc -l
```

Expected: 51.

- [ ] **Step 4: Commit**

```bash
git add public/university-landmarks/
git commit -m "feat: add 25 more university landmark images (Visayas/Mindanao)"
```

---

### Task 2: Add `landmark` field to UniversityEntry and the 25 new catalog entries

**Files:**
- Modify: `lib/universities.ts`
- Modify: `lib/universities.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: extends `UniversityEntry` with `landmark?: string`. Adds a new exported helper `landmarkLabel(entry: UniversityEntry | null): string` that returns `entry.landmark ?? entry.name` when an entry is given, or `"Campus building"` when `null` (mirrors the old retired `lib/landmarks.ts`'s fallback label behavior, restoring that UX now that real landmark names exist).

- [ ] **Step 1: Write the failing test**

Add to `lib/universities.test.ts` (append — do not remove existing tests):

```ts
describe("UNIVERSITIES catalog — expansion", () => {
  it("has exactly 50 entries after the expansion", () => {
    expect(UNIVERSITIES).toHaveLength(50);
  });

  it("still has all unique slugs", () => {
    const slugs = UNIVERSITIES.map((u) => u.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("tca has a distinct canonical name from usjr (no collision)", () => {
    const usjr = UNIVERSITIES.find((u) => u.slug === "usjr");
    const tca = UNIVERSITIES.find((u) => u.slug === "tca");
    expect(usjr?.name).toBe("University of San Jose–Recoletos");
    expect(tca?.name).toBe("University of San Jose–Recoletos – Talavera Campus");
    expect(usjr?.name).not.toBe(tca?.name);
  });

  it("every new entry's image file exists in public/university-landmarks", () => {
    const newSlugs = [
      "bisu", "norsu", "asu", "ssu", "isatu", "evsu", "uc", "hnu", "lnu", "vsu",
      "siascc", "tca", "uep", "ndu", "fsuu", "jrmsu", "zppsu", "usm", "ldcu",
      "xu", "addu", "adzu", "cmu", "sksu", "msugensan",
    ];
    for (const slug of newSlugs) {
      const file = path.join(process.cwd(), "public", "university-landmarks", `${slug}.png`);
      expect(existsSync(file), `missing image for ${slug}`).toBe(true);
    }
  });
});

describe("matchUniversity — expansion", () => {
  it("matches a new school by exact canonical name", () => {
    expect(matchUniversity("Bohol Island State University")?.slug).toBe("bisu");
  });

  it("matches tca specifically, not usjr, for its distinct name", () => {
    expect(matchUniversity("University of San Jose–Recoletos – Talavera Campus")?.slug).toBe("tca");
  });

  it("matching the plain USJR name still resolves to usjr, not tca", () => {
    expect(matchUniversity("University of San Jose–Recoletos")?.slug).toBe("usjr");
  });
});

describe("landmarkLabel", () => {
  it("returns the specific landmark name when present", () => {
    const bisu = UNIVERSITIES.find((u) => u.slug === "bisu")!;
    expect(landmarkLabel(bisu)).toBe("BISU Main Admin Building");
  });

  it("falls back to the school name when no landmark is set (original 25 entries)", () => {
    const ust = UNIVERSITIES.find((u) => u.slug === "ust")!;
    expect(landmarkLabel(ust)).toBe("University of Santo Tomas");
  });

  it("returns a generic label when given null", () => {
    expect(landmarkLabel(null)).toBe("Campus building");
  });
});
```

Add these imports at the top of `lib/universities.test.ts` if not already present:

```ts
import { existsSync } from "fs";
import path from "path";
import { UNIVERSITIES, matchUniversity, universityImagePath, landmarkLabel } from "./universities";
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run lib/universities.test.ts
```

Expected: FAIL — `landmarkLabel` is not exported, and the array has 25 entries, not 50.

- [ ] **Step 3: Extend the UniversityEntry type and add landmarkLabel**

In `lib/universities.ts`, change the interface:

```ts
export interface UniversityEntry {
  slug: string;
  name: string;
  aliases: string[];
  landmark?: string;
}
```

Add this function after `matchUniversity`:

```ts
export function landmarkLabel(entry: UniversityEntry | null): string {
  if (!entry) return "Campus building";
  return entry.landmark ?? entry.name;
}
```

- [ ] **Step 4: Append the 25 new entries to the UNIVERSITIES array**

Add these entries to the end of the `UNIVERSITIES` array in `lib/universities.ts` (after `wvsu`, before the closing `];`):

```ts
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
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npx vitest run lib/universities.test.ts
```

Expected: PASS — all tests green, including the new expansion describe blocks.

- [ ] **Step 6: Commit**

```bash
git add lib/universities.ts lib/universities.test.ts
git commit -m "feat: expand university catalog with 25 Visayas/Mindanao schools + landmark labels"
```

---

### Task 3: Use landmarkLabel in LandmarkArt and ProfileCard

**Files:**
- Modify: `components/dashboard/LandmarkArt.tsx`
- Modify: `components/dashboard/LandmarkArt.test.tsx`
- Modify: `components/account/ProfileCard.tsx`
- Modify: `components/account/ProfileCard.test.tsx`

**Interfaces:**
- Consumes: `landmarkLabel` from `lib/universities.ts` (Task 2).
- Produces: no prop-shape changes — both components' external interfaces are unchanged; only the `title`/`alt` text they compute internally improves.

- [ ] **Step 1: Write the failing test for LandmarkArt**

Add to `components/dashboard/LandmarkArt.test.tsx`:

```tsx
it("uses the specific landmark name as the image title when available", () => {
  render(<LandmarkArt university="Bohol Island State University" />);
  const img = screen.getByRole("img");
  expect(img).toHaveAttribute("title", "BISU Main Admin Building");
});

it("falls back to the school name as title for entries without a landmark label", () => {
  render(<LandmarkArt university="University of Santo Tomas" />);
  const img = screen.getByRole("img");
  expect(img).toHaveAttribute("title", "University of Santo Tomas");
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run components/dashboard/LandmarkArt.test.tsx
```

Expected: FAIL — current `LandmarkArt.tsx` computes `label` as `matchUniversity(university)?.name ?? "Campus building"`, which already happens to pass the UST case but not the BISU case (no `landmark` awareness yet), so the BISU-specific test fails.

- [ ] **Step 3: Update LandmarkArt to use landmarkLabel**

In `components/dashboard/LandmarkArt.tsx`, change the import:

```tsx
import { matchUniversity, universityImagePath, landmarkLabel } from "@/lib/universities";
```

And change the label computation from:

```tsx
  const label = matchUniversity(university)?.name ?? "Campus building";
```

to:

```tsx
  const label = landmarkLabel(matchUniversity(university));
```

- [ ] **Step 4: Run the LandmarkArt test to verify it passes**

```bash
npx vitest run components/dashboard/LandmarkArt.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Write the failing test for ProfileCard's banner alt text**

Add to `components/account/ProfileCard.test.tsx` (append to the existing landmark banner describe block):

```tsx
it("uses the specific landmark name as alt text when the school has one", () => {
  render(
    <ProfileCard
      profile={{
        firstName: "Juan",
        lastName: "Dela Cruz",
        age: null,
        gender: null,
        university: "Bohol Island State University",
        major: null,
        pathways: [],
      }}
    />
  );
  const img = screen.getByRole("img", { name: /bisu main admin building/i });
  expect(img).toHaveAttribute("src", expect.stringContaining("bisu"));
});
```

- [ ] **Step 6: Run the test to verify it fails**

```bash
npx vitest run components/account/ProfileCard.test.tsx
```

Expected: FAIL — `ProfileCard.tsx` currently sets `alt={profile.university || "University landmark"}`, i.e. the raw typed string ("Bohol Island State University"), not the landmark label ("BISU Main Admin Building").

- [ ] **Step 7: Update ProfileCard to use landmarkLabel for the banner's alt text**

In `components/account/ProfileCard.tsx`, add to the existing import from `@/lib/universities`:

```tsx
import { universityImagePath, matchUniversity, landmarkLabel } from "@/lib/universities";
```

Change the `<Image>` tag's `alt` prop from:

```tsx
              alt={profile.university || "University landmark"}
```

to:

```tsx
              alt={landmarkLabel(matchUniversity(profile.university))}
```

- [ ] **Step 8: Run the test to verify it passes**

```bash
npx vitest run components/account/ProfileCard.test.tsx
```

Expected: PASS — including the pre-existing test `renders the default landmark image when university is unmatched` (that test queries by name `/cavite state university/i` — check this still passes; since `landmarkLabel(null)` returns `"Campus building"`, not the raw typed string, this pre-existing test's name-matcher will need updating in this same step if it breaks — change its `getByRole("img", { name: /cavite state university/i })` to `getByRole("img", { name: /campus building/i })` to match the new, more informative fallback label. Same for the `null` university test currently matching `/university landmark/i` — update to `/campus building/i` as well, since `landmarkLabel(null)` is now the single source of the fallback text).

- [ ] **Step 9: Run the full test suite**

```bash
npx vitest run
```

Expected: all tests pass, no regressions.

- [ ] **Step 10: Commit**

```bash
git add components/dashboard/LandmarkArt.tsx components/dashboard/LandmarkArt.test.tsx components/account/ProfileCard.tsx components/account/ProfileCard.test.tsx
git commit -m "feat: show specific landmark names as image labels when available"
```

---

### Task 4: Verify in the running app, then remove the source folder

**Files:**
- Remove: `assets/additional university landmarks/` (entire directory, including `list of uni.txt`)

**Interfaces:**
- Consumes: the running dev server, Tasks 1-3's code and assets.
- Produces: nothing (cleanup + verification task).

- [ ] **Step 1: Start the dev server with the file-based profile store (avoids touching live Supabase data)**

```bash
PROFILE_STORE=file PORT=3100 npm run dev
```

Expected: server starts on `http://localhost:3100`.

- [ ] **Step 2: Sign in (or reuse an existing dev session) and open the account profile page**

Navigate to `/account/profile`. Open the edit modal.

- [ ] **Step 3: Verify a new school matches and its specific landmark renders**

Set University to "Bohol Island State University" via the combobox, save. Confirm the `ProfileCard` banner shows the BISU art, and hovering/inspecting the image shows accessible name "BISU Main Admin Building" (not just the school name).

- [ ] **Step 4: Verify the dashboard hero shows the same image and label**

Navigate to `/account`. Confirm the `HeroCard`'s landmark art also shows the BISU image (same source, same label logic).

- [ ] **Step 5: Verify tca resolves distinctly from usjr**

Set University to "University of San Jose–Recoletos" (no campus suffix) — confirm it shows the *original* USJR art (`usjr.png`), not the Talavera campus art. Then set it to "University of San Jose–Recoletos – Talavera Campus" — confirm it now shows `tca.png` and the Talavera House of Prayer label.

- [ ] **Step 6: Stop the dev server, then remove the source folder**

```bash
rm -rf "assets/additional university landmarks"
```

- [ ] **Step 7: Confirm the app still builds**

```bash
npx vitest run
npm run build
```

Expected: tests pass, build succeeds.

- [ ] **Step 8: Confirm no dangling references and commit any residual test-file updates if needed**

```bash
git status --short
```

If clean (the source folder was untracked, so removing it produces no diff), no commit is needed for this step. If `git status` shows anything else outstanding, commit it with an appropriate message before finishing.

---

## Self-Review Notes

- **Spec coverage:** Image pipeline → Task 1. Catalog + landmark field + matching (including the tca/usjr collision fix) → Task 2. Consumer wiring (LandmarkArt + ProfileCard alt/title text) → Task 3. Manual verification + cleanup → Task 4.
- **No placeholders:** every step has literal code/commands.
- **Type consistency:** `UniversityEntry` (now with optional `landmark?: string`), `landmarkLabel(entry: UniversityEntry | null): string` signature identical everywhere referenced (Tasks 2, 3).
- **Backward compatibility check:** the original 25 entries are untouched (no `landmark` field added to them), and `landmarkLabel` falls back to `.name` when `landmark` is absent — verified this doesn't change existing behavior for those 25 schools except for the two now-updated test expectations in Task 3 Step 8 (the unmatched/null fallback label text changes from "Cavite State University"/"University landmark" to "Campus building", which is a deliberate, more-consistent improvema — flagged explicitly in that step so the implementer doesn't miss it).
