// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FaqPage from "./page";
import { PLANS } from "@/lib/paymongo";
import { formatPeso } from "@/lib/pricing";

describe("FaqPage", () => {
  it("renders exactly 6 questions", () => {
    render(<FaqPage />);
    const questions = screen.getAllByRole("heading", { level: 2 });
    expect(questions).toHaveLength(6);
  });

  it("says lessons are free but reviewers are paid, never that everything is free (QA CT-05)", () => {
    const { container } = render(<FaqPage />);
    expect(screen.getByText(/is this actually free/i)).toBeInTheDocument();
    expect(container.textContent).toMatch(/free to read/i);
    expect(container.textContent).toMatch(/reviewers[^.]*are paid/i);
    expect(container.textContent).not.toMatch(/at no cost/i);
  });

  it("quotes every plan price from PLANS rather than a hard-coded number", () => {
    const { container } = render(<FaqPage />);
    expect(screen.getByText(/how much do the reviewers cost/i)).toBeInTheDocument();
    for (const plan of Object.values(PLANS)) {
      expect(container.textContent).toContain(formatPeso(plan.amount));
    }
  });

  it("answers what your email is used for, without advertising the retired waitlist", () => {
    const { container } = render(<FaqPage />);
    expect(screen.getByText(/what is my email used for/i)).toBeInTheDocument();
    expect(screen.getByText(/collected when you create an account/i)).toBeInTheDocument();
    expect(screen.getByText(/we never sell your data/i)).toBeInTheDocument();
    // Data does go to service providers (privacy policy section 4), so the
    // FAQ must not claim it is never shared (QA CT-06).
    expect(container.textContent).not.toMatch(/sell or share/i);
    expect(container.textContent).not.toMatch(/waitlist/i);
    expect(container.textContent).not.toMatch(/leave your email/i);
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
