import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DangerZone } from "./DangerZone";

describe("DangerZone", () => {
  it("is always visible with its title, warning, and delete trigger", () => {
    render(<DangerZone />);
    expect(
      screen.getByRole("heading", { name: /danger zone/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete my account/i })
    ).toBeInTheDocument();
  });
});

describe("DangerZone copy (GT-19)", () => {
  it("doesn't promise to remove progress, which deletion anonymises instead", () => {
    render(<DangerZone />);
    expect(screen.queryByText(/removes your profile, progress/i)).not.toBeInTheDocument();
    expect(screen.getByText(/unlinks your name from your progress/i)).toBeInTheDocument();
  });
});
