// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import type { ComponentProps } from "react";
import { AdminDashboard } from "./AdminDashboard";

// Props is not exported from AdminDashboard.tsx, so derive the fixture's type
// from the component itself. This guarantees the fixture typechecks against
// whatever the real interface is — including after later tasks change it —
// rather than a hand-copied shape silently drifting from the source of truth.
type DashboardProps = ComponentProps<typeof AdminDashboard>;

function makeDashboardProps(overrides: Partial<DashboardProps> = {}): DashboardProps {
  return {
    funnel: [],
    dau: [],
    topSubjects: [],
    topModules: [],
    topSections: [],
    totalUniqueUsers: 5668,
    todayUsers: 73,
    last7Sessions: 624,
    activeNow: 1,
    newUsers: 66,
    totalRevenue: 0,
    monthlyRevenue: [],
    activeSubscribers: 0,
    newSubscribersToday: 0,
    feedbackAgg: {
      total: 214,
      avg_app_rating: 4.32,
      avg_module_rating: 4.1,
      recent_comments: [
        { feedback_text: "Really helped me review for finals!", created_at: "2026-08-19T10:00:00Z" },
        { feedback_text: "More practice questions please", created_at: "2026-08-18T09:00:00Z" },
        { feedback_text: "Clean layout, easy to navigate", created_at: "2026-08-17T08:00:00Z" },
      ],
    },
    profilesAgg: {
      total: 12,
      by_pathway: [{ pathway: "IT Support", count: 7 }],
      by_university: [{ university: "Polytechnic University of the Philippines", count: 2 }],
      by_major: [{ major: "BS Information Technology", count: 9 }],
    },
    transactions: [],
    unreflectedPayments: [],
    reconcileError: null,
    ...overrides,
  };
}

describe("AdminDashboard (label and normalisation)", () => {
  it("renders a long university name in full, not only in a title attribute", () => {
    const full = "Polytechnic University of the Philippines";
    render(<AdminDashboard {...makeDashboardProps({
      profilesAgg: {
        total: 2,
        by_pathway: [],
        by_university: [{ university: full, count: 2 }],
        by_major: [],
      },
    })} />);
    // jsdom cannot see CSS clipping -- `truncate` hides text visually while
    // leaving it in the DOM, so getByText passes either way and would guard
    // nothing. Assert the mechanism instead: the label must not carry
    // `truncate`, and must keep `shrink-0` so the bar column stays aligned.
    const label = screen.getByText(full);
    expect(label.className).not.toMatch(/\btruncate\b/);
    expect(label.className).toMatch(/\bshrink-0\b/);
  });

  it("merges the four observed BSIT spellings into one row of 12", () => {
    render(<AdminDashboard {...makeDashboardProps({
      profilesAgg: {
        total: 12,
        by_pathway: [],
        by_university: [],
        by_major: [
          { major: "BS Information Technology", count: 9 },
          { major: "BS INFORMATION TECHNOLOGY", count: 1 },
          { major: "BSIT", count: 1 },
          { major: "BS Information technology", count: 1 },
        ],
      },
    })} />);
    expect(screen.getAllByText("BS Information Technology")).toHaveLength(1);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.queryByText("BSIT")).toBeNull();
  });
});

describe("AdminDashboard (characterization)", () => {
  it("renders every numbered section band in order", () => {
    render(<AdminDashboard {...makeDashboardProps()} />);
    const bands = screen
      .getAllByTestId("section-band-eyebrow")
      .map((n) => n.textContent);
    expect(bands).toEqual(["01", "02", "03", "04", "05", "06", "07"]);
  });

  it("renders the Devices reached tile sourced from the same total", () => {
    render(<AdminDashboard {...makeDashboardProps()} />);
    expect(screen.getByText("5,668")).toBeInTheDocument();
    expect(screen.getByText(/Devices reached/i)).toBeInTheDocument();
  });

  it("does not render the deleted Recurring Users tile", () => {
    render(<AdminDashboard {...makeDashboardProps()} />);
    expect(screen.queryByText(/Recurring/i)).toBeNull();
  });

  it("does not render the deleted Approved Unlocks tile", () => {
    render(<AdminDashboard {...makeDashboardProps()} />);
    expect(screen.queryByText(/Approved Unlocks/i)).toBeNull();
  });

  it("renders one BarChart row per datum with its count", () => {
    render(<AdminDashboard {...makeDashboardProps()} />);
    expect(screen.getByText("IT Support")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("shows the full university name in the label's title attribute", () => {
    render(<AdminDashboard {...makeDashboardProps()} />);
    const label = screen.getByTitle("Polytechnic University of the Philippines");
    expect(label).toBeInTheDocument();
  });

  it("does not render the removed Waitlist section", () => {
    render(<AdminDashboard {...makeDashboardProps()} />);
    expect(screen.queryByText(/Waitlist/i)).toBeNull();
  });

  it("renders the feedback summary with counts, average ratings and recent comments", () => {
    render(<AdminDashboard {...makeDashboardProps()} />);
    expect(screen.getAllByText(/Feedback/i).length).toBeGreaterThan(0);
    expect(screen.getByText("214")).toBeInTheDocument();
    expect(screen.getByText("4.32")).toBeInTheDocument();
    expect(screen.getByText("4.1")).toBeInTheDocument();
    expect(screen.getByText(/Really helped me review for finals!/i)).toBeInTheDocument();
    expect(screen.getByText(/More practice questions please/i)).toBeInTheDocument();
    expect(screen.getByText(/Clean layout, easy to navigate/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /feedback/i })).toHaveAttribute("href", "/admin/feedback");
  });

  it("renders 'not read' when the feedback aggregate is absent, never a zero", () => {
    // The RPC behind this is unapplied, so absent is the CURRENT state, not a
    // hypothetical. A zero here would be indistinguishable from genuinely
    // having no feedback -- and user_feedback holds real rows.
    render(<AdminDashboard {...makeDashboardProps({ feedbackAgg: null })} />);
    // Both the section header and the body say it — the header must not claim
    // a response count it does not have either.
    expect(screen.getAllByText(/not read/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(/No feedback yet/i)).toBeNull();
    expect(screen.queryByText("0 responses")).toBeNull();
  });

  it("still says 'no feedback yet' when the aggregate really is zero", () => {
    // Absent and zero must stay distinguishable in both directions.
    render(<AdminDashboard {...makeDashboardProps({
      feedbackAgg: { total: 0, avg_app_rating: null, avg_module_rating: null, recent_comments: [] },
    })} />);
    expect(screen.getByText(/No feedback yet/i)).toBeInTheDocument();
    expect(screen.queryByText(/not read/i)).toBeNull();
  });

  it("does not render anything identifying in the feedback summary", () => {
    render(<AdminDashboard {...makeDashboardProps()} />);
    expect(screen.queryByText(/device_id/i)).toBeNull();
    expect(screen.queryByText(/user_id/i)).toBeNull();
    expect(screen.queryByText(/coupon/i)).toBeNull();
  });
});
