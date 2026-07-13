// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

vi.mock("@/lib/progress", () => ({
  fetchCompletedModules: () => Promise.resolve(new Set<string>()),
  setModuleCompleted: () => Promise.resolve(true),
}));

// The dialog has its own tests — stub it so this test stays about the toggle
// and the portaled snackbar's click-bubbling behavior.
vi.mock("@/components/share/ShareProgressCard", () => ({
  ShareProgressCard: () => <div data-testid="share-dialog" />,
}));

import { ModuleDoneToggle } from "./ModuleDoneToggle";

const SHARE = {
  subjectId: "s1",
  subjectTitle: "CP1",
  moduleTitle: "Loops",
  moduleIds: ["m1"],
};

describe("ModuleDoneToggle — portal click bubbling regression", () => {
  it("clicking the snackbar's Share button opens the dialog without navigating the surrounding Link", async () => {
    const navSpy = vi.fn();
    render(
      <a href="/somewhere" onClick={navSpy}>
        <ModuleDoneToggle moduleId="m1" share={SHARE} />
      </a>
    );

    const toggleBtn = await screen.findByRole("button", { name: /mark done/i });
    fireEvent.click(toggleBtn);

    const shareBtn = await screen.findByRole("button", { name: /share your progress/i });
    fireEvent.click(shareBtn);

    await screen.findByTestId("share-dialog");
    expect(navSpy).not.toHaveBeenCalled();
  });

  it("clicking Dismiss removes the snackbar without navigating the surrounding Link", async () => {
    const navSpy = vi.fn();
    render(
      <a href="/somewhere" onClick={navSpy}>
        <ModuleDoneToggle moduleId="m1" share={SHARE} />
      </a>
    );

    const toggleBtn = await screen.findByRole("button", { name: /mark done/i });
    fireEvent.click(toggleBtn);

    const dismissBtn = await screen.findByRole("button", { name: /dismiss/i });
    fireEvent.click(dismissBtn);

    await waitFor(() =>
      expect(screen.queryByText(/nice! one more down/i)).not.toBeInTheDocument()
    );
    expect(navSpy).not.toHaveBeenCalled();
  });
});
