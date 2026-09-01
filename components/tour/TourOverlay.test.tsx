// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TourOverlay } from "./TourOverlay";
import type { TourStep } from "@/lib/tour/useTour";

const STEPS: TourStep[] = [
  { id: "welcome", title: "Welcome", body: "Let's take a look around." },
  { id: "subjects", target: "landing-subjects", title: "Subjects", body: "Start here." },
  { id: "login", target: "landing-login", title: "Log in", body: "Create an account." },
];

function Anchor({ tour }: { tour: string }) {
  return <a href="/" data-tour={tour}>anchor</a>;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("TourOverlay", () => {
  it("renders the current step's title, body, and progress, with Skip always present", () => {
    render(
      <>
        <Anchor tour="landing-subjects" />
        <TourOverlay
          steps={STEPS}
          stepIndex={0}
          totalSteps={3}
          next={vi.fn()}
          prev={vi.fn()}
          skip={vi.fn()}
        />
      </>
    );

    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByText("Let's take a look around.")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skip" })).toBeInTheDocument();
  });

  it("hides Back on the first step and shows it afterward", () => {
    const { rerender } = render(
      <TourOverlay steps={STEPS} stepIndex={0} totalSteps={3} next={vi.fn()} prev={vi.fn()} skip={vi.fn()} />
    );
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();

    rerender(
      <>
        <Anchor tour="landing-subjects" />
        <TourOverlay steps={STEPS} stepIndex={1} totalSteps={3} next={vi.fn()} prev={vi.fn()} skip={vi.fn()} />
      </>
    );
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
  });

  it("labels the control 'Done' on the last step instead of 'Next'", () => {
    render(
      <>
        <Anchor tour="landing-login" />
        <TourOverlay steps={STEPS} stepIndex={2} totalSteps={3} next={vi.fn()} prev={vi.fn()} skip={vi.fn()} />
      </>
    );
    expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
  });

  it("wires Next, Back, and Skip clicks to their callbacks", () => {
    const next = vi.fn();
    const prev = vi.fn();
    const skip = vi.fn();
    render(
      <>
        <Anchor tour="landing-subjects" />
        <TourOverlay steps={STEPS} stepIndex={1} totalSteps={3} next={next} prev={prev} skip={skip} />
      </>
    );

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));

    expect(next).toHaveBeenCalledTimes(1);
    expect(prev).toHaveBeenCalledTimes(1);
    expect(skip).toHaveBeenCalledTimes(1);
  });

  it("calls skip() on Escape", () => {
    const skip = vi.fn();
    render(
      <TourOverlay steps={STEPS} stepIndex={0} totalSteps={3} next={vi.fn()} prev={vi.fn()} skip={skip} />
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(skip).toHaveBeenCalledTimes(1);
  });

  it("calls skip() when the backdrop is clicked", () => {
    const skip = vi.fn();
    const { container } = render(
      <TourOverlay steps={STEPS} stepIndex={0} totalSteps={3} next={vi.fn()} prev={vi.fn()} skip={skip} />
    );

    fireEvent.click(container.querySelector('[aria-hidden="true"].absolute.inset-0')!);
    expect(skip).toHaveBeenCalledTimes(1);
  });

  it("moves focus into the dialog and wraps Tab within its controls", () => {
    render(
      <>
        <Anchor tour="landing-subjects" />
        <TourOverlay steps={STEPS} stepIndex={1} totalSteps={3} next={vi.fn()} prev={vi.fn()} skip={vi.fn()} />
      </>
    );

    const skipButton = screen.getByRole("button", { name: "Skip" });
    expect(document.activeElement).toBe(skipButton);

    // Shift+Tab from the first focusable control wraps to the last.
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    const doneOrNext = screen.getByRole("button", { name: "Next" });
    expect(document.activeElement).toBe(doneOrNext);

    // Tab from the last focusable control wraps back to the first.
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(skipButton);
  });

  it("skips a step whose target isn't in the DOM this visit, without blocking progression", async () => {
    const next = vi.fn();
    render(
      // No element carries data-tour="landing-subjects" — simulates a
      // section that didn't render this visit.
      <TourOverlay steps={STEPS} stepIndex={1} totalSteps={3} next={next} prev={vi.fn()} skip={vi.fn()} />
    );

    await act(async () => {});
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("renders nothing once its target turns out missing", async () => {
    render(
      <TourOverlay steps={STEPS} stepIndex={1} totalSteps={3} next={vi.fn()} prev={vi.fn()} skip={vi.fn()} />
    );

    await act(async () => {});
    expect(screen.queryByText("Subjects")).not.toBeInTheDocument();
  });

  it("renders an unanchored step (no target) centered with no highlight ring", () => {
    const { container } = render(
      <TourOverlay steps={STEPS} stepIndex={0} totalSteps={3} next={vi.fn()} prev={vi.fn()} skip={vi.fn()} />
    );

    expect(container.querySelector("[data-tour-spotlight]")).not.toBeInTheDocument();
    expect(screen.getByText("Welcome")).toBeInTheDocument();
  });

  it("spotlights an anchored target with a box-shadow cutout instead of dimming it, and drops the full-page dim", () => {
    const { container } = render(
      <>
        <Anchor tour="landing-subjects" />
        <TourOverlay steps={STEPS} stepIndex={1} totalSteps={3} next={vi.fn()} prev={vi.fn()} skip={vi.fn()} />
      </>
    );

    const backdrop = container.querySelector('[aria-hidden="true"].absolute.inset-0')!;
    expect(backdrop.className).not.toContain("bg-ink/60");

    const spotlight = container.querySelector("[data-tour-spotlight]") as HTMLElement;
    expect(spotlight).toBeInTheDocument();
    // Both layers must be present in one value — a class-based ring utility
    // here would compile to its own `box-shadow` and silently lose to this
    // inline style, leaving the target dim underneath an orange outline.
    expect(spotlight.style.boxShadow).toContain("2px");
    expect(spotlight.style.boxShadow).toContain("9999px");
  });

  it("dims the full page for an unanchored step, with no spotlight box-shadow", () => {
    const { container } = render(
      <TourOverlay steps={STEPS} stepIndex={0} totalSteps={3} next={vi.fn()} prev={vi.fn()} skip={vi.fn()} />
    );

    const backdrop = container.querySelector('[aria-hidden="true"].absolute.inset-0')!;
    expect(backdrop.className).toContain("bg-ink/60");
    expect(container.querySelector("[data-tour-spotlight]")).not.toBeInTheDocument();
  });
});
