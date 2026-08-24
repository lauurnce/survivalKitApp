// @vitest-environment jsdom
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";

const progress = vi.hoisted(() => ({
  completed: new Set<string>(),
  result: true as boolean | null,
}));

vi.mock("@/lib/progress", () => ({
  fetchCompletedModules: () => Promise.resolve(progress.completed),
  setModuleCompleted: () => Promise.resolve(progress.result),
}));

vi.mock("@/components/share/ShareProgressCard", () => ({
  ShareProgressCard: () => <div data-testid="share-dialog" />,
}));

vi.mock("@/lib/device", () => ({
  getDeviceId: () => "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
}));

import { ModuleReaderClient } from "./ModuleReaderClient";
import { ModuleDoneToggle } from "./ModuleDoneToggle";
import { ModuleSurveyCard } from "./ModuleSurveyCard";

const SHARE = {
  subjectId: "s1",
  subjectTitle: "CP1",
  moduleTitle: "Lesson 1",
  moduleIds: ["m1"],
};

function Reader() {
  return (
    <ModuleReaderClient moduleId="m1" moduleTitle="Lesson 1">
      <ModuleDoneToggle moduleId="m1" share={SHARE} />
      <ModuleSurveyCard />
    </ModuleReaderClient>
  );
}

const survey = () => screen.queryByText(/help us improve/i);

/** The key an earlier build used to keep an open survey alive across loads. */
const STALE_OPEN_STATE = "feedback-prompt-state";

function mockFeedbackSuccess() {
  global.fetch = vi.fn(async () =>
    new Response(
      JSON.stringify({
        id: "f1",
        coupon_code: null,
        coupon_expires_at: null,
        is_quality_approved: true,
        message: "Thanks for your feedback!",
      }),
      { status: 200 }
    )
  ) as unknown as typeof fetch;
}

async function submitSurvey() {
  const stars = screen.getAllByRole("button", { name: "★" });
  fireEvent.click(stars[4]);
  fireEvent.click(stars[9]);
  fireEvent.click(screen.getByRole("button", { name: /submit/i }));
  await screen.findByText(/thanks for your feedback/i);
}

beforeEach(() => {
  localStorage.clear();
  progress.completed = new Set<string>();
  progress.result = true;
});

afterEach(() => {
  cleanup();
  // Tests that fake ?feedback=1 must not leak the param into other cases.
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
});

