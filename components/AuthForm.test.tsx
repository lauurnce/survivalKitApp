// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthForm } from "./AuthForm";

const action = vi.fn(async () => ({}));

describe("AuthForm", () => {
  it("gives the password field and visibility toggle distinct accessible names", () => {
    render(<AuthForm mode="login" action={action} next="/account" />);

    const password = screen.getByLabelText("Password");
    const toggle = screen.getByRole("button", { name: "Show password" });

    expect(password).toHaveAttribute("type", "password");
    expect(toggle).toHaveAttribute("aria-controls", password.id);

    fireEvent.click(toggle);

    expect(password).toHaveAttribute("type", "text");
    expect(toggle).toHaveAccessibleName("Hide password");
  });

  it("associates the signup password requirement with the field", () => {
    render(<AuthForm mode="signup" action={action} next="/account" />);

    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription(
      "At least 8 characters.",
    );
  });
});
