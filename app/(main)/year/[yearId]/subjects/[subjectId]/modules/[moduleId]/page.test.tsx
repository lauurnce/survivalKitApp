// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const YEAR_ID = "11111111-1111-1111-1111-111111111111";
const SUBJECT_ID = "22222222-2222-2222-2222-222222222222";
const MODULE_ID = "33333333-3333-3333-3333-333333333333";

vi.mock("next/navigation", async (orig) => ({
  ...(await orig<typeof import("next/navigation")>()),
  usePathname: () => "/year/x/subjects/y/modules/z",
  useSearchParams: () => new URLSearchParams(),
}));

// Only the server-rendered header is under test; the client islands are not.
const { Passthrough } = vi.hoisted(() => ({
  Passthrough: ({ children }: { children?: ReactNode }) => children,
}));
vi.mock("@/components/ModuleReaderClient", () => ({ ModuleReaderClient: Passthrough }));
vi.mock("@/components/PrintGateRoot", () => ({ PrintGateRoot: Passthrough }));
vi.mock("@/components/dashboard/SessionShell", () => ({ SignedOutOnly: () => null }));
vi.mock("@/components/ModuleSections", () => ({ ModuleSections: () => null }));
vi.mock("@/components/ModuleDoneToggle", () => ({ ModuleDoneToggle: () => null }));
vi.mock("@/components/ModuleSurveyCard", () => ({ ModuleSurveyCard: () => null }));
vi.mock("@/components/PageTracker", () => ({ PageTracker: () => null }));
vi.mock("@/components/PrintButton", () => ({ PrintButton: () => null }));
vi.mock("@/components/LastModuleTracker", () => ({ LastModuleTracker: () => null }));
vi.mock("@/components/PaywallTeaser", () => ({ PaywallTeaser: () => null }));
vi.mock("@/components/UnlockSuccessToast", () => ({ UnlockSuccessToast: () => null }));
vi.mock("@/components/SignupNudgeToast", () => ({ SignupNudgeToast: () => null }));
vi.mock("@/components/lesson/ShareLesson", () => ({ ShareLesson: () => null }));
vi.mock("@/components/lesson/LessonEngagement", () => ({ LessonEngagement: () => null, LESSON_END_ID: "lesson-next" }));
vi.mock("@/lib/supabase/server", () => ({ createServerClient: () => ({}) }));

const OTHER_YEAR_ID = "44444444-4444-4444-4444-444444444444";
const OTHER_SUBJECT_ID = "55555555-5555-5555-5555-555555555555";
const LESSON = `/year/${YEAR_ID}/subjects/${SUBJECT_ID}/modules/${MODULE_ID}`;

let subjectYears: unknown;
// The module's real home. getModuleWithSubject only finds the module under
// its own subject, mirroring the `.eq("subject_id", subjectId)` filter.
let moduleExists = true;
const ownerMock = vi.fn((_moduleId: string) =>
  Promise.resolve(moduleExists ? { moduleId: MODULE_ID, subjectId: SUBJECT_ID, yearId: YEAR_ID } : null),
);
vi.mock("@/lib/cache/queries", () => ({
  getModuleWithSubject: (moduleId: string, subjectId: string) =>
    Promise.resolve({
      mod:
        moduleExists && moduleId === MODULE_ID && subjectId === SUBJECT_ID
          ? { id: MODULE_ID, title: "Variables", subject_id: SUBJECT_ID }
          : null,
      subject:
        subjectId === SUBJECT_ID
          ? { id: SUBJECT_ID, title: "Computer Programming 1", year_id: YEAR_ID, years: subjectYears }
          : subjectId === OTHER_SUBJECT_ID
            ? { id: OTHER_SUBJECT_ID, title: "Other subject", year_id: YEAR_ID, years: subjectYears }
            : null,
    }),
  getModuleOwner: (moduleId: string) => ownerMock(moduleId),
  // No siblings keeps the free-sample lookup (a live Supabase query) out of the render.
  getSiblingModules: () => Promise.resolve([]),
  getModuleContentSections: () => Promise.resolve([]),
  getModuleActivitySections: () => Promise.resolve([]),
}));

import ReaderPage, { generateMetadata } from "./page";

async function renderPage() {
  const ui = await ReaderPage({
    params: Promise.resolve({ yearId: YEAR_ID, subjectId: SUBJECT_ID, moduleId: MODULE_ID }),
  });
  return render(ui);
}

/** The digest Next reads off a thrown notFound()/permanentRedirect(). */
async function failureOf(yearId: string, subjectId: string, moduleId: string): Promise<string> {
  try {
    await ReaderPage({ params: Promise.resolve({ yearId, subjectId, moduleId }) });
  } catch (e) {
    return String((e as { digest?: string }).digest);
  }
  throw new Error("expected the page to 404 or redirect");
}

beforeEach(() => {
  moduleExists = true;
  ownerMock.mockClear();
});

