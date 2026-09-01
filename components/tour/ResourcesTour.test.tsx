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
      <section data-tour="resources-quiz">quiz section</section>
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
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
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

  it("walks all 3 steps in order: playground, search, quiz", async () => {
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
    await clickNext();
    expect(screen.getByRole("heading", { name: "Quiz yourself" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
  });

  it("anchors the quiz step to the section wrapper regardless of signed-in/anon quiz content", async () => {
    // Simulates the anon rendering of the quiz section (sign-in prompt
    // instead of <SubjectQuizList />) — same data-tour target either way.
    render(
      <>
        <a href="/playground" data-tour="resources-playground">playground card</a>
        <a href="/search" data-tour="resources-search">search card</a>
        <section data-tour="resources-quiz">
          <p>Sign in to quiz yourself.</p>
        </section>
        <ResourcesTour userId={USER_ID} />
      </>
    );
    await act(async () => {});

    await clickNext(); // playground -> search
    await clickNext(); // search -> quiz

    expect(screen.getByRole("heading", { name: "Quiz yourself" })).toBeInTheDocument();
    expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
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
