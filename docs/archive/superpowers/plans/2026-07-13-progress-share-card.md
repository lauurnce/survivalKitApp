# Progress Share Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A student can share/download a transparent story-format PNG (1080×1920) showing their per-subject study progress, from the module-completion moment or a subject-page button, with share events tracked.

**Architecture:** A `next/og` (satori) route renders the PNG server-side from query params (no DB read). A portal-based client dialog previews the card and offers native Share (Web Share API, mobile) or Download. Entry points: `ModuleDoneToggle` (completion prompt) and a persistent subject-page button. Three new event types flow through the existing `/api/events` pipeline (code allowlist + DB CHECK constraint must both change).

**Tech Stack:** Next.js 15 App Router (node runtime), `ImageResponse` from `next/og`, Fraunces/Inter Tight WOFF from `@fontsource`, Supabase (events table migration), vitest + @testing-library/react (jsdom).

**Spec:** `docs/superpowers/specs/2026-07-13-progress-share-card-design.md`

## Global Constraints

- Commits: NEVER add `Co-Authored-By` or any Claude attribution (CLAUDE.md rule).
- Card PNG background is **transparent** (Strava-sticker style) — no background color on the root element.
- Card text is white with soft dark drop-shadows; the big number is brand vermillion `#E0492B`.
- Card format v1: **1080×1920 only**. No QR. No square format.
- Param limits (exact): subject title ≤ 40 chars, module title ≤ 60, name ≤ 20, count clamped 1–999. Over-length text is truncated with a trailing `…`.
- Event type names (exact): `share_card_open`, `share_card_share`, `share_card_download`.
- The card route reads NO database — output is a pure function of query params. Cache header: `public, max-age=31536000, immutable`.
- Existing UI conventions: Tailwind tokens `paper/ink/ink-muted/ink-faint/accent/navy/taupe`, label styles `font-mono text-label-sm uppercase tracking-[0.12em]`.
- Run tests with `npm test` (vitest run). Dev server: `npm run dev`.

---

### Task 1: Share-card param logic (`lib/shareCard.ts`)

Pure functions shared by the API route (validation) and the client (URL building, filename). No React, no IO.

**Files:**
- Create: `lib/shareCard.ts`
- Test: `lib/shareCard.test.ts`

**Interfaces:**
- Produces (used by Tasks 3, 6):
  - `PROGRESS_CARD_LIMITS = { subject: 40, module: 60, name: 20, countMax: 999 }`
  - `ACADEMIC_YEAR_LABEL = "AY 2026–27"`
  - `interface ProgressCardParams { subject: string; count: number; module?: string; name?: string }`
  - `parseProgressCardParams(sp: URLSearchParams): { ok: true; value: ProgressCardParams } | { ok: false; error: string }`
  - `buildProgressCardUrl(params: ProgressCardParams): string` — relative URL `/api/card/progress?...`
  - `progressCardFilename(subjectTitle: string): string` — e.g. `bsit-progress-computer-programming-1.png`

- [ ] **Step 1: Write the failing test**

Create `lib/shareCard.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  parseProgressCardParams,
  buildProgressCardUrl,
  progressCardFilename,
  PROGRESS_CARD_LIMITS,
} from "./shareCard";

function sp(entries: Record<string, string>): URLSearchParams {
  return new URLSearchParams(entries);
}

describe("parseProgressCardParams", () => {
  it("accepts minimal valid params", () => {
    const r = parseProgressCardParams(sp({ subject: "Computer Programming 1", count: "8" }));
    expect(r).toEqual({
      ok: true,
      value: { subject: "Computer Programming 1", count: 8 },
    });
  });

  it("carries optional module and name through", () => {
    const r = parseProgressCardParams(
      sp({ subject: "CP1", count: "3", module: "Loops & Iteration", name: "Andrea" })
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.module).toBe("Loops & Iteration");
      expect(r.value.name).toBe("Andrea");
    }
  });

  it("rejects missing or blank subject", () => {
    expect(parseProgressCardParams(sp({ count: "3" })).ok).toBe(false);
    expect(parseProgressCardParams(sp({ subject: "   ", count: "3" })).ok).toBe(false);
  });

  it("rejects missing, non-integer, and sub-1 count", () => {
    expect(parseProgressCardParams(sp({ subject: "CP1" })).ok).toBe(false);
    expect(parseProgressCardParams(sp({ subject: "CP1", count: "abc" })).ok).toBe(false);
    expect(parseProgressCardParams(sp({ subject: "CP1", count: "2.5" })).ok).toBe(false);
    expect(parseProgressCardParams(sp({ subject: "CP1", count: "0" })).ok).toBe(false);
  });

  it("clamps count to countMax", () => {
    const r = parseProgressCardParams(sp({ subject: "CP1", count: "5000" }));
    expect(r.ok && r.value.count).toBe(PROGRESS_CARD_LIMITS.countMax);
  });

  it("truncates over-length subject/module/name with an ellipsis", () => {
    const r = parseProgressCardParams(
      sp({
        subject: "S".repeat(60),
        count: "1",
        module: "M".repeat(100),
        name: "N".repeat(40),
      })
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.subject).toBe("S".repeat(PROGRESS_CARD_LIMITS.subject) + "…");
      expect(r.value.module).toBe("M".repeat(PROGRESS_CARD_LIMITS.module) + "…");
      expect(r.value.name).toBe("N".repeat(PROGRESS_CARD_LIMITS.name) + "…");
    }
  });

  it("drops empty optional params instead of keeping empty strings", () => {
    const r = parseProgressCardParams(sp({ subject: "CP1", count: "1", module: "", name: " " }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.module).toBeUndefined();
      expect(r.value.name).toBeUndefined();
    }
  });
});

describe("buildProgressCardUrl", () => {
  it("builds a relative URL with encoded params, omitting absent optionals", () => {
    const url = buildProgressCardUrl({ subject: "Computer Programming 1", count: 8 });
    expect(url).toBe("/api/card/progress?subject=Computer+Programming+1&count=8");
  });

  it("includes module and name when present", () => {
    const url = buildProgressCardUrl({
      subject: "CP1",
      count: 3,
      module: "Loops & Iteration",
      name: "Andrea",
    });
    const parsed = new URLSearchParams(url.split("?")[1]);
    expect(parsed.get("module")).toBe("Loops & Iteration");
    expect(parsed.get("name")).toBe("Andrea");
  });
});

describe("progressCardFilename", () => {
  it("slugifies the subject title", () => {
    expect(progressCardFilename("Computer Programming 1")).toBe(
      "bsit-progress-computer-programming-1.png"
    );
  });

  it("strips symbols and collapses whitespace", () => {
    expect(progressCardFilename("  IT Élective: Networking & Security!! ")).toBe(
      "bsit-progress-it-lective-networking-security.png"
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/shareCard.test.ts`
Expected: FAIL — `Cannot find module './shareCard'` (or equivalent resolve error).

