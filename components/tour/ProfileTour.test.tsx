// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { ProfileTour } from "./ProfileTour";

function Anchors() {
  return (
    <>
      <div data-tour="profile-card">profile card</div>
      <div data-tour="profile-danger">danger zone</div>
      <div data-tour="profile-tour-replay">guided tour</div>
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

describe("ProfileTour", () => {
  it("auto-runs for a first-time visitor, starting on the profile-card step", async () => {
    render(
      <>
        <Anchors />
        <ProfileTour />
      </>
    );
    await act(async () => {});

    expect(screen.getByRole("heading", { name: "Your account" })).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  });

  it("never runs again once bsit:tour:profile is set", async () => {
    localStorage.setItem("bsit:tour:profile", "1");
    render(
      <>
        <Anchors />
        <ProfileTour />
      </>
    );
    await act(async () => {});

    expect(screen.queryByRole("heading", { name: "Your account" })).not.toBeInTheDocument();
  });

  it("walks all three steps in order: profile-card, danger zone, then guided tour", async () => {
    render(
      <>
        <Anchors />
        <ProfileTour />
      </>
    );
    await act(async () => {});

    expect(screen.getByRole("heading", { name: "Your account" })).toBeInTheDocument();
    await clickNext();
    expect(screen.getByRole("heading", { name: "Danger zone" })).toBeInTheDocument();
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    await clickNext();
    expect(screen.getByRole("heading", { name: "Guided tour" })).toBeInTheDocument();
    expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
  });

  it("gives the danger-zone step informational copy, not an invitation to click through it", async () => {
    render(
      <>
        <Anchors />
        <ProfileTour />
      </>
    );
    await act(async () => {});
    await clickNext();

    expect(
      screen.getByText(/this is where irreversible actions live/i)
    ).toBeInTheDocument();
  });

  it("marks only bsit:tour:profile done when Skip is used, leaving other tours untouched", async () => {
    localStorage.setItem("bsit:tour:landing", "1");
    render(
      <>
        <Anchors />
        <ProfileTour />
      </>
    );
    await act(async () => {});

    await act(async () => {
      screen.getByRole("button", { name: "Skip" }).click();
    });

    expect(screen.queryByRole("heading", { name: "Your account" })).not.toBeInTheDocument();
    expect(localStorage.getItem("bsit:tour:profile")).not.toBeNull();
    expect(localStorage.getItem("bsit:tour:landing")).toBe("1");
  });
});
