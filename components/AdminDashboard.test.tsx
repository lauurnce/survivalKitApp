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
    waitlistEntries: [],
    waitlistAgg: { total: 0, by_year: [], by_subject: [] },
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
});
