// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { LandingTour } from "./LandingTour";

function Anchors() {
  return (
    <>
      <a href="/year/y1/subjects/cp1/modules/l1" data-tour="landing-start">start link</a>
      <a href="/year" data-tour="landing-subjects">subjects link</a>
      <a href="/search" data-tour="landing-search">search link</a>
      <div data-tour="landing-popular">popular section</div>
      <a href="/login" data-tour="landing-login">login link</a>
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

describe("LandingTour", () => {
  it("auto-runs for a first-time visitor, starting on the welcome step", async () => {
    render(
      <>
        <Anchors />
        <LandingTour />
      </>
    );
    await act(async () => {});

    expect(screen.getByRole("heading", { name: "New here?" })).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 6")).toBeInTheDocument();
  });

  it("never runs again once bsit:tour:landing is set", async () => {
    localStorage.setItem("bsit:tour:landing", "1");
    render(
      <>
        <Anchors />
        <LandingTour />
      </>
    );
    await act(async () => {});

    expect(screen.queryByRole("heading", { name: "New here?" })).not.toBeInTheDocument();
  });

  it("walks all 6 steps in order: welcome, start, subjects, search, popular, login", async () => {
    render(
      <>
        <Anchors />
        <LandingTour />
      </>
    );
    await act(async () => {});

    expect(screen.getByRole("heading", { name: "New here?" })).toBeInTheDocument();
    await clickNext();
    expect(screen.getByRole("heading", { name: "Start with CP1" })).toBeInTheDocument();
    await clickNext();
    expect(screen.getByRole("heading", { name: "Every subject" })).toBeInTheDocument();
    await clickNext();
    expect(screen.getByRole("heading", { name: "Search modules" })).toBeInTheDocument();
    await clickNext();
    expect(screen.getByRole("heading", { name: "Popular right now" })).toBeInTheDocument();
    await clickNext();
    expect(screen.getByRole("heading", { name: "Save your progress" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
  });

  it("skips the popular-modules step gracefully when that section didn't render", async () => {
    render(
      <>
        <a href="/year" data-tour="landing-subjects">subjects link</a>
        <a href="/search" data-tour="landing-search">search link</a>
        <a href="/login" data-tour="landing-login">login link</a>
        {/* No [data-tour="landing-popular"] element — fresh install, no reads yet.
            No [data-tour="landing-start"] either — the CP1 lookup fell back. */}
        <LandingTour />
      </>
    );
    await act(async () => {});

    await clickNext(); // welcome -> start (missing, auto-skips) -> subjects
    await clickNext(); // subjects -> search
    await clickNext(); // search -> popular (missing, auto-skips) -> login

    expect(screen.getByRole("heading", { name: "Save your progress" })).toBeInTheDocument();
    expect(screen.getByText("Step 6 of 6")).toBeInTheDocument();
  });

  it("marks the tour done and closes it when Skip is used on any step", async () => {
    render(
      <>
        <Anchors />
        <LandingTour />
      </>
    );
    await act(async () => {});

    await act(async () => {
      screen.getByRole("button", { name: "Skip" }).click();
    });

    expect(screen.queryByRole("heading", { name: "New here?" })).not.toBeInTheDocument();
    expect(localStorage.getItem("bsit:tour:landing")).not.toBeNull();
  });
});
