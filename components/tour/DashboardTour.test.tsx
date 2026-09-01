// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { DashboardTour } from "./DashboardTour";

function Anchors() {
  return (
    <>
      <div data-tour="dashboard-hero">hero</div>
      <div data-tour="dashboard-roadmap-summary">roadmap summary</div>
      <div data-tour="dashboard-semesters">semesters</div>
      <div data-tour="dashboard-this-week">this week</div>
      <div data-tour="dashboard-discounts">discounts</div>
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

describe("DashboardTour", () => {
  it("auto-runs for a first-time visitor, starting on the hero step", async () => {
    render(
      <>
        <Anchors />
        <DashboardTour />
      </>
    );
    await act(async () => {});

    expect(screen.getByRole("heading", { name: "Your progress at a glance" })).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
  });

  it("never runs again once bsit:tour:dashboard is set", async () => {
    localStorage.setItem("bsit:tour:dashboard", "1");
    render(
      <>
        <Anchors />
        <DashboardTour />
      </>
    );
    await act(async () => {});

    expect(screen.queryByRole("heading", { name: "Your progress at a glance" })).not.toBeInTheDocument();
  });

  it("walks all 5 steps in order: hero, roadmap summary, semesters, this week, discounts", async () => {
    render(
      <>
        <Anchors />
        <DashboardTour />
      </>
    );
    await act(async () => {});

    expect(screen.getByRole("heading", { name: "Your progress at a glance" })).toBeInTheDocument();
    await clickNext();
    expect(screen.getByRole("heading", { name: "Academic roadmap" })).toBeInTheDocument();
    await clickNext();
    expect(screen.getByRole("heading", { name: "Browse by term" })).toBeInTheDocument();
    await clickNext();
    expect(screen.getByRole("heading", { name: "This week" })).toBeInTheDocument();
    await clickNext();
    expect(screen.getByRole("heading", { name: "Discount codes" })).toBeInTheDocument();
    expect(screen.getByText("Step 5 of 5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
  });

  it("marks only bsit:tour:dashboard done and closes it when Skip is used, leaving other tours' keys untouched", async () => {
    localStorage.setItem("bsit:tour:landing", "1");
    render(
      <>
        <Anchors />
        <DashboardTour />
      </>
    );
    await act(async () => {});

    await act(async () => {
      screen.getByRole("button", { name: "Skip" }).click();
    });

    expect(screen.queryByRole("heading", { name: "Your progress at a glance" })).not.toBeInTheDocument();
    expect(localStorage.getItem("bsit:tour:dashboard")).not.toBeNull();
    // Skipping the dashboard tour must not disturb another section's tour state.
    expect(localStorage.getItem("bsit:tour:landing")).toBe("1");
  });

  it("skips a step gracefully when its target section didn't render", async () => {
    render(
      <>
        <div data-tour="dashboard-hero">hero</div>
        <div data-tour="dashboard-roadmap-summary">roadmap summary</div>
        <div data-tour="dashboard-semesters">semesters</div>
        {/* No [data-tour="dashboard-this-week"] element this visit. */}
        <div data-tour="dashboard-discounts">discounts</div>
        <DashboardTour />
      </>
    );
    await act(async () => {});

    await clickNext(); // hero -> roadmap summary
    await clickNext(); // roadmap summary -> semesters
    await clickNext(); // semesters -> this week (missing, auto-skips) -> discounts

    expect(screen.getByRole("heading", { name: "Discount codes" })).toBeInTheDocument();
    expect(screen.getByText("Step 5 of 5")).toBeInTheDocument();
  });
});
