# University Landmark Dashboard Photo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a matched university landmark photo on the account dashboard's `ProfileCard`, keyed off the student's free-text `profile.university` field, with a searchable-but-freeform school picker in profile setup.

**Architecture:** A pure data+matching module (`lib/universities.ts`) maps 25 known Philippine universities (canonical name + aliases + image slug) and exposes a case/whitespace-insensitive lookup plus a ready-to-render image path (defaulting to a fallback graphic). A new `UniversityCombobox` client component replaces the plain university text input in the profile edit modal — it filters a dropdown of the 25 names live while still accepting arbitrary free text. `ProfileCard`'s populated state renders a banner image above the name using `next/image` against a static asset in `public/`.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Vitest + Testing Library (jsdom), Tailwind, macOS `sips` for one-time image resizing (no new dependencies).

## Global Constraints

- `profiles.university` stays a plain unconstrained string — no DB migration, no enum, no schema change.
- Matching is exact (case-insensitive, trimmed) against canonical name or alias — no fuzzy/partial matching for the *result*. Partial/substring matching is only used for the picker's live filter UI.
- Unmatched or empty university must always resolve to the default image — never a broken `<img>` or missing file.
- Free text must always remain submittable in the picker — selecting a list item is a convenience, not a requirement.
- Static images must live under `public/` (Next.js does not serve `assets/`) at `public/university-landmarks/<slug>.png`.
- No new npm dependencies; use `sips` (built into macOS) for image resizing.

---

### Task 1: Resize and relocate university landmark images

**Files:**
- Create: `public/university-landmarks/adamson.png`, `caraga.png`, `citu.png`, `cpu.png`, `dlsu.png`, `feu.png`, `mapua.png`, `msu.png`, `msuiit.png`, `nu.png`, `plm.png`, `pup.png`, `siliman.png`, `tup.png`, `unor.png`, `up.png`, `up-cebu.png`, `upv.png`, `usc.png`, `usep.png`, `usjr.png`, `usls.png`, `ust.png`, `wmsu.png`, `wvsu.png`, `default.png` (26 files)
- Remove (after verification in Task 6): `assets/university_landmark/`

**Interfaces:**
- Produces: static files reachable at runtime via URL path `/university-landmarks/<slug>.png` (Next.js serves everything under `public/` from `/`).

This task has no automated test — it's a file operation. Verification happens visually in Task 6 (dev server) and structurally in Task 2's test (asserting every catalog slug has a file on disk).

- [ ] **Step 1: Create the destination directory**

```bash
mkdir -p public/university-landmarks
```

- [ ] **Step 2: Resize each "cream" source PNG to max-width 800px and write it to the new location with a clean slug name**

Run this from the repo root. `sips --resampleWidth` only shrinks when the source is wider than the target (it will not upscale), so this is safe even if a source is already small.

```bash
resize_to() {
  src="$1"
  dest="$2"
  cp "$src" "$dest"
  sips --resampleWidth 800 "$dest" >/dev/null
}

SRC="assets/university_landmark"
DST="public/university-landmarks"

resize_to "$SRC/adamson cream.png"          "$DST/adamson.png"
resize_to "$SRC/caraga cream .png"          "$DST/caraga.png"
resize_to "$SRC/citu cream.png"             "$DST/citu.png"
resize_to "$SRC/cpu cream.png"              "$DST/cpu.png"
resize_to "$SRC/dlsu cream.png"             "$DST/dlsu.png"
resize_to "$SRC/feu cream.png"              "$DST/feu.png"
resize_to "$SRC/mapua cream.png"            "$DST/mapua.png"
resize_to "$SRC/msu cream.png"              "$DST/msu.png"
resize_to "$SRC/msuiit cream.png"           "$DST/msuiit.png"
resize_to "$SRC/nu cream.png"               "$DST/nu.png"
resize_to "$SRC/plm cream.png"              "$DST/plm.png"
resize_to "$SRC/pup w: background.png"      "$DST/pup.png"
resize_to "$SRC/siliman cream.png"          "$DST/siliman.png"
resize_to "$SRC/tup cream.png"              "$DST/tup.png"
resize_to "$SRC/unor cream.png"             "$DST/unor.png"
resize_to "$SRC/up cream.png"               "$DST/up.png"
resize_to "$SRC/up cebu cream.png"          "$DST/up-cebu.png"
resize_to "$SRC/upv cream.png"              "$DST/upv.png"
resize_to "$SRC/usc cream.png"              "$DST/usc.png"
resize_to "$SRC/usep cream.png"             "$DST/usep.png"
resize_to "$SRC/usjr cream.png"             "$DST/usjr.png"
resize_to "$SRC/usls cream.png"             "$DST/usls.png"
resize_to "$SRC/ust cream.png"              "$DST/ust.png"
resize_to "$SRC/wmsu cream.png"             "$DST/wmsu.png"
resize_to "$SRC/wvsu cream.png"             "$DST/wvsu.png"
resize_to "$SRC/default cream.png"          "$DST/default.png"
```