describe("ReaderPage — one lesson, one URL", () => {
  it("renders the lesson at its canonical URL without an owner lookup", async () => {
    subjectYears = { label: "1st Year", sort_order: 1 };
    await renderPage();
    expect(screen.getByRole("heading", { level: 1, name: "Variables" })).toBeInTheDocument();
    expect(ownerMock).not.toHaveBeenCalled();
  });

  it("308s a wrong year to the lesson's real URL", async () => {
    expect(await failureOf(OTHER_YEAR_ID, SUBJECT_ID, MODULE_ID)).toBe(`NEXT_REDIRECT;replace;${LESSON};308;`);
    expect(ownerMock).not.toHaveBeenCalled();
  });

  it("308s a subject the module does not belong to", async () => {
    expect(await failureOf(YEAR_ID, OTHER_SUBJECT_ID, MODULE_ID)).toBe(`NEXT_REDIRECT;replace;${LESSON};308;`);
    expect(ownerMock).toHaveBeenCalledWith(MODULE_ID);
  });

  it("308s an unknown subject id in front of a real module", async () => {
    const ghost = "66666666-6666-6666-6666-666666666666";
    expect(await failureOf(OTHER_YEAR_ID, ghost, MODULE_ID)).toBe(`NEXT_REDIRECT;replace;${LESSON};308;`);
  });

  it("404s a module that does not exist", async () => {
    moduleExists = false;
    expect(await failureOf(YEAR_ID, SUBJECT_ID, MODULE_ID)).toBe("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("404s malformed ids without querying", async () => {
    expect(await failureOf("garbage", SUBJECT_ID, MODULE_ID)).toBe("NEXT_HTTP_ERROR_FALLBACK;404");
    expect(await failureOf(YEAR_ID, SUBJECT_ID, "not-a-uuid")).toBe("NEXT_HTTP_ERROR_FALLBACK;404");
    expect(ownerMock).not.toHaveBeenCalled();
  });
});

describe("ReaderPage — year context in the header", () => {
  beforeEach(() => {
    subjectYears = undefined;
  });

  // PostgREST returns the many-to-one years(...) embed as an object, not an
  // array; reading it as `[0]` dropped the year from every module reader.
  it("reads the year from the object-shaped years embed", async () => {
    subjectYears = { label: "1st Year", sort_order: 1 };
    await renderPage();

    expect(screen.getByRole("link", { name: "1st Year" })).toHaveAttribute(
      "href",
      `/year/${YEAR_ID}/subjects`,
    );
    expect(screen.getByText("§ 01 — Computer Programming 1")).toBeInTheDocument();
  });

  it("still reads an array-shaped years embed", async () => {
    subjectYears = [{ label: "2nd Year", sort_order: 2 }];
    await renderPage();

    expect(screen.getByRole("link", { name: "2nd Year" })).toBeInTheDocument();
    expect(screen.getByText("§ 02 — Computer Programming 1")).toBeInTheDocument();
  });

  it("falls back to placeholders when the year is missing", async () => {
    subjectYears = null;
    await renderPage();

    expect(screen.getByText("§ — — Computer Programming 1")).toBeInTheDocument();
  });
});

describe("generateMetadata — the lesson's own link preview", () => {
  const params = Promise.resolve({ yearId: YEAR_ID, subjectId: SUBJECT_ID, moduleId: MODULE_ID });

  it("gives the lesson its own og:title and og:url", async () => {
    const meta = await generateMetadata({ params });
    expect(meta.title).toBe("Variables · Computer Programming 1");
    expect(meta.openGraph?.title).toBe("Variables · Computer Programming 1 — BSIT Survival Kit");
    expect(meta.openGraph?.url).toBe(`/year/${YEAR_ID}/subjects/${SUBJECT_ID}/modules/${MODULE_ID}`);
    expect(meta.twitter?.title).toBe("Variables · Computer Programming 1 — BSIT Survival Kit");
  });

  it("carries the subject segment's card over from the parent, not the default image", async () => {
    const card = { url: new URL("https://tryi2i.com/year/y/subjects/s/opengraph-image-abc"), width: 1200, height: 630 };
    const parent = Promise.resolve({
      openGraph: { images: [card] },
      twitter: { images: [card] },
    }) as unknown as Parameters<typeof generateMetadata>[1];
    const meta = await generateMetadata({ params }, parent);
    expect(meta.openGraph?.images).toEqual([card]);
    expect(meta.twitter?.images).toEqual([card]);
    expect(JSON.stringify(meta)).not.toContain('"/opengraph-image"');
  });

  it("describes nothing for a URL the page would redirect or 404", async () => {
    const at = (yearId: string, subjectId: string, moduleId: string) =>
      generateMetadata({ params: Promise.resolve({ yearId, subjectId, moduleId }) });
    expect(await at(OTHER_YEAR_ID, SUBJECT_ID, MODULE_ID)).toEqual({});
    expect(await at(YEAR_ID, OTHER_SUBJECT_ID, MODULE_ID)).toEqual({});
    expect(await at("garbage", SUBJECT_ID, MODULE_ID)).toEqual({});
  });

  it("emits no image of its own when the parent has none", async () => {
    const meta = await generateMetadata({ params });
    expect(meta.openGraph).not.toHaveProperty("images");
    expect(meta.twitter).not.toHaveProperty("images");
  });
});
