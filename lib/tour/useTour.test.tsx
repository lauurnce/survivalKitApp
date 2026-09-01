// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { useTour, type TourStep } from "./useTour";

const STEPS: TourStep[] = [
  { id: "welcome", title: "Welcome", body: "Let's take a look around." },
  { id: "subjects", target: "landing-subjects", title: "Subjects", body: "Start here." },
  { id: "search", target: "landing-search", title: "Search", body: "Find a module." },
];

function Probe({ tourId, steps }: { tourId: string; steps: TourStep[] }) {
  const { active, stepIndex, totalSteps, next, prev, skip } = useTour(tourId, steps);
  return (
    <div>
      <span data-testid="state">{`active=${active} step=${stepIndex} total=${totalSteps}`}</span>
      <button onClick={next}>next</button>
      <button onClick={prev}>prev</button>
      <button onClick={skip}>skip</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("useTour", () => {
  it("auto-activates on mount for a tourId with no stored completion", async () => {
    render(<Probe tourId="landing" steps={STEPS} />);
    await act(async () => {});
    expect(screen.getByTestId("state")).toHaveTextContent("active=true step=0 total=3");
  });

  it("does not activate when the tourId is already marked done", async () => {
    localStorage.setItem("bsit:tour:landing", "1");
    render(<Probe tourId="landing" steps={STEPS} />);
    await act(async () => {});
    expect(screen.getByTestId("state")).toHaveTextContent("active=false");
  });

  it("advances one step at a time with next()", async () => {
    render(<Probe tourId="landing" steps={STEPS} />);
    await act(async () => {});

    act(() => screen.getByText("next").click());
    expect(screen.getByTestId("state")).toHaveTextContent("step=1");

    act(() => screen.getByText("next").click());
    expect(screen.getByTestId("state")).toHaveTextContent("step=2");
  });

  it("goes back one step at a time with prev(), never below zero", async () => {
    render(<Probe tourId="landing" steps={STEPS} />);
    await act(async () => {});

    act(() => screen.getByText("prev").click());
    expect(screen.getByTestId("state")).toHaveTextContent("step=0");

    act(() => screen.getByText("next").click());
    act(() => screen.getByText("next").click());
    act(() => screen.getByText("prev").click());
    expect(screen.getByTestId("state")).toHaveTextContent("step=1");
  });

  it("finishes and persists completion when next() is called past the last step", async () => {
    render(<Probe tourId="landing" steps={STEPS} />);
    await act(async () => {});

    act(() => screen.getByText("next").click());
    act(() => screen.getByText("next").click());
    act(() => screen.getByText("next").click());

    expect(screen.getByTestId("state")).toHaveTextContent("active=false");
    expect(localStorage.getItem("bsit:tour:landing")).not.toBeNull();
  });

  it("skip() persists completion and deactivates immediately, from any step", async () => {
    render(<Probe tourId="landing" steps={STEPS} />);
    await act(async () => {});

    act(() => screen.getByText("skip").click());

    expect(screen.getByTestId("state")).toHaveTextContent("active=false");
    expect(localStorage.getItem("bsit:tour:landing")).not.toBeNull();
  });

  it("skip() never touches another tourId's stored completion", async () => {
    render(
      <>
        <Probe tourId="landing" steps={STEPS} />
        <Probe tourId="dashboard" steps={STEPS} />
      </>
    );
    await act(async () => {});

    act(() => screen.getAllByText("skip")[0].click());

    expect(localStorage.getItem("bsit:tour:landing")).not.toBeNull();
    expect(localStorage.getItem("bsit:tour:dashboard")).toBeNull();
  });

  it("keeps each tourId's own step position independent", async () => {
    render(
      <>
        <Probe tourId="landing" steps={STEPS} />
        <Probe tourId="dashboard" steps={STEPS} />
      </>
    );
    await act(async () => {});

    act(() => screen.getAllByText("next")[0].click());

    const states = screen.getAllByTestId("state");
    expect(states[0]).toHaveTextContent("step=1");
    expect(states[1]).toHaveTextContent("step=0");
  });
});
