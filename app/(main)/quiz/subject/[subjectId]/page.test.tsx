// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: () => ({ value: "signed-cookie" }) }),
}));

vi.mock("@/lib/auth/deviceCookie", () => ({
  DEVICE_COOKIE: "bsit_device",
  verifyDeviceCookie: () => "device-1",
}));

let currentUserId: string | null = "66666666-6666-6666-6666-666666666666";
vi.mock("@/lib/auth/currentUser", () => ({
  getCurrentUserId: () => Promise.resolve(currentUserId),
}));

// The quiz itself is a client component with its own fetches; stand it in.
vi.mock("@/components/account/ReviewQuiz", () => ({
  ReviewQuiz: ({ subjectTitle }: { subjectTitle: string }) => (
    <div data-testid="quiz">{subjectTitle}</div>
  ),
}));

const YEAR = "11111111-1111-1111-1111-111111111111";
const SUBJECT = "22222222-2222-2222-2222-222222222222";
const MODULE_A = "33333333-3333-3333-3333-333333333333";
const MODULE_B = "44444444-4444-4444-4444-444444444444";
const OTHER_MODULE = "55555555-5555-5555-5555-555555555555";
const TITLE = "Computer Programming 1";

let subjectRow: Record<string, unknown> | null;
let subscriptions: { year_id: string; subject_id: string | null }[];
let userProgress: { module_id: string }[];
let deviceProgress: { module_id: string }[];

function resultFor(table: string, filters: Record<string, unknown>) {
  if (table === "subjects") return { data: subjectRow };
  if (table === "subscriptions") return { data: subscriptions };
  if (table === "modules") return { data: [{ id: MODULE_A }, { id: MODULE_B }] };
  if (table === "module_progress") {
    return { data: "user_id" in filters ? userProgress : deviceProgress };
  }
  return { data: null };
}

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: (table: string) => {
      const filters: Record<string, unknown> = {};
      const builder = {
        select: () => builder,
        eq: (column: string, value: unknown) => {
          filters[column] = value;
          return builder;
        },
        gt: () => builder,
        maybeSingle: () => Promise.resolve(resultFor(table, filters)),
        then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
          Promise.resolve(resultFor(table, filters)).then(resolve, reject),
      };
      return builder;
    },
  }),
}));

import SubjectQuizPage from "./page";

async function renderPage(subjectId = SUBJECT) {
  const ui = await SubjectQuizPage({ params: Promise.resolve({ subjectId }) });
  return render(ui);
}

beforeEach(() => {
  currentUserId = "66666666-6666-6666-6666-666666666666";
  subjectRow = { id: SUBJECT, title: TITLE, year_id: YEAR, semester: 1 };
  subscriptions = [{ year_id: YEAR, subject_id: SUBJECT }];
  userProgress = [{ module_id: MODULE_A }];
  deviceProgress = [];
});

describe("SubjectQuizPage", () => {
  it("renders the quiz when the subject is unlocked and a module is done", async () => {
    await renderPage();
    expect(screen.getByTestId("quiz")).toHaveTextContent(TITLE);
  });

  it("keeps a real 404 for an invalid id", async () => {
    await expect(renderPage("not-a-uuid")).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("keeps a real 404 for a subject that doesn't exist", async () => {
    subjectRow = null;
    await expect(renderPage()).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("explains a locked subject and links to unlock it, instead of a 404", async () => {
    subscriptions = [];
    await renderPage();

    expect(screen.getByRole("heading", { name: `Unlock ${TITLE} to take its quiz` })).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: /unlock/i });
    expect(cta).toHaveAttribute("href", `/unlock?year=${YEAR}&subject=${SUBJECT}`);
    expect(screen.queryByTestId("quiz")).not.toBeInTheDocument();
  });

  it("locked wins over unfinished: a student with no progress on a locked subject is sent to unlock", async () => {
    subscriptions = [];
    userProgress = [];
    await renderPage();
    expect(screen.getByRole("heading", { name: `Unlock ${TITLE} to take its quiz` })).toBeInTheDocument();
  });

  it("explains an unlocked subject with no finished module and links to its modules", async () => {
    userProgress = [{ module_id: OTHER_MODULE }];
    await renderPage();

    expect(
      screen.getByRole("heading", { name: `Finish a module in ${TITLE} to unlock its quiz` })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to the modules/i })).toHaveAttribute(
      "href",
      `/year/${YEAR}/subjects/${SUBJECT}/modules`
    );
  });

  it("treats a student with no progress at all as not having finished a module", async () => {
    userProgress = [];
    deviceProgress = [];
    await renderPage();
    expect(
      screen.getByRole("heading", { name: `Finish a module in ${TITLE} to unlock its quiz` })
    ).toBeInTheDocument();
  });

  it("still counts device progress when the account has none", async () => {
    userProgress = [];
    deviceProgress = [{ module_id: MODULE_B }];
    await renderPage();
    expect(screen.getByTestId("quiz")).toBeInTheDocument();
  });

  it("year-level plan unlocks the subject", async () => {
    subscriptions = [{ year_id: YEAR, subject_id: null }];
    await renderPage();
    expect(screen.getByTestId("quiz")).toBeInTheDocument();
  });
});
