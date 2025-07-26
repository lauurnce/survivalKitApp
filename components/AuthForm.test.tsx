import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

describe("AuthForm — accessible password field", () => {
  it("gives the password field and visibility toggle distinct accessible names", () => {
    render(<AuthForm mode="login" action={noop} next="/account" />);

    const password = screen.getByLabelText("Password");
    const toggle = screen.getByRole("button", { name: "Show password" });

    expect(password).toHaveAttribute("type", "password");
    expect(toggle).toHaveAttribute("aria-controls", password.id);
    expect(toggle).toHaveClass("min-h-6", "min-w-6");

    fireEvent.click(toggle);

    expect(password).toHaveAttribute("type", "text");
    expect(toggle).toHaveAccessibleName("Hide password");
  });

  it("associates the signup password requirement with the field", () => {
    render(<AuthForm mode="signup" action={noop} next="/account" />);

    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription(
      "At least 8 characters.",
    );
  });
});

describe("AuthForm — return path round trip", () => {
  const next = "/year/y1/subjects/s1/modules/m1?print=1";

  it("signup's Log in link carries the same return path, query included", () => {
    render(<AuthForm mode="signup" action={noop} next={next} />);
    const href = screen.getByRole("link", { name: "Log in" }).getAttribute("href")!;
    const url = new URL(href, "https://x.test");
    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("next")).toBe(next);
  });

  it("login's Sign up link carries the same return path, query included", () => {
    render(<AuthForm mode="login" action={noop} next={next} />);
    const href = screen.getByRole("link", { name: "Sign up" }).getAttribute("href")!;
    const url = new URL(href, "https://x.test");
    expect(url.pathname).toBe("/signup");
    expect(url.searchParams.get("next")).toBe(next);
  });

  it("submits the return path with the form", () => {
    const { container } = render(<AuthForm mode="login" action={noop} next={next} />);
    expect(container.querySelector('input[name="next"]')).toHaveValue(next);
  });
});