- [ ] **Step 3: Write the implementation**

Create `lib/shareCard.ts`:

```ts
// Shared contract for the progress share card: the API route uses
// parseProgressCardParams to validate/normalize, the client uses
// buildProgressCardUrl + progressCardFilename. Keep these in lockstep —
// they are two ends of the same URL.

export const PROGRESS_CARD_LIMITS = {
  subject: 40,
  module: 60,
  name: 20,
  countMax: 999,
} as const;

export const ACADEMIC_YEAR_LABEL = "AY 2026–27";

export interface ProgressCardParams {
  subject: string;
  count: number;
  module?: string;
  name?: string;
}

type ParseResult =
  | { ok: true; value: ProgressCardParams }
  | { ok: false; error: string };

function truncate(raw: string, max: number): string {
  const v = raw.trim();
  return v.length > max ? v.slice(0, max) + "…" : v;
}

export function parseProgressCardParams(sp: URLSearchParams): ParseResult {
  const subjectRaw = (sp.get("subject") ?? "").trim();
  if (!subjectRaw) return { ok: false, error: "Missing subject" };

  const countRaw = Number(sp.get("count"));
  if (!Number.isInteger(countRaw) || countRaw < 1) {
    return { ok: false, error: "count must be a positive integer" };
  }

  const value: ProgressCardParams = {
    subject: truncate(subjectRaw, PROGRESS_CARD_LIMITS.subject),
    count: Math.min(countRaw, PROGRESS_CARD_LIMITS.countMax),
  };

  const moduleRaw = (sp.get("module") ?? "").trim();
  if (moduleRaw) value.module = truncate(moduleRaw, PROGRESS_CARD_LIMITS.module);

  const nameRaw = (sp.get("name") ?? "").trim();
  if (nameRaw) value.name = truncate(nameRaw, PROGRESS_CARD_LIMITS.name);

  return { ok: true, value };
}

export function buildProgressCardUrl(params: ProgressCardParams): string {
  const sp = new URLSearchParams();
  sp.set("subject", params.subject);
  sp.set("count", String(params.count));
  if (params.module) sp.set("module", params.module);
  if (params.name) sp.set("name", params.name);
  return `/api/card/progress?${sp.toString()}`;
}

export function progressCardFilename(subjectTitle: string): string {
  const slug = subjectTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `bsit-progress-${slug || "card"}.png`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/shareCard.test.ts`
Expected: PASS (all tests green).

- [ ] **Step 5: Commit**

```bash
git add lib/shareCard.ts lib/shareCard.test.ts
git commit -m "feat(share): progress card param contract — parse, build URL, filename"
```

---

### Task 2: Card fonts + output tracing

Satori cannot use `next/font`; it needs raw font buffers. Ship Fraunces 600 + Inter Tight 400/500 as WOFF files in `assets/fonts/` (satori supports TTF/OTF/WOFF, **not** WOFF2), sourced from pinned `@fontsource` packages.

**Files:**
- Create: `assets/fonts/fraunces-latin-600-normal.woff`
- Create: `assets/fonts/inter-tight-latin-400-normal.woff`
- Create: `assets/fonts/inter-tight-latin-500-normal.woff`
- Modify: `next.config.ts` (add `outputFileTracingIncludes` to `nextConfig`)

**Interfaces:**
- Produces (used by Task 3): the three font files at exactly the paths above, readable via `fs` from `process.cwd()`.

- [ ] **Step 1: Install fontsource packages (dev-only; fonts get copied out)**

Run:
```bash
npm i -D @fontsource/fraunces @fontsource/inter-tight
```
Expected: both packages added to `devDependencies`.

- [ ] **Step 2: Verify WOFF files exist in the packages**

Run:
```bash
ls node_modules/@fontsource/fraunces/files/ | grep "latin-600-normal.woff$"
ls node_modules/@fontsource/inter-tight/files/ | grep -E "latin-(400|500)-normal.woff$"
```
Expected: `fraunces-latin-600-normal.woff`, `inter-tight-latin-400-normal.woff`, `inter-tight-latin-500-normal.woff`.

**If only `.woff2` exists** (fontsource dropped woff), download TTFs instead from google-webfonts-helper and use `.ttf` filenames throughout Tasks 2–3:
```bash
curl -sL "https://gwfh.mranftl.com/api/fonts/fraunces?download=zip&subsets=latin&variants=600&formats=ttf" -o /tmp/fraunces.zip && unzip -o /tmp/fraunces.zip -d assets/fonts/
curl -sL "https://gwfh.mranftl.com/api/fonts/inter-tight?download=zip&subsets=latin&variants=regular,500&formats=ttf" -o /tmp/inter-tight.zip && unzip -o /tmp/inter-tight.zip -d assets/fonts/
```

- [ ] **Step 3: Copy fonts into the repo**

