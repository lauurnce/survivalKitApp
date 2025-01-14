// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

let completed = new Set<string>();
const fetchCompletedModules = vi.fn((_ids: string[]) => Promise.resolve(completed));
vi.mock("@/lib/progress", () => ({ fetchCompletedModules: (ids: string[]) => fetchCompletedModules(ids) }));

import { StartHereCard } from "./StartHereCard";

const YEAR = "y2";
const SUBJECT = "dcn";
const modules = [
  { id: "m2", title: "Basic Switch and End Device Configuration", sort_order: 2 },
  { id: "m1", title: "Networking Today", sort_order: 1 },
  { id: "exam", title: "Exam Prep: Prelims & Finals", sort_order: 3 },
];

beforeEach(() => {
  completed = new Set();
  fetchCompletedModules.mockClear();
});

describe("StartHereCard", () => {
  it("points a new student at the first lesson, free to read", async () => {
    render(<StartHereCard yearId={YEAR} subjectId={SUBJECT} modules={modules} />);
    const card = screen.getByTestId("start-here-card");
    expect(card).toHaveAttribute("data-reason", "start");
    expect(screen.getByText("Start here")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Networking Today" })).toBeInTheDocument();
    expect(screen.getByText("Lesson 1 of 2 · Free to read")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start lesson/ })).toHaveAttribute(
      "href",
      "/year/y2/subjects/dcn/modules/m1",
    );
    await waitFor(() => expect(fetchCompletedModules).toHaveBeenCalledWith(["m2", "m1", "exam"]));
  });

  it("switches to the next unfinished lesson once the device's progress loads", async () => {
    completed = new Set(["m1"]);
    render(<StartHereCard yearId={YEAR} subjectId={SUBJECT} modules={modules} />);
    await waitFor(() => expect(screen.getByTestId("start-here-card")).toHaveAttribute("data-reason", "continue"));
    expect(screen.getByText("Pick up where you left off")).toBeInTheDocument();
    expect(screen.getByText("Lesson 2 of 2 · Free to read")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Continue/ })).toHaveAttribute(
      "href",
      "/year/y2/subjects/dcn/modules/m2",
    );
  });

  it("offers exam prep once every lesson is done", async () => {
    completed = new Set(["m1", "m2"]);
    render(<StartHereCard yearId={YEAR} subjectId={SUBJECT} modules={modules} />);
    await waitFor(() => expect(screen.getByTestId("start-here-card")).toHaveAttribute("data-reason", "review"));
    expect(screen.getByText("Exam prep · Free to read")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Review/ })).toHaveAttribute(
      "href",
      "/year/y2/subjects/dcn/modules/exam",
    );
  });

  it("skips an empty module and does not count it as a lesson", () => {
    render(
      <StartHereCard
        yearId={YEAR}
        subjectId={SUBJECT}
        modules={modules}
        contentCounts={{ m1: 0, m2: 8, exam: 2 }}
      />,
    );
    expect(screen.getByRole("heading", { name: "Basic Switch and End Device Configuration" })).toBeInTheDocument();
    expect(screen.getByText("Lesson 1 of 1 · Free to read")).toBeInTheDocument();
  });

  it("treats null counts as every module openable", () => {
    render(<StartHereCard yearId={YEAR} subjectId={SUBJECT} modules={modules} contentCounts={null} />);
    expect(screen.getByRole("heading", { name: "Networking Today" })).toBeInTheDocument();
  });

  it("renders nothing when no module can be opened", () => {
    const { container } = render(
      <StartHereCard yearId={YEAR} subjectId={SUBJECT} modules={modules} contentCounts={{ m1: 0, m2: 0, exam: 0 }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("does not ask for progress when the subject has no modules", () => {
    const { container } = render(<StartHereCard yearId={YEAR} subjectId={SUBJECT} modules={[]} />);
    expect(container).toBeEmptyDOMElement();
    expect(fetchCompletedModules).not.toHaveBeenCalled();
  });
});
