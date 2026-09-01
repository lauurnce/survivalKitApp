// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FaqPage from "./page";

describe("FaqPage", () => {
  it("renders exactly 5 questions", () => {
    render(<FaqPage />);
    const questions = screen.getAllByRole("heading", { level: 2 });
    expect(questions).toHaveLength(5);
  });

  it("answers whether the app is actually free, grounded in the homepage's existing copy", () => {
    render(<FaqPage />);
    expect(screen.getByText(/is this actually free/i)).toBeInTheDocument();
    expect(screen.getByText(/free to read/i)).toBeInTheDocument();
  });

  it("answers what the waitlist email is used for, grounded in the homepage footer copy", () => {
    render(<FaqPage />);
    expect(screen.getByText(/what does the waitlist email get used for/i)).toBeInTheDocument();
    expect(
      screen.getByText(/we collect emails only to notify you when content is ready/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/we don.t sell or share your data/i)).toBeInTheDocument();
  });

  it("answers whether an account is needed to read modules", () => {
    render(<FaqPage />);
    expect(screen.getByText(/do i need an account to read modules/i)).toBeInTheDocument();
  });

  it("answers how content is organized, by year and subject", () => {
    render(<FaqPage />);
    expect(screen.getByText(/how is content organized/i)).toBeInTheDocument();
  });

  it("answers when 'coming soon' sections will be ready", () => {
    render(<FaqPage />);
    expect(screen.getAllByText(/coming soon/i).length).toBeGreaterThan(0);
  });

  it("links back to the homepage", () => {
    render(<FaqPage />);
    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute("href", "/");
  });
});