Note: `pup` has no "cream" variant on disk (only "transparent" and "w: background") — the design calls for the cream variant, and `pup w: background.png` is the closest opaque-background equivalent, so it's used here.

- [ ] **Step 3: Verify all 26 files exist and are non-trivial size**

```bash
ls -la public/university-landmarks/ | wc -l
```

Expected: 28 (26 files + `.` + `..` entries), and:

```bash
find public/university-landmarks -size -1k
```

Expected: empty output (nothing under 1KB — confirms `sips` didn't write empty/broken files).

- [ ] **Step 4: Verify a sample file shrank in dimensions**

```bash
sips -g pixelWidth public/university-landmarks/dlsu.png
```

Expected: `pixelWidth: 800` (down from the source's 1448).

- [ ] **Step 5: Stage and commit**

```bash
git add public/university-landmarks/
git commit -m "feat: add resized university landmark images to public/"
```

---

### Task 2: University catalog and matching logic

**Files:**
- Create: `lib/universities.ts`
- Create: `lib/universities.test.ts`

**Interfaces:**
- Produces:
  - `interface UniversityEntry { slug: string; name: string; aliases: string[] }`
  - `const UNIVERSITIES: UniversityEntry[]`
  - `function matchUniversity(input: string | null): UniversityEntry | null`
  - `function universityImagePath(input: string | null): string`
- Consumes: nothing (pure module, no dependency on Task 1's files existing at import time — but Task 2's test asserts the files Task 1 created are present on disk, so run Task 1 first).

- [ ] **Step 1: Write the failing test**

Create `lib/universities.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { existsSync } from "fs";
import path from "path";
import { UNIVERSITIES, matchUniversity, universityImagePath } from "./universities";

describe("UNIVERSITIES catalog", () => {
  it("has exactly 25 entries", () => {
    expect(UNIVERSITIES).toHaveLength(25);
  });

  it("every entry has a unique slug", () => {
    const slugs = UNIVERSITIES.map((u) => u.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every entry's image file exists in public/university-landmarks", () => {
    for (const u of UNIVERSITIES) {
      const file = path.join(process.cwd(), "public", "university-landmarks", `${u.slug}.png`);
      expect(existsSync(file), `missing image for ${u.slug}`).toBe(true);
    }
  });

  it("the default fallback image exists", () => {
    const file = path.join(process.cwd(), "public", "university-landmarks", "default.png");
    expect(existsSync(file)).toBe(true);
  });
});

describe("matchUniversity", () => {
  it("matches exact canonical name", () => {
    const result = matchUniversity("University of Santo Tomas");
    expect(result?.slug).toBe("ust");
  });

  it("matches case-insensitively", () => {
    const result = matchUniversity("university of santo tomas");
    expect(result?.slug).toBe("ust");
  });

  it("matches with surrounding whitespace trimmed", () => {
    const result = matchUniversity("  University of Santo Tomas  ");
    expect(result?.slug).toBe("ust");
  });

  it("matches a known alias in any casing", () => {
    const result = matchUniversity("ust");
    expect(result?.slug).toBe("ust");
  });

  it("matches De La Salle University via alias 'La Salle'", () => {
    const result = matchUniversity("la salle");
    expect(result?.slug).toBe("dlsu");
  });

  it("returns null for an unmatched free-text school", () => {
    expect(matchUniversity("Cavite State University")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(matchUniversity("")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(matchUniversity(null)).toBeNull();
  });

  it("returns null for whitespace-only input", () => {
    expect(matchUniversity("   ")).toBeNull();
  });
});

describe("universityImagePath", () => {
  it("returns the matched school's image path", () => {
    expect(universityImagePath("University of Santo Tomas")).toBe(
      "/university-landmarks/ust.png"
    );
  });

  it("returns the default image path for unmatched input", () => {
    expect(universityImagePath("Cavite State University")).toBe(
      "/university-landmarks/default.png"
    );
  });

  it("returns the default image path for null input", () => {
    expect(universityImagePath(null)).toBe("/university-landmarks/default.png");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run lib/universities.test.ts
```

Expected: FAIL — `lib/universities.ts` does not exist (`Cannot find module './universities'` or similar).

- [ ] **Step 3: Write the implementation**

Create `lib/universities.ts`:

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run lib/universities.test.ts
```

Expected: PASS — all tests green (this requires Task 1's files to already exist on disk; if the "image exists" tests fail, confirm Task 1 ran first).

- [ ] **Step 5: Commit**

```bash
git add lib/universities.ts lib/universities.test.ts
git commit -m "feat: add university catalog and case-insensitive matching"
```

---

### Task 3: UniversityCombobox picker component

**Files:**
- Create: `components/account/UniversityCombobox.tsx`
- Create: `components/account/UniversityCombobox.test.tsx`

**Interfaces:**
- Consumes: `UNIVERSITIES` from `lib/universities.ts` (Task 2).
- Produces: `function UniversityCombobox(props: { name: string; defaultValue: string; className: string }): JSX.Element` — a drop-in replacement for a plain `<input>` that still submits as `FormData.get(props.name)` in a parent `<form>`.

- [ ] **Step 1: Write the failing test**

Create `components/account/UniversityCombobox.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UniversityCombobox } from "./UniversityCombobox";

describe("UniversityCombobox", () => {
  it("renders a text input with the given name and default value", () => {
    render(<UniversityCombobox name="university" defaultValue="" className="" />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input).toHaveAttribute("name", "university");
    expect(input.value).toBe("");
  });

  it("shows the default value pre-filled", () => {
    render(<UniversityCombobox name="university" defaultValue="University of Santo Tomas" className="" />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("University of Santo Tomas");
  });

  it("shows no dropdown list until the input is focused", () => {
    render(<UniversityCombobox name="university" defaultValue="" className="" />);
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("shows all 25 options when focused with empty input", () => {
    render(<UniversityCombobox name="university" defaultValue="" className="" />);
    fireEvent.focus(screen.getByRole("combobox"));
    expect(screen.getAllByRole("option")).toHaveLength(25);
  });

  it("filters options live by substring, case-insensitively", () => {
    render(<UniversityCombobox name="university" defaultValue="" className="" />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "santo" } });
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("University of Santo Tomas");
  });

  it("allows free text that matches no option — no options shown, input keeps the typed value", () => {
    render(<UniversityCombobox name="university" defaultValue="" className="" />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Cavite State University" } });
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    expect(input.value).toBe("Cavite State University");
  });

  it("clicking an option fills the input with the canonical name and closes the list", () => {
    render(<UniversityCombobox name="university" defaultValue="" className="" />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "santo" } });
    fireEvent.mouseDown(screen.getByRole("option"));
    expect(input.value).toBe("University of Santo Tomas");
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run components/account/UniversityCombobox.test.tsx
```

Expected: FAIL — `Cannot find module './UniversityCombobox'`.

- [ ] **Step 3: Write the implementation**

Create `components/account/UniversityCombobox.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { UNIVERSITIES } from "@/lib/universities";

interface Props {
  name: string;
  defaultValue: string;
  className: string;
}

// Free-text input backed by a live-filtered dropdown of known schools.
// Selecting an option fills the canonical name; typing anything else is
// still accepted as-is on form submit (no validation against the list).
export function UniversityCombobox({ name, defaultValue, className }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = value.trim().toLowerCase();
    if (!needle) return UNIVERSITIES;
    return UNIVERSITIES.filter((u) => u.name.toLowerCase().includes(needle));
  }, [value]);

  return (
    <div className="relative">
      <input
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className={className}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-taupe bg-paper shadow-lg">
          {filtered.map((u) => (
            <li key={u.slug} role="option" aria-selected={u.name === value}>
              <button
                type="button"
                // onMouseDown (not onClick) fires before the input's onBlur,
                // so the click registers before the list closes.
                onMouseDown={() => {
                  setValue(u.name);
                  setOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-accent/10"
              >
                {u.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run components/account/UniversityCombobox.test.tsx
```

Expected: PASS — all 7 tests green.

- [ ] **Step 5: Commit**

```bash
git add components/account/UniversityCombobox.tsx components/account/UniversityCombobox.test.tsx
git commit -m "feat: add UniversityCombobox picker for profile setup"
```

---

### Task 4: Wire the combobox into the profile edit modal

**Files:**
- Modify: `components/account/ProfileCard.tsx:102-111` (the University `<label>` block)

**Interfaces:**
- Consumes: `UniversityCombobox` from Task 3 (`components/account/UniversityCombobox.tsx`).
- Produces: no new exports — `ProfileCard`'s public interface (`{ profile: Profile | null }`) is unchanged.

- [ ] **Step 1: Write the failing test**

Create `components/account/ProfileCard.test.tsx` (new file — no test previously existed for this component):

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileCard } from "./ProfileCard";

// saveProfileAction is a server action imported by ProfileCard; stub it so
// the component can render in jsdom without a server.
vi.mock("@/app/account/actions", () => ({
  saveProfileAction: vi.fn(),
}));

describe("ProfileCard edit modal", () => {
  it("renders the UniversityCombobox (role=combobox) instead of a plain text input for university", () => {
    render(<ProfileCard profile={null} />);
    fireEvent.click(screen.getByText("Add your info"));
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("pre-fills the combobox with the existing profile's university", () => {
    render(
      <ProfileCard
        profile={{
          firstName: "Juan",
          lastName: "Dela Cruz",
          age: null,
          gender: null,
          university: "University of Santo Tomas",
          major: null,
          pathways: [],
        }}
      />
    );
    fireEvent.click(screen.getByText("Edit"));
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("University of Santo Tomas");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run components/account/ProfileCard.test.tsx
```

Expected: FAIL — `getByRole("combobox")` finds nothing, since `ProfileCard` still renders a plain `<input>` (no `role="combobox"`) for university.

- [ ] **Step 3: Replace the plain input with UniversityCombobox**

In `components/account/ProfileCard.tsx`, add the import at the top (after the existing imports):

```tsx
import { UniversityCombobox } from "./UniversityCombobox";
```

Then replace lines 102-111:

```tsx
          <label className="block text-sm text-ink-muted">
            University
            <input
              name="university"
              maxLength={120}
              defaultValue={profile?.university ?? ""}
              placeholder="e.g. Cavite State University"
              className={inputClass}
            />
          </label>
```

with:

```tsx
          <label className="block text-sm text-ink-muted">
            University
            <UniversityCombobox
              name="university"
              defaultValue={profile?.university ?? ""}
              className={inputClass}
            />
          </label>
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run components/account/ProfileCard.test.tsx
```

Expected: PASS — both tests green.

- [ ] **Step 5: Run the full test suite to confirm no regressions**

```bash
npx vitest run
```

Expected: all existing tests still pass (in particular `lib/profile.test.ts`, unaffected by this UI-only change).

- [ ] **Step 6: Commit**

```bash
git add components/account/ProfileCard.tsx components/account/ProfileCard.test.tsx
git commit -m "feat: use UniversityCombobox in profile edit modal"
```

---

### Task 5: Render the landmark banner on the dashboard ProfileCard

**Files:**
- Modify: `components/account/ProfileCard.tsx:163-229` (the `ProfileCard` function's populated-state branch)

**Interfaces:**
- Consumes: `universityImagePath` from `lib/universities.ts` (Task 2).
- Produces: no new exports.

- [ ] **Step 1: Write the failing test**

Add to `components/account/ProfileCard.test.tsx` (append a new `describe` block):

```tsx
describe("ProfileCard landmark banner", () => {
  it("renders the matched university's landmark image when populated", () => {
    render(
      <ProfileCard
        profile={{
          firstName: "Juan",
          lastName: "Dela Cruz",
          age: null,
          gender: null,
          university: "University of Santo Tomas",
          major: null,
          pathways: [],
        }}
      />
    );
    const img = screen.getByRole("img", { name: /university of santo tomas/i });
    expect(img).toHaveAttribute("src", expect.stringContaining("ust"));
  });

  it("renders the default landmark image when university is unmatched", () => {
    render(
      <ProfileCard
        profile={{
          firstName: "Juan",
          lastName: "Dela Cruz",
          age: null,
          gender: null,
          university: "Cavite State University",
          major: null,
          pathways: [],
        }}
      />
    );
    const img = screen.getByRole("img", { name: /cavite state university/i });
    expect(img).toHaveAttribute("src", expect.stringContaining("default"));
  });

  it("renders the default landmark image when university is null", () => {
    render(
      <ProfileCard
        profile={{
          firstName: "Juan",
          lastName: "Dela Cruz",
          age: null,
          gender: null,
          university: null,
          major: null,
          pathways: [],
        }}
      />
    );
    const img = screen.getByRole("img", { name: /university landmark/i });
    expect(img).toHaveAttribute("src", expect.stringContaining("default"));
  });

  it("renders no landmark image in the empty/no-profile state", () => {
    render(<ProfileCard profile={null} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
```

Note: `next/image` renders a real `<img>` in jsdom via Next's test-friendly image component, so `getByRole("img")` works without additional mocking in this repo's existing Vitest setup (consistent with other components — confirm no `next/image` mock is required by checking `vitest.setup.ts` if this step's run surfaces an error about `next/image`).

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run components/account/ProfileCard.test.tsx
```

Expected: FAIL — no `role="img"` element exists yet in the populated state.

- [ ] **Step 3: Add the banner image**

In `components/account/ProfileCard.tsx`, add these imports at the top:

```tsx
import Image from "next/image";
import { universityImagePath } from "@/lib/universities";
```

Then in the `ProfileCard` function, modify the populated-state branch (currently starting at `{profile ? (` around line 168). Change:

```tsx
      {profile ? (
        <div className="rounded-xl border border-taupe/30 bg-taupe/5 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
```

to:

```tsx
      {profile ? (
        <div className="rounded-xl border border-taupe/30 bg-taupe/5 overflow-hidden">
          <div className="relative aspect-[16/9] w-full bg-taupe/10">
            <Image
              src={universityImagePath(profile.university)}
              alt={profile.university || "University landmark"}
              fill
              className="object-cover"
              sizes="256px"
            />
          </div>
          <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
```

And close the two newly-opened `<div>`s by changing the end of that branch from:

```tsx
          )}
        </div>
      ) : (
```

to:

```tsx
          )}
          </div>
        </div>
      ) : (
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run components/account/ProfileCard.test.tsx
```

Expected: PASS — all tests in the file green, including the 4 new banner tests.

- [ ] **Step 5: Run the full test suite**

```bash
npx vitest run
```

Expected: all tests pass, no regressions.

- [ ] **Step 6: Commit**

```bash
git add components/account/ProfileCard.tsx components/account/ProfileCard.test.tsx
git commit -m "feat: show matched university landmark banner on dashboard profile card"
```

---

### Task 6: Manual verification in the running app, then remove the old asset folder

**Files:**
- Remove: `assets/university_landmark/` (entire directory, including the empty `list_of_uni.txt`)

**Interfaces:**
- Consumes: the running dev server, Task 1's `public/university-landmarks/` files, Task 2-5's code.
- Produces: nothing (cleanup + verification task).

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Expected: server starts (check terminal for the local URL, typically `http://localhost:3000`).

- [ ] **Step 2: Log in and open the account page**

Navigate to `/account` in a browser (or use the claude-in-chrome tools) while logged in as a test user. If `PROFILE_STORE=file` is set in the dev environment, no real Supabase login is needed — check `.env.local` for this flag.

- [ ] **Step 3: Set university to an exact catalog match and verify the image**

Open the profile edit modal, type "University of Santo Tomas" into the University field (or click it from the dropdown list), save, and confirm the `ProfileCard` banner now shows the UST landmark image (not the default).

- [ ] **Step 4: Set university to a known alias in mixed case and verify the same match**

Edit the profile again, set University to `ust` (lowercase), save, and confirm the same UST landmark renders.

- [ ] **Step 5: Set university to an unmatched free-text school and verify the default image**

Edit the profile again, set University to "Cavite State University" (not in the catalog), save, and confirm the `ProfileCard` banner falls back to the default landmark image, and that the free-text value "Cavite State University" is still what's saved/displayed as text.

- [ ] **Step 6: Verify the picker dropdown behavior live**

Open the edit modal, click into the University field with it empty — confirm a scrollable dropdown of ~25 schools appears. Type "up" — confirm the list filters down to entries containing "up" (e.g. "University of the Philippines Diliman", "University of the Philippines Cebu", "University of the Philippines Visayas"). Click one — confirm the field fills with that canonical name.

- [ ] **Step 7: Stop the dev server, then remove the old unused asset folder**

```bash
rm -rf assets/university_landmark
```

- [ ] **Step 8: Confirm the app still builds after removal**

```bash
npx vitest run
npm run build
```

Expected: tests pass, build succeeds (confirms nothing else in the codebase referenced `assets/university_landmark`).

- [ ] **Step 9: Commit the cleanup**

```bash
git add -A assets/university_landmark
git commit -m "chore: remove superseded university_landmark source assets"
```

---

## Self-Review Notes

- **Spec coverage:** Asset pipeline → Task 1. Catalog + matching → Task 2. Picker → Task 3-4. Dashboard display → Task 5. Testing (unit + manual) → spread across Tasks 2-6. All spec sections have a corresponding task.
- **No placeholders:** every step has literal code/commands, no "add appropriate X" phrasing.
- **Type consistency:** `UniversityEntry`, `UNIVERSITIES`, `matchUniversity`, `universityImagePath` signatures are identical everywhere they're referenced (Tasks 2, 3, 5). `UniversityCombobox` props (`name`, `defaultValue`, `className`) match between Task 3's definition and Task 4's usage.
