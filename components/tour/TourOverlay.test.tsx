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

  describe("on a small phone", () => {
    const VIEWPORT = { width: 320, height: 568 };

    function stubLayout(targetTop: number, targetHeight = 40) {
      Object.defineProperty(window, "innerWidth", { configurable: true, value: VIEWPORT.width });
      Object.defineProperty(window, "innerHeight", { configurable: true, value: VIEWPORT.height });
      vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(288);
      vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(220);
      let top = targetTop;
      const scrollIntoView = vi.fn(() => {
        // Mimic block: "center".
        top = (VIEWPORT.height - targetHeight) / 2;
      });
      Element.prototype.scrollIntoView = scrollIntoView;
      vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
        if (this.getAttribute("data-tour")) {
          return { top, left: 200, width: 100, height: targetHeight, right: 300, bottom: top + targetHeight, x: 200, y: top, toJSON() {} } as DOMRect;
        }
        return { top: 0, left: 0, width: 0, height: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON() {} } as DOMRect;
      });
      return scrollIntoView;
    }

    function cardBox(container: HTMLElement) {
      const card = container.querySelector<HTMLElement>("[role=dialog]")!;
      const m = /translate3d\((-?[\d.]+)px, (-?[\d.]+)px/.exec(card.style.transform);
      expect(m, "card is positioned by transform").not.toBeNull();
      const x = Number(m![1]);
      const y = Number(m![2]);
      return { x, y, right: x + 288, bottom: y + 220, mode: card.dataset.tourCard };
    }

    afterEach(() => {
      // @ts-expect-error -- jsdom has no scrollIntoView; remove the stub again.
      delete Element.prototype.scrollIntoView;
    });

    it("scrolls an off-screen target into view and keeps the whole card on screen", () => {
      const scrollIntoView = stubLayout(1200);
      const { container } = render(
        <>
          <Anchor tour="landing-subjects" />
          <TourOverlay steps={STEPS} stepIndex={1} totalSteps={3} next={vi.fn()} prev={vi.fn()} skip={vi.fn()} />
        </>
      );

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: "center", behavior: "instant" }));
      const box = cardBox(container);
      expect(box.x).toBeGreaterThanOrEqual(16);
      expect(box.y).toBeGreaterThanOrEqual(16);
      expect(box.right).toBeLessThanOrEqual(VIEWPORT.width - 16);
      expect(box.bottom).toBeLessThanOrEqual(VIEWPORT.height - 16);
    });

    it("leaves the page alone when the target is already on screen", () => {
      const scrollIntoView = stubLayout(80);
      const { container } = render(
        <>
          <Anchor tour="landing-subjects" />
          <TourOverlay steps={STEPS} stepIndex={1} totalSteps={3} next={vi.fn()} prev={vi.fn()} skip={vi.fn()} />
        </>
      );

      expect(scrollIntoView).not.toHaveBeenCalled();
      expect(cardBox(container).mode).toBe("below");
    });

    it("docks the card to a viewport edge when a tall target leaves no room beside it", () => {
      stubLayout(16, 700);
      const { container } = render(
        <>
          <Anchor tour="landing-subjects" />
          <TourOverlay steps={STEPS} stepIndex={1} totalSteps={3} next={vi.fn()} prev={vi.fn()} skip={vi.fn()} />
        </>
      );

      const box = cardBox(container);
      expect(box.mode).toBe("dock-bottom");
      expect(box.bottom).toBe(VIEWPORT.height - 16);
    });

    it("moves the spotlight with transform only, so following scroll is not a layout shift", () => {
      stubLayout(80);
      const { container } = render(
        <>
          <Anchor tour="landing-subjects" />
          <TourOverlay steps={STEPS} stepIndex={1} totalSteps={3} next={vi.fn()} prev={vi.fn()} skip={vi.fn()} />
        </>
      );

      const spotlight = container.querySelector<HTMLElement>("[data-tour-spotlight]")!;
      expect(spotlight.style.transform).toContain("translate3d(192px, 72px");
      expect(spotlight.style.top).toBe("");
      expect(spotlight.style.left).toBe("");
      expect(spotlight.className).not.toMatch(/transition-\[top/);
      const card = container.querySelector<HTMLElement>("[role=dialog]")!;
      expect(card.style.top).toBe("");
      expect(card.style.bottom).toBe("");
    });
  });
});

