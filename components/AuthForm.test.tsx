import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthForm } from "./AuthForm";

const noop = vi.fn(async () => ({}));

function schoolInput() {
  return screen.queryAllByRole("combobox").find((el) => el.tagName === "INPUT");
}

describe("AuthForm — signup", () => {
  it("asks for the school", () => {
    render(<AuthForm mode="signup" action={noop} next="/account" />);
    expect(schoolInput()).toHaveAttribute("name", "university");
  });

  it("asks whether the school is public or private", () => {
    render(<AuthForm mode="signup" action={noop} next="/account" />);
    expect(screen.getByRole("button", { name: "Public" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Private" })).toBeInTheDocument();
  });

  it("submits both school answers with the rest of the form", () => {
    const { container } = render(
      <AuthForm mode="signup" action={noop} next="/account" />
    );
    const form = container.querySelector("form");
    expect(form?.querySelector('input[name="university"]')).toBeInTheDocument();
    expect(form?.querySelector('input[name="schoolType"]')).toBeInTheDocument();
  });

  it("still asks for email and password", () => {
    const { container } = render(
      <AuthForm mode="signup" action={noop} next="/account" />
    );
    expect(container.querySelector('input[name="email"]')).toBeRequired();
    expect(container.querySelector('input[name="password"]')).toBeRequired();
  });
});

describe("AuthForm — login", () => {
  it("does not ask a returning student for their school", () => {
    render(<AuthForm mode="login" action={noop} next="/account" />);
    expect(schoolInput()).toBeUndefined();
  });

  it("does not ask a returning student for a sector", () => {
    render(<AuthForm mode="login" action={noop} next="/account" />);
    expect(screen.queryByRole("button", { name: "Public" })).not.toBeInTheDocument();
  });
});
