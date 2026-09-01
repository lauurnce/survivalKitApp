// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { RoadmapTour } from "./RoadmapTour";

function Anchors() {
  return (
    <>
      <section data-tour="roadmap-journey">journey section</section>
      <section data-tour="roadmap-activity">activity section</section>
      <section data-tour="roadmap-subscriptions">subscriptions section</section>
      <section data-tour="roadmap-timeline">timeline section</section>
      <div data-tour="roadmap-graduation">graduation marker</div>
    </>
  );
}

async function clickNext() {
  await act(async () => {
    screen.getByRole("button", { name: /^(Next|Done)$/ }).click();
  });
}

beforeEach(() => {
  localStorage.clear();
});

describe("RoadmapTour", () => {
  it("auto-runs for a first-time visitor, starting on the journey step", async () => {
    render(
      <>
        <Anchors />
        <RoadmapTour />
      </>
    );
    await act(async () => {});

    expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
  });

  it("never runs again once bsit:tour:roadmap is set", async () => {
    localStorage.setItem("bsit:tour:roadmap", "1");
    render(
      <>
        <Anchors />
        <RoadmapTour />
      </>
    );
    await act(async () => {});

    expect(screen.queryByText(/Step 1 of/)).not.toBeInTheDocument();
  });

  it("walks all 5 steps in order: journey, activity, subscriptions, timeline, graduation", async () => {
    render(
      <>
        <Anchors />
        <RoadmapTour />
      </>
    );
    await act(async () => {});

    expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
    await clickNext();
    expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
    await clickNext();
    expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
    await clickNext();
    expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
    await clickNext();
    expect(screen.getByText("Step 5 of 5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
  });

  it("skips the subscriptions step gracefully when there are no active subscriptions", async () => {
    render(
      <>
        <section data-tour="roadmap-journey">journey section</section>
        <section data-tour="roadmap-activity">activity section</section>
        {/* No [data-tour="roadmap-subscriptions"] element — nothing unlocked yet. */}
        <section data-tour="roadmap-timeline">timeline section</section>
        <div data-tour="roadmap-graduation">graduation marker</div>
        <RoadmapTour />
      </>
    );
    await act(async () => {});

    await clickNext(); // journey -> activity
    await clickNext(); // activity -> subscriptions (missing, auto-skips) -> timeline

    expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
  });

  it("marks the tour done and closes it when Skip is used, without touching another tour's key", async () => {
    localStorage.setItem("bsit:tour:landing", "1");
    render(
      <>
        <Anchors />
        <RoadmapTour />
      </>
    );
    await act(async () => {});

    await act(async () => {
      screen.getByRole("button", { name: "Skip" }).click();
    });

    expect(screen.queryByText(/Step \d of/)).not.toBeInTheDocument();
    expect(localStorage.getItem("bsit:tour:roadmap")).not.toBeNull();
    expect(localStorage.getItem("bsit:tour:landing")).toBe("1");
  });
});