describe("module survey timing", () => {
  it("does not show the survey on mount", async () => {
    render(<Reader />);
    await screen.findByRole("button", { name: "Mark done" });

    expect(survey()).not.toBeInTheDocument();
  });

  it("shows the survey after a confirmed completion", async () => {
    render(<Reader />);
    fireEvent.click(await screen.findByRole("button", { name: "Mark done" }));

    expect(await screen.findByText(/help us improve/i)).toBeInTheDocument();
  });

  it("does not show the survey when un-marking a module", async () => {
    progress.completed = new Set(["m1"]);
    progress.result = false;

    render(<Reader />);
    const toggle = await screen.findByRole("button", { name: "Done" });
    fireEvent.click(toggle);

    await waitFor(() => expect(toggle).toHaveAttribute("aria-pressed", "false"));
    expect(survey()).not.toBeInTheDocument();
  });

  it("does not show the survey while the 24h cooldown is active", async () => {
    localStorage.setItem("last-feedback-prompt", Date.now().toString());

    render(<Reader />);
    const toggle = await screen.findByRole("button", { name: "Mark done" });
    fireEvent.click(toggle);

    await waitFor(() => expect(toggle).toHaveAttribute("aria-pressed", "true"));
    expect(survey()).not.toBeInTheDocument();
  });

  it("does not re-ask for a module that was already rated", async () => {
    localStorage.setItem("rated-modules", JSON.stringify(["m1"]));

    render(<Reader />);
    const toggle = await screen.findByRole("button", { name: "Mark done" });
    fireEvent.click(toggle);

    await waitFor(() => expect(toggle).toHaveAttribute("aria-pressed", "true"));
    expect(survey()).not.toBeInTheDocument();
  });

  it("keeps the survey dismissed across remounts", async () => {
    const first = render(<Reader />);
    fireEvent.click(await screen.findByRole("button", { name: "Mark done" }));
    await screen.findByText(/help us improve/i);

    fireEvent.click(screen.getByRole("button", { name: /not now/i }));
    await waitFor(() => expect(survey()).not.toBeInTheDocument());
    first.unmount();

    render(<Reader />);
    await screen.findByRole("button", { name: "Mark done" });
    expect(survey()).not.toBeInTheDocument();
  });

  it("never re-asks after a submit, even when the reader leaves before the auto-close", async () => {
    mockFeedbackSuccess();

    const first = render(<Reader />);
    fireEvent.click(await screen.findByRole("button", { name: "Mark done" }));
    await screen.findByText(/help us improve/i);
    await submitSurvey();

    // The reader taps "Up next" a second later — well inside the 3s auto-close.
    first.unmount();

    render(<Reader />);
    await screen.findByRole("button", { name: "Mark done" });
    expect(survey()).not.toBeInTheDocument();
  });

  it("does not reopen a stale persisted survey for an already-rated module", async () => {
    localStorage.setItem(
      STALE_OPEN_STATE,
      JSON.stringify({ isOpen: true, currentModuleId: "m1" })
    );
    localStorage.setItem("rated-modules", JSON.stringify(["m1"]));

    render(<Reader />);
    await screen.findByRole("button", { name: "Mark done" });

    expect(survey()).not.toBeInTheDocument();
  });

  it("does not reopen a stale persisted survey while the 24h cooldown is active", async () => {
    localStorage.setItem(
      STALE_OPEN_STATE,
      JSON.stringify({ isOpen: true, currentModuleId: "m1" })
    );
    localStorage.setItem("last-feedback-prompt", Date.now().toString());

    render(<Reader />);
    await screen.findByRole("button", { name: "Mark done" });

    expect(survey()).not.toBeInTheDocument();
  });
});

describe("corrupt rated-modules storage", () => {
  it("still offers the share prompt when rated-modules is not an array", async () => {
    localStorage.setItem("rated-modules", JSON.stringify({ m1: true }));

    render(<Reader />);
    fireEvent.click(await screen.findByRole("button", { name: "Mark done" }));

    expect(await screen.findByText(/one more down/i)).toBeInTheDocument();
  });

  it("records the rating over a non-array rated-modules value", async () => {
    localStorage.setItem("rated-modules", JSON.stringify("m0"));
    mockFeedbackSuccess();

    render(<Reader />);
    fireEvent.click(await screen.findByRole("button", { name: "Mark done" }));
    await screen.findByText(/help us improve/i);
    await submitSurvey();

    expect(JSON.parse(localStorage.getItem("rated-modules") ?? "null")).toEqual(["m1"]);
  });
});

// A "Submit quality feedback" link on the dashboard lands here with
// ?feedback=1 — an explicit request, so the survey opens on mount even when
// the 24h cooldown or the rated-module list would suppress the unprompted one.
describe("forced open via ?feedback=1", () => {
  // jsdom has no layout engine; ModuleSurveyCard scrolls itself into view for
  // this entry path.
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });
  afterAll(() => {
    delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
  });

  it("opens the survey on mount despite an active cooldown", async () => {
    window.history.replaceState(null, "", "/?feedback=1");
    localStorage.setItem("last-feedback-prompt", Date.now().toString());

    render(<Reader />);

    expect(await screen.findByText(/help us improve/i)).toBeInTheDocument();
  });

  it("opens the survey on mount for an already-rated module", async () => {
    window.history.replaceState(null, "", "/?feedback=1");
    localStorage.setItem("rated-modules", JSON.stringify(["m1"]));

    render(<Reader />);

    expect(await screen.findByText(/help us improve/i)).toBeInTheDocument();
  });
});