Run:
```bash
mkdir -p assets/fonts
cp node_modules/@fontsource/fraunces/files/fraunces-latin-600-normal.woff assets/fonts/
cp node_modules/@fontsource/inter-tight/files/inter-tight-latin-400-normal.woff assets/fonts/
cp node_modules/@fontsource/inter-tight/files/inter-tight-latin-500-normal.woff assets/fonts/
ls -la assets/fonts/
```
Expected: three `.woff` files, each 20–100 KB.

- [ ] **Step 4: Add output file tracing so Vercel bundles the fonts with the route**

In `next.config.ts`, add one property to the existing `nextConfig` object (after the `serverExternalPackages` line):

```ts
const nextConfig: NextConfig = {
  serverExternalPackages: ["@supabase/supabase-js", "@supabase/auth-js", "@vercel/sandbox"],
  // The share-card OG route reads these at runtime with fs — without this,
  // Vercel's output tracing would omit them and the route 500s in prod only.
  outputFileTracingIncludes: {
    "/api/card/progress": ["./assets/fonts/**/*"],
  },
  async headers() {
    // ... (unchanged)
```

- [ ] **Step 5: Verify the config still parses**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | head -5`
Expected: no new errors mentioning `next.config.ts`.

- [ ] **Step 6: Commit**

```bash
git add assets/fonts package.json package-lock.json next.config.ts
git commit -m "feat(share): bundle Fraunces + Inter Tight woff for the card renderer"
```

---

### Task 3: Card renderer route (`GET /api/card/progress`)

Server-side PNG via `ImageResponse`. Transparent root, white text with drop-shadows, vermillion Fraunces number, translucent-navy pill for the "just finished" line, wordmark footer.

**Files:**
- Create: `app/api/card/progress/route.tsx` (`.tsx` — the route returns JSX to satori)
- Test: `app/api/card/progress/route.test.ts`

**Interfaces:**
- Consumes: `parseProgressCardParams`, `ACADEMIC_YEAR_LABEL` from `lib/shareCard.ts` (Task 1); font files from `assets/fonts/` (Task 2).
- Produces: `GET /api/card/progress?subject&count[&module][&name]` → `image/png` 1080×1920 with alpha; 400 JSON on invalid params.

- [ ] **Step 1: Write the failing test (validation paths only — PNG rendering is verified manually in Step 5; satori/wasm inside vitest is not worth the flake risk)**

Create `app/api/card/progress/route.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

function makeReq(query: string): NextRequest {
  return new NextRequest(`http://localhost:3000/api/card/progress${query}`);
}

