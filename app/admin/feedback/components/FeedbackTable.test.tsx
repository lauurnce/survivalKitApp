// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeedbackTable } from "./FeedbackTable";

const base = {
  created_at: "2026-07-18T10:00:00Z",
  module_name: "Intro",
  app_rating: 5,
  module_rating: 4,
  feedback_text: "ok",
  is_quality_approved: true,
  coupon_code: null,
};

describe("FeedbackTable user column (GT-07)", () => {
  it("shows the registered user's name and email instead of N/A", () => {
    render(
      <FeedbackTable
        data={[
          { ...base, id: "a", user_id: "user-1", user_email: "juan@example.com", user_name: "Juan Dela Cruz", is_anonymous: false },
          { ...base, id: "b", user_id: "0f1e2d3c-aaaa-4bbb-8ccc-123456789abc", user_email: null, user_name: null, is_anonymous: false },
          { ...base, id: "c", user_id: null, user_email: null, is_anonymous: true },
        ]}
        onSort={() => {}}
        currentSort="created_at"
      />,
    );
    expect(screen.getByText("juan@example.com")).toBeInTheDocument();
    expect(screen.getByText("Juan Dela Cruz")).toBeInTheDocument();
    expect(screen.getByText("0f1e2d3c…")).toBeInTheDocument();
    expect(screen.getByText("Anonymous")).toBeInTheDocument();
    expect(screen.queryByText("N/A")).not.toBeInTheDocument();
  });
});
