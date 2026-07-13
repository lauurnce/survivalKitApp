// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

let completedSet = new Set<string>();
vi.mock("@/lib/progress", () => ({
  fetchCompletedModules: () => Promise.resolve(completedSet),
}));

// The dialog has its own tests — stub it so this test stays about the button.
vi.mock("./ShareProgressCard", () => ({
  ShareProgressCard: () => <div data-testid="share-dialog" />,
}));

import { ShareProgressButton } from "./ShareProgressButton";

const PROPS = {
  subjectId: "11111111-2222-3333-4444-555555555555",
  subjectTitle: "CP1",
  moduleIds: ["m1", "m2"],
};

describe("ShareProgressButton", () => {
  it("renders nothing when no modules are completed", async () => {
    completedSet = new Set();
    const { container } = render(<ShareProgressButton {...PROPS} />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("shows the count and opens the dialog on click", async () => {
    completedSet = new Set(["m1", "m2"]);
    render(<ShareProgressButton {...PROPS} />);
    const btn = await screen.findByRole("button", { name: /share progress · 2 done/i });
    btn.click();
    await screen.findByTestId("share-dialog");
  });
});