describe("GET /api/card/progress — validation", () => {
  it("400s when subject is missing", async () => {
    const res = await GET(makeReq("?count=3"));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeTruthy();
  });

  it("400s when count is missing or not a positive integer", async () => {
    expect((await GET(makeReq("?subject=CP1"))).status).toBe(400);
    expect((await GET(makeReq("?subject=CP1&count=zero"))).status).toBe(400);
    expect((await GET(makeReq("?subject=CP1&count=0"))).status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/api/card/progress/route.test.ts`
Expected: FAIL — cannot find module `./route`.

- [ ] **Step 3: Write the route**

Create `app/api/card/progress/route.tsx`:

```tsx
import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseProgressCardParams, ACADEMIC_YEAR_LABEL } from "@/lib/shareCard";

export const dynamic = "force-dynamic";

const WIDTH = 1080;
const HEIGHT = 1920;
const VERMILLION = "#E0492B";
const SHADOW = "0 2px 12px rgba(0,0,0,0.5)";

// Fonts load once per server instance, not per request.
const fontsPromise = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/fraunces-latin-600-normal.woff")),
  readFile(join(process.cwd(), "assets/fonts/inter-tight-latin-400-normal.woff")),
  readFile(join(process.cwd(), "assets/fonts/inter-tight-latin-500-normal.woff")),
]).then(([fraunces, interRegular, interMedium]) => [
  { name: "Fraunces", data: fraunces, weight: 600 as const, style: "normal" as const },
  { name: "InterTight", data: interRegular, weight: 400 as const, style: "normal" as const },
  { name: "InterTight", data: interMedium, weight: 500 as const, style: "normal" as const },
]);

export async function GET(req: NextRequest) {
  const parsed = parseProgressCardParams(req.nextUrl.searchParams);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { subject, count, module: moduleTitle, name } = parsed.value;

  const dateLabel = new Date().toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });

  try {
    const fonts = await fontsPromise;

    return new ImageResponse(
      (
        // Transparent root — the card is a sticker overlaid on the student's
        // own story photo, so no background anywhere except the pill.
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "160px 80px",
            fontFamily: "InterTight",
            color: "#FFFFFF",
          }}
        >
          {name && (
            <div
              style={{
                display: "flex",
                fontSize: 36,
                fontWeight: 500,
                letterSpacing: 8,
                textTransform: "uppercase",
                textShadow: SHADOW,
                marginBottom: 24,
              }}
            >
              {name}
            </div>
          )}

          <div
            style={{
              display: "flex",
              fontFamily: "Fraunces",
              fontWeight: 600,
              fontSize: 360,
              lineHeight: 0.95,
              color: VERMILLION,
              textShadow: "0 6px 32px rgba(0,0,0,0.45)",
            }}
          >
            {count}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: 24,
            }}
          >
            <div style={{ display: "flex", fontSize: 44, textShadow: SHADOW }}>
              {count === 1 ? "module done in" : "modules done in"}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 58,
                fontWeight: 500,
                textAlign: "center",
                textShadow: SHADOW,
                marginTop: 12,
              }}
            >
              {subject}
            </div>
          </div>

          {moduleTitle && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginTop: 56,
                padding: "20px 40px",
                borderRadius: 999,
                backgroundColor: "rgba(26,31,35,0.62)",
                fontSize: 36,
              }}
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12.5L9.5 18L20 6.5"
                  stroke={VERMILLION}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div style={{ display: "flex" }}>just finished: {moduleTitle}</div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 20,
              marginTop: 48,
              fontSize: 32,
              letterSpacing: 2,
              opacity: 0.85,
              textShadow: SHADOW,
            }}
          >
            <div style={{ display: "flex" }}>{dateLabel}</div>
            <div style={{ display: "flex" }}>·</div>
            <div style={{ display: "flex" }}>{ACADEMIC_YEAR_LABEL}</div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 140,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              textShadow: SHADOW,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 34,
                fontWeight: 500,
                letterSpacing: 6,
                textTransform: "uppercase",
              }}
            >
              BSIT Survival Kit
            </div>
            <div style={{ display: "flex", fontSize: 28, opacity: 0.85 }}>
              survival-kit-app.vercel.app
            </div>
          </div>
        </div>
      ),
      {
        width: WIDTH,
        height: HEIGHT,
        fonts,
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      }
    );
  } catch (err) {
    console.error("card render failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Card render failed" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/api/card/progress/route.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Manually verify the rendered PNG**

Run (leave the dev server up for later tasks):
```bash
npm run dev &
sleep 8
curl -s -o /tmp/card.png -w "%{http_code} %{content_type}\n" "http://localhost:3000/api/card/progress?subject=Computer%20Programming%201&count=8&module=Loops%20%26%20Iteration&name=Andrea"
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/card/progress?count=8"
```
Expected: first line `200 image/png`, second `400`.

Then open `/tmp/card.png` (Read tool or `open /tmp/card.png`) and confirm:
- background fully transparent (checkerboard in Preview)
- big vermillion "8" in Fraunces, white text readable, pill shows the check + module title
- wordmark + domain at bottom; nothing clipped at edges

- [ ] **Step 6: Commit**

```bash
git add app/api/card/progress/route.tsx app/api/card/progress/route.test.ts
git commit -m "feat(share): transparent story-format progress card renderer via next/og"
```

---

### Task 4: `GET /api/me` — first name for the card

Both reader pages are ISR (`revalidate = 300`) so they cannot read the session server-side; the dialog fetches the signed-in profile's first name from this tiny endpoint. Never errors outward — worst case `{ firstName: null }`.

**Files:**
- Create: `app/api/me/route.ts`
- Test: `app/api/me/route.test.ts`

**Interfaces:**
- Consumes: `getCurrentUserId()` from `@/lib/auth/currentUser`, `getProfile(userId)` from `@/lib/profileStore` (both exist).
- Produces (used by Task 6): `GET /api/me` → `{ firstName: string | null }`, always 200.

- [ ] **Step 1: Write the failing test**

Create `app/api/me/route.test.ts` (mock style mirrors `app/api/events/route.test.ts`):

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

let currentUserId: string | null = null;
let profile: { firstName: string } | null = null;
let profileThrows = false;

vi.mock("@/lib/auth/currentUser", () => ({
  getCurrentUserId: () => Promise.resolve(currentUserId),
}));

vi.mock("@/lib/profileStore", () => ({
  getProfile: () => {
    if (profileThrows) return Promise.reject(new Error("db down"));
    return Promise.resolve(profile);
  },
}));

import { GET } from "./route";

beforeEach(() => {
  currentUserId = null;
  profile = null;
  profileThrows = false;
});

describe("GET /api/me", () => {
  it("returns null firstName when signed out", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ firstName: null });
  });

  it("returns the profile first name when signed in with a profile", async () => {
    currentUserId = "user-1";
    profile = { firstName: "Andrea" };
    expect(await (await GET()).json()).toEqual({ firstName: "Andrea" });
  });

  it("returns null firstName when signed in without a profile", async () => {
    currentUserId = "user-1";
    expect(await (await GET()).json()).toEqual({ firstName: null });
  });

  it("returns null firstName instead of erroring when the store throws", async () => {
    currentUserId = "user-1";
    profileThrows = true;
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ firstName: null });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/api/me/route.test.ts`
Expected: FAIL — cannot find module `./route`.

- [ ] **Step 3: Write the route**

Create `app/api/me/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { getProfile } from "@/lib/profileStore";

export const dynamic = "force-dynamic";

// Minimal session probe for client components on ISR pages (which cannot read
// the session during render). Never errors outward — personalization is
// best-effort.
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ firstName: null });
    const profile = await getProfile(userId);
    return NextResponse.json({ firstName: profile?.firstName ?? null });
  } catch {
    return NextResponse.json({ firstName: null });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/api/me/route.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add app/api/me/route.ts app/api/me/route.test.ts
git commit -m "feat(api): /api/me returns the signed-in profile first name"
```

---

### Task 5: Share-card event types (code + DB constraint)

Three new event types must be added in BOTH places or inserts get silently rejected — the exact trap from git 9f4ab58: the DB CHECK constraint drops unknown types without failing the request.

**Files:**
- Modify: `lib/supabase/types.ts:6-16` (the `EventType` union)
- Modify: `app/api/events/route.ts:6-10` (the `VALID_EVENT_TYPES` set)
- Create: `supabase/migrations/20260713000000_events_add_share_card_types.sql`
- Test: `app/api/events/route.test.ts` (add cases)

**Interfaces:**
- Produces (used by Task 6): `logEvent("share_card_open" | "share_card_share" | "share_card_download", { subject_id, module_id? })` works end-to-end.

- [ ] **Step 1: Add failing test cases**

Append to `app/api/events/route.test.ts`:

```ts
describe("POST /api/events — share card event types", () => {
  it("accepts the three share_card_* types", async () => {
    for (const event_type of ["share_card_open", "share_card_share", "share_card_download"]) {
      const res = await POST(
        makeReq({
          device_id: DEVICE,
          event_type,
          subject_id: "11111111-2222-3333-4444-555555555555",
        })
      );
      const json = await res.json();
      expect(json.ok, `${event_type} should be accepted`).toBe(true);
    }
    expect(inserts).toHaveLength(3);
  });

  it("still rejects unknown event types", async () => {
    const res = await POST(makeReq({ device_id: DEVICE, event_type: "share_card_bogus" }));
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify the new cases fail**

Run: `npx vitest run app/api/events/route.test.ts`
Expected: the `share_card_*` test FAILS (400 Invalid event_type); all pre-existing tests still pass.

- [ ] **Step 3: Extend the union and the allowlist**

In `lib/supabase/types.ts`, extend the `EventType` union:

```ts
export type EventType =
  | "enter"
  | "year_select"
  | "subject_open"
  | "module_open"
  | "section_view"
  | "subscribe_click"
  | "paywall_teaser_view"
  | "paywall_teaser_click"
  | "unlock_click"
  | "unlock_submitted"
  | "share_card_open"
  | "share_card_share"
  | "share_card_download";
```

In `app/api/events/route.ts`, extend `VALID_EVENT_TYPES`:

```ts
const VALID_EVENT_TYPES = new Set<EventType>([
  "enter", "year_select", "subject_open", "module_open",
  "section_view", "subscribe_click", "paywall_teaser_view",
  "paywall_teaser_click", "unlock_click", "unlock_submitted",
  "share_card_open", "share_card_share", "share_card_download",
]);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/api/events/route.test.ts`
Expected: PASS (all cases, old and new).

- [ ] **Step 5: Check the LIVE constraint before writing the migration** (repo-vs-live divergence is a known risk in this project)

Using the Supabase MCP `execute_sql` tool (find the project id via `list_projects` if needed):

```sql
select pg_get_constraintdef(oid)
from pg_constraint
where conname = 'events_event_type_check';
```

Expected: one row listing exactly the 10 existing types (matching migration `20260706150000`). **If the live list differs from the repo's latest migration, STOP and report the divergence before applying anything.**

- [ ] **Step 6: Write the migration file**

Create `supabase/migrations/20260713000000_events_add_share_card_types.sql`:

```sql
-- Allow the share-card funnel events. Must stay in lockstep with
-- VALID_EVENT_TYPES in app/api/events/route.ts — the constraint silently
-- rejects unknown types (see 20260706150000 for the history).
alter table public.events drop constraint if exists events_event_type_check;
alter table public.events add constraint events_event_type_check check (
  event_type = any (array[
    'enter',
    'year_select',
    'subject_open',
    'module_open',
    'section_view',
    'subscribe_click',
    'paywall_teaser_view',
    'paywall_teaser_click',
    'unlock_click',
    'unlock_submitted',
    'share_card_open',
    'share_card_share',
    'share_card_download'
  ])
);
```

- [ ] **Step 7: Apply the migration to the live project**

Using the Supabase MCP `apply_migration` tool with name `events_add_share_card_types` and the SQL above. Then re-run the Step 5 query and confirm the constraint now lists 13 types.

- [ ] **Step 8: Commit**

```bash
git add lib/supabase/types.ts app/api/events/route.ts app/api/events/route.test.ts supabase/migrations/20260713000000_events_add_share_card_types.sql
git commit -m "feat(events): track share_card_open/share/download"
```

---

### Task 6: Share dialog component (`ShareProgressCard`)

Portal-rendered dialog: card preview on a checkered backdrop (so transparency reads), native Share on capable devices, Download everywhere. Fetches its own data (count via `/api/progress`, name via `/api/me`) so entry points stay dumb.

**Files:**
- Create: `components/share/ShareProgressCard.tsx`
- Test: `components/share/ShareProgressCard.test.tsx`

**Interfaces:**
- Consumes: `buildProgressCardUrl`, `progressCardFilename` (Task 1); `fetchCompletedModules` from `@/lib/progress`; `logEvent` from `@/lib/analytics`; `GET /api/me` (Task 4); event types (Task 5).
- Produces (used by Tasks 7, 8):
  ```ts
  interface ShareProgressCardProps {
    subjectId: string;
    subjectTitle: string;
    moduleIds: string[];   // all module ids of the subject — scopes the count
    moduleId?: string;     // completion-moment context (adds the pill line)
    moduleTitle?: string;
    onClose: () => void;
  }
  export function ShareProgressCard(props: ShareProgressCardProps): JSX.Element
  ```
  Parent controls visibility by mounting/unmounting the component.

- [ ] **Step 1: Write the failing test**

Create `components/share/ShareProgressCard.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const logged: Array<[string, Record<string, unknown>]> = [];
vi.mock("@/lib/analytics", () => ({
  logEvent: (type: string, meta: Record<string, unknown> = {}) => {
    logged.push([type, meta]);
    return Promise.resolve();
  },
}));

vi.mock("@/lib/progress", () => ({
  fetchCompletedModules: () => Promise.resolve(new Set(["m1", "m2", "m3"])),
}));

import { ShareProgressCard } from "./ShareProgressCard";

const SUBJECT_ID = "11111111-2222-3333-4444-555555555555";

beforeEach(() => {
  logged.length = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn((url: RequestInfo | URL) => {
      if (String(url).startsWith("/api/me")) {
        return Promise.resolve(
          new Response(JSON.stringify({ firstName: "Andrea" }), { status: 200 })
        );
      }
      return Promise.resolve(new Response(new Blob(), { status: 200 }));
    })
  );
});

describe("ShareProgressCard", () => {
  it("renders the preview with count, subject, module, and name in the card URL", async () => {
    render(
      <ShareProgressCard
        subjectId={SUBJECT_ID}
        subjectTitle="Computer Programming 1"
        moduleIds={["m1", "m2", "m3", "m4"]}
        moduleId="m3"
        moduleTitle="Loops & Iteration"
        onClose={() => {}}
      />
    );

    const img = await screen.findByRole("img", { name: /progress card/i });
    const src = img.getAttribute("src") ?? "";
    const params = new URLSearchParams(src.split("?")[1]);
    expect(params.get("subject")).toBe("Computer Programming 1");
    expect(params.get("count")).toBe("3");
    expect(params.get("module")).toBe("Loops & Iteration");
    expect(params.get("name")).toBe("Andrea");
  });

  it("logs share_card_open once with subject and module ids", async () => {
    render(
      <ShareProgressCard
        subjectId={SUBJECT_ID}
        subjectTitle="CP1"
        moduleIds={["m1"]}
        onClose={() => {}}
      />
    );
    await screen.findByRole("img", { name: /progress card/i });
    const opens = logged.filter(([t]) => t === "share_card_open");
    expect(opens).toHaveLength(1);
    expect(opens[0][1]).toMatchObject({ subject_id: SUBJECT_ID });
  });

  it("always offers a Download link with the slugged filename", async () => {
    render(
      <ShareProgressCard
        subjectId={SUBJECT_ID}
        subjectTitle="Computer Programming 1"
        moduleIds={["m1"]}
        onClose={() => {}}
      />
    );
    const link = (await screen.findByRole("link", { name: /download/i })) as HTMLAnchorElement;
    expect(link.getAttribute("download")).toBe("bsit-progress-computer-programming-1.png");
    await waitFor(() => expect(link.getAttribute("href")).toContain("/api/card/progress?"));
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    render(
      <ShareProgressCard
        subjectId={SUBJECT_ID}
        subjectTitle="CP1"
        moduleIds={["m1"]}
        onClose={onClose}
      />
    );
    (await screen.findByRole("button", { name: /close/i })).click();
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/share/ShareProgressCard.test.tsx`
Expected: FAIL — cannot find module `./ShareProgressCard`.

- [ ] **Step 3: Write the component**

Create `components/share/ShareProgressCard.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  buildProgressCardUrl,
  progressCardFilename,
  type ProgressCardParams,
} from "@/lib/shareCard";
import { fetchCompletedModules } from "@/lib/progress";
import { logEvent } from "@/lib/analytics";

export interface ShareProgressCardProps {
  subjectId: string;
  subjectTitle: string;
  /** All module ids of the subject — scopes the completed count. */
  moduleIds: string[];
  /** Present only when opened from the completion moment. */
  moduleId?: string;
  moduleTitle?: string;
  onClose: () => void;
}

// Story-share dialog: previews the transparent card PNG and offers the native
// share sheet (mobile) or a plain download. Fetches its own count + name so
// entry points only decide WHEN to open it.
export function ShareProgressCard({
  subjectId,
  subjectTitle,
  moduleIds,
  moduleId,
  moduleTitle,
  onClose,
}: ShareProgressCardProps) {
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [filename] = useState(() => progressCardFilename(subjectTitle));
  const [canShare, setCanShare] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const [completed, meRes] = await Promise.all([
        fetchCompletedModules(moduleIds),
        fetch("/api/me").then((r) => (r.ok ? r.json() : { firstName: null })).catch(() => ({ firstName: null })),
      ]);
      if (!active) return;

      const params: ProgressCardParams = {
        subject: subjectTitle,
        count: Math.max(completed.size, 1),
      };
      if (moduleTitle) params.module = moduleTitle;
      if (typeof meRes.firstName === "string" && meRes.firstName) {
        params.name = meRes.firstName;
      }
      setCardUrl(buildProgressCardUrl(params));
    }

    void load();
    void logEvent("share_card_open", { subject_id: subjectId, module_id: moduleId });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.canShare === "function");
  }, []);

  async function share() {
    if (!cardUrl || sharing) return;
    setSharing(true);
    try {
      const blob = await (await fetch(cardUrl)).blob();
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        void logEvent("share_card_share", { subject_id: subjectId, module_id: moduleId });
      }
    } catch {
      // User cancelled the share sheet — keep the dialog open, Download remains.
    } finally {
      setSharing(false);
    }
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Share your progress"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-paper p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <p className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted">
            Share your progress
          </p>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-ink-faint hover:text-ink text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Checkered backdrop so the transparency is visible in the preview. */}
        <div
          className="w-full flex items-center justify-center"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #d8d4cf 25%, transparent 25%, transparent 75%, #d8d4cf 75%), linear-gradient(45deg, #d8d4cf 25%, transparent 25%, transparent 75%, #d8d4cf 75%)",
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0, 12px 12px",
            backgroundColor: "#eceae6",
          }}
        >
          {cardUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cardUrl}
              alt="Your progress card"
              className="w-full max-h-[55vh] object-contain"
            />
          ) : (
            <div className="py-24 font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
              Making your card…
            </div>
          )}
        </div>

        <p className="font-sans text-sm text-ink-muted">
          The PNG has a transparent background — it drops straight onto your IG
          or Facebook story.
        </p>

        <div className="flex gap-3">
          {canShare && (
            <button
              type="button"
              onClick={share}
              disabled={!cardUrl || sharing}
              className="flex-1 bg-accent hover:bg-accent-dark text-paper font-mono text-label-md uppercase tracking-[0.1em] px-4 py-3 transition-colors duration-150 disabled:opacity-50"
            >
              {sharing ? "Opening…" : "Share"}
            </button>
          )}
          <a
            href={cardUrl ?? "#"}
            download={filename}
            aria-disabled={!cardUrl}
            onClick={() => {
              if (!cardUrl) return;
              void logEvent("share_card_download", {
                subject_id: subjectId,
                module_id: moduleId,
              });
            }}
            className="flex-1 text-center border border-ink text-ink hover:bg-ink hover:text-paper font-mono text-label-md uppercase tracking-[0.1em] px-4 py-3 transition-colors duration-150"
          >
            Download
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/share/ShareProgressCard.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Run the full suite to catch regressions**

Run: `npm test`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add components/share/ShareProgressCard.tsx components/share/ShareProgressCard.test.tsx
git commit -m "feat(share): progress card dialog with native share + download"
```

---

### Task 7: Subject-page entry point (`ShareProgressButton`)

Persistent button on the modules list page; renders nothing until the device has ≥1 completed module in the subject.

**Files:**
- Create: `components/share/ShareProgressButton.tsx`
- Test: `components/share/ShareProgressButton.test.tsx`
- Modify: `app/(main)/year/[yearId]/subjects/[subjectId]/modules/page.tsx` (~line 100, after the `PaywallTeaser` block)

**Interfaces:**
- Consumes: `ShareProgressCard` (Task 6); `fetchCompletedModules` from `@/lib/progress`.
- Produces:
  ```ts
  export function ShareProgressButton(props: {
    subjectId: string;
    subjectTitle: string;
    moduleIds: string[];
  }): JSX.Element | null
  ```

- [ ] **Step 1: Write the failing test**

Create `components/share/ShareProgressButton.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

let completedSet = new Set<string>();
vi.mock("@/lib/progress", () => ({
  fetchCompletedModules: () => Promise.resolve(completedSet),
}));

// The dialog has its own tests — stub it so this test stays about the button.
vi.mock("./ShareProgressCard", () => ({
  ShareProgressCard: () => <div data-testid="share-dialog" />,
}));

import { ShareProgressButton } from "./ShareProgressButton";

const PROPS = {
  subjectId: "11111111-2222-3333-4444-555555555555",
  subjectTitle: "CP1",
  moduleIds: ["m1", "m2"],
};

describe("ShareProgressButton", () => {
  it("renders nothing when no modules are completed", async () => {
    completedSet = new Set();
    const { container } = render(<ShareProgressButton {...PROPS} />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("shows the count and opens the dialog on click", async () => {
    completedSet = new Set(["m1", "m2"]);
    render(<ShareProgressButton {...PROPS} />);
    const btn = await screen.findByRole("button", { name: /share progress · 2 done/i });
    btn.click();
    await screen.findByTestId("share-dialog");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/share/ShareProgressButton.test.tsx`
Expected: FAIL — cannot find module `./ShareProgressButton`.

- [ ] **Step 3: Write the component**

Create `components/share/ShareProgressButton.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { fetchCompletedModules } from "@/lib/progress";
import { ShareProgressCard } from "./ShareProgressCard";

interface Props {
  subjectId: string;
  subjectTitle: string;
  moduleIds: string[];
}

// Subject-page "Share progress" entry point. Hidden until the device has
// completed at least one module in this subject.
export function ShareProgressButton({ subjectId, subjectTitle, moduleIds }: Props) {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetchCompletedModules(moduleIds).then((set) => {
      if (active) setCount(set.size);
    });
    return () => {
      active = false;
    };
  }, [moduleIds]);

  if (count === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border border-accent text-accent hover:bg-accent hover:text-paper font-mono text-label-md uppercase tracking-[0.1em] px-4 py-2.5 transition-colors duration-150"
      >
        <span aria-hidden="true">✦</span>
        <span>Share progress · {count} done</span>
      </button>
      {open && (
        <ShareProgressCard
          subjectId={subjectId}
          subjectTitle={subjectTitle}
          moduleIds={moduleIds}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/share/ShareProgressButton.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Wire it into the modules list page**

In `app/(main)/year/[yearId]/subjects/[subjectId]/modules/page.tsx`:

Add the import:
```tsx
import { ShareProgressButton } from "@/components/share/ShareProgressButton";
```

The page already computes `const moduleIds = (modules ?? []).map((m) => m.id);` (line ~52). Inside the existing teaser container (the `max-w-wide` div that wraps `PaywallTeaser`, ~line 90–101), add the button after the teaser:

```tsx
{modules && modules.length > 0 && (
  <>
    <PaywallTeaser
      yearId={yearId}
      subjectId={subjectId}
      yearLabel={year?.label}
      subjectTitle={subject.title}
      ctaHref={`/year/${yearId}/subjects/${subjectId}/modules/${modules[0].id}#subscribe`}
      reviewerCount={reviewerCount ?? undefined}
    />
    <div className="mt-6 flex justify-end">
      <ShareProgressButton
        subjectId={subjectId}
        subjectTitle={subject.title}
        moduleIds={moduleIds}
      />
    </div>
  </>
)}
```

- [ ] **Step 6: Verify in the browser**

With the dev server running, open a subject's modules page (pick any subject with modules), mark one module done, reload.
Expected: "✦ Share progress · 1 done" button appears; clicking opens the dialog with the preview on the checkered backdrop; Download saves the PNG. With zero completions (fresh incognito window), no button.

- [ ] **Step 7: Run the full suite**

Run: `npm test`
Expected: all green.

- [ ] **Step 8: Commit**

```bash
git add components/share/ShareProgressButton.tsx components/share/ShareProgressButton.test.tsx "app/(main)/year/[yearId]/subjects/[subjectId]/modules/page.tsx"
git commit -m "feat(share): subject-page share progress button"
```

---

### Task 8: Completion-moment prompt (`ModuleDoneToggle`)

After a module is marked done, show a small portal snackbar ("🎉 Nice! Share your progress") that opens the dialog with the module context. Optional prop — existing toggle usages without it behave exactly as before.

**Files:**
- Modify: `components/ModuleDoneToggle.tsx`
- Modify: `app/(main)/year/[yearId]/subjects/[subjectId]/modules/page.tsx` (pass `share` to row toggles)
- Modify: `app/(main)/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx:221` (pass `share` to the footer toggle)

**Interfaces:**
- Consumes: `ShareProgressCard` (Task 6).
- Produces: `ModuleDoneToggle` accepts an optional prop:
  ```ts
  share?: {
    subjectId: string;
    subjectTitle: string;
    moduleTitle: string;
    moduleIds: string[];
  }
  ```

- [ ] **Step 1: Extend `ModuleDoneToggle`**

Replace the contents of `components/ModuleDoneToggle.tsx` with:

```tsx
"use client";

import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fetchCompletedModules, setModuleCompleted } from "@/lib/progress";
import { ShareProgressCard } from "@/components/share/ShareProgressCard";

interface ShareContext {
  subjectId: string;
  subjectTitle: string;
  moduleTitle: string;
  moduleIds: string[];
}

interface Props {
  moduleId: string;
  /** When present, completing the module offers a share-card prompt. */
  share?: ShareContext;
}

const PROMPT_DISMISS_MS = 10_000;

// A compact "mark as done" toggle shown on each module row / module detail page.
// State is per-device and persisted via /api/progress.
export function ModuleDoneToggle({ moduleId, share }: Props) {
  const [done, setDone] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [prompt, setPrompt] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const promptTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    fetchCompletedModules([moduleId]).then((set) => {
      if (active) {
        setDone(set.has(moduleId));
        setLoaded(true);
      }
    });
    return () => {
      active = false;
      if (promptTimer.current) clearTimeout(promptTimer.current);
    };
  }, [moduleId]);

  function showPrompt() {
    setPrompt(true);
    if (promptTimer.current) clearTimeout(promptTimer.current);
    promptTimer.current = setTimeout(() => setPrompt(false), PROMPT_DISMISS_MS);
  }

  async function toggle(e: MouseEvent) {
    // Prevent the surrounding <Link> from navigating when used inside a row.
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;

    const optimistic = !done;
    setDone(optimistic);
    setPending(true);
    const result = await setModuleCompleted(moduleId, optimistic);
    if (result !== null) setDone(result);
    else setDone(!optimistic); // revert on failure
    setPending(false);

    // Celebrate only confirmed completions (not un-marks, not failures).
    if (share && result === true) showPrompt();
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={done}
        title={done ? "Mark as not done" : "Mark as done"}
        className={`shrink-0 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-label-sm uppercase tracking-[0.12em] transition-colors duration-150 ${
          done
            ? "border-accent bg-accent/10 text-accent"
            : "border-ink-faint/40 text-ink-faint hover:border-ink hover:text-ink"
        } ${!loaded ? "opacity-50" : ""}`}
      >
        <span aria-hidden="true">{done ? "✓" : "○"}</span>
        <span>{done ? "Done" : "Mark done"}</span>
      </button>

      {share && prompt && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4">
            <div className="flex items-center gap-3 bg-navy text-paper px-5 py-3 shadow-lg">
              <span className="font-sans text-sm">🎉 Nice! One more down.</span>
              <button
                type="button"
                onClick={() => {
                  setPrompt(false);
                  setDialogOpen(true);
                }}
                className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent hover:text-paper transition-colors duration-150"
              >
                Share your progress →
              </button>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setPrompt(false)}
                className="text-taupe hover:text-paper leading-none"
              >
                ×
              </button>
            </div>
          </div>,
          document.body
        )}

      {share && dialogOpen && (
        <ShareProgressCard
          subjectId={share.subjectId}
          subjectTitle={share.subjectTitle}
          moduleIds={share.moduleIds}
          moduleId={moduleId}
          moduleTitle={share.moduleTitle}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Pass `share` on the modules list page**

In `app/(main)/year/[yearId]/subjects/[subjectId]/modules/page.tsx`, the row toggle (~line 126) becomes:

```tsx
<ModuleDoneToggle
  moduleId={mod.id}
  share={{
    subjectId,
    subjectTitle: subject.title,
    moduleTitle: mod.title,
    moduleIds,
  }}
/>
```

- [ ] **Step 3: Pass `share` on the module detail page**

In `app/(main)/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx` (~line 221), the footer toggle becomes (the page already has `siblings` — all subject modules — and `mod.title` / `subject.title`):

```tsx
<ModuleDoneToggle
  moduleId={moduleId}
  share={{
    subjectId,
    subjectTitle: subject.title,
    moduleTitle: mod.title,
    moduleIds: siblings.map((m) => m.id),
  }}
/>
```

- [ ] **Step 4: Verify in the browser**

On the dev server:
1. Modules list page → mark a module done → snackbar appears bottom-center, row click does NOT navigate, snackbar auto-dismisses after ~10s.
2. Mark another done → "Share your progress →" → dialog opens, preview includes the pill line "just finished: {module}".
3. Un-mark a module → NO snackbar.
4. Module detail page footer toggle → same behavior.

- [ ] **Step 5: Run the full suite + lint**

Run: `npm test && npm run lint`
Expected: tests green; no new lint errors.

- [ ] **Step 6: Commit**

```bash
git add components/ModuleDoneToggle.tsx "app/(main)/year/[yearId]/subjects/[subjectId]/modules/page.tsx" "app/(main)/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx"
git commit -m "feat(share): completion-moment share prompt on the done toggle"
```

---

### Task 9: End-to-end verification

No new code — prove the whole loop before calling it done.

**Files:** none (verification only)

- [ ] **Step 1: Full suite + production build**

Run: `npm test && npm run build`
Expected: tests green; build succeeds (confirms the OG route + fonts compile under the production bundler).

- [ ] **Step 2: Verify events land in the live table**

With the dev server running, open a subject page, open the share dialog, click Download. Then via Supabase MCP `execute_sql`:

```sql
select event_type, subject_id, module_id, created_at
from events
where event_type like 'share_card_%'
order by created_at desc
limit 10;
```

Expected: at least one `share_card_open` and one `share_card_download` row with the right `subject_id`. (If rows are missing but the API returned `{ok: true}`, the CHECK constraint diverged — revisit Task 5 Step 7.)

- [ ] **Step 3: Inspect the downloaded PNG**

Open the downloaded file. Confirm: transparent background, story proportions (1080×1920), vermillion number, pill line when opened from a completion, wordmark + domain at the bottom.

- [ ] **Step 4: Phone check (user-assisted, can be deferred)**

On a real phone against a deployed preview: the Share button appears, the native sheet opens, and the PNG posts onto an IG story as a floating sticker. This is the one thing desktop cannot prove — flag it to the user if not testable now.

- [ ] **Step 5: Report status**

Summarize: what shipped, test results, event verification output, and the deferred phone check if applicable.
