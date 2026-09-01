// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopBar } from "./TopBar";

describe("TopBar", () => {
  it("marks the log-in link for the landing tour's closing step", () => {
    render(<TopBar userId={null} />);
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute(
      "data-tour",
      "landing-login"
    );
  });

  it("still marks the account link when signed in", () => {
    render(<TopBar userId="user-1" />);
    expect(screen.getByRole("link", { name: /my account/i })).toHaveAttribute(
      "data-tour",
      "landing-login"
    );
  });
});
