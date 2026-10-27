// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { ResourcesTour } from "./ResourcesTour";

const USER_ID = "11111111-1111-1111-1111-111111111111";

function Anchors() {
  return (
    <>
      <a href="/playground" data-tour="resources-playground">playground card</a>
      <a href="/search" data-tour="resources-search">search card</a>
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

describe("ResourcesTour", () => {
  it("auto-runs for a first-time signed-in visitor, starting on the playground step", async () => {
    render(
      <>
        <Anchors />
        <ResourcesTour userId={USER_ID} />
      </>
    );
    await act(async () => {});

    expect(screen.getByRole("heading", { name: "Code playground" })).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
  });

  it("never runs for an anonymous visitor (userId null)", async () => {
    render(
      <>
        <Anchors />
        <ResourcesTour userId={null} />
      </>
    );
    await act(async () => {});

    expect(screen.queryByRole("heading", { name: "Code playground" })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("never runs again once bsit:tour:resources is set", async () => {
    localStorage.setItem("bsit:tour:resources", "1");
    render(
      <>
        <Anchors />
        <ResourcesTour userId={USER_ID} />
      </>
    );
    await act(async () => {});

    expect(screen.queryByRole("heading", { name: "Code playground" })).not.toBeInTheDocument();
  });

  it("walks both steps in order: playground, search", async () => {
    render(
      <>
        <Anchors />
        <ResourcesTour userId={USER_ID} />
      </>
    );
    await act(async () => {});

    expect(screen.getByRole("heading", { name: "Code playground" })).toBeInTheDocument();
    await clickNext();
    expect(screen.getByRole("heading", { name: "Search the kit" })).toBeInTheDocument();
    expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Quiz yourself" })).not.toBeInTheDocument();
  });

  it("marks the tour done and closes it when Skip is used, and only touches this tour's key", async () => {
    localStorage.setItem("bsit:tour:landing", "1"); // unrelated tour, already done
    render(
      <>
        <Anchors />
        <ResourcesTour userId={USER_ID} />
      </>
    );
    await act(async () => {});

    await act(async () => {
      screen.getByRole("button", { name: "Skip" }).click();
    });

    expect(screen.queryByRole("heading", { name: "Code playground" })).not.toBeInTheDocument();
    expect(localStorage.getItem("bsit:tour:resources")).not.toBeNull();
    expect(localStorage.getItem("bsit:tour:landing")).toBe("1");
  });
});
