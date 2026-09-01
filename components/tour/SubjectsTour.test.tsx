// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { SubjectsTour } from "./SubjectsTour";

function Anchors() {
  return (
    <>
      <div data-tour="subjects-years">year cards grid</div>
      <div data-tour="subjects-stats">per-year stats</div>
      <a href="/search" data-tour="subjects-search">search link</a>
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

describe("SubjectsTour", () => {
  it("auto-runs for a first-time visitor, starting on the years step", async () => {
    render(
      <>
        <Anchors />
        <SubjectsTour />
      </>
    );
    await act(async () => {});

    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  });

  it("never runs again once bsit:tour:subjects is set", async () => {
    localStorage.setItem("bsit:tour:subjects", "1");
    render(
      <>
        <Anchors />
        <SubjectsTour />
      </>
    );
    await act(async () => {});

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("walks all 3 steps in order: years, stats, search", async () => {
    render(
      <>
        <Anchors />
        <SubjectsTour />
      </>
    );
    await act(async () => {});

    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    await clickNext();
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    await clickNext();
    expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
  });

  it("marks only this tour's key done and closes it when Skip is used", async () => {
    render(
      <>
        <Anchors />
        <SubjectsTour />
      </>
    );
    await act(async () => {});

    await act(async () => {
      screen.getByRole("button", { name: "Skip" }).click();
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(localStorage.getItem("bsit:tour:subjects")).not.toBeNull();
    expect(localStorage.getItem("bsit:tour:landing")).toBeNull();
  });
});
