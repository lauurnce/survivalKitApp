// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextAvailableLesson } from "./NextAvailableLesson";

describe("NextAvailableLesson", () => {
  it("links the sibling subject's first lesson", () => {
    render(
      <NextAvailableLesson
        yearId="y2"
        next={{
          subject: { id: "dsa", title: "Data Structures and Algorithms", sort_order: 1 },
          module: { id: "m1", title: "Introduction to Data Structures", sort_order: 1 },
        }}
      />,
    );
    expect(screen.getByRole("heading", { name: "Introduction to Data Structures" })).toBeInTheDocument();
    expect(screen.getByText("From Data Structures and Algorithms. Free to read.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start lesson/ })).toHaveAttribute(
      "href",
      "/year/y2/subjects/dsa/modules/m1",
    );
  });

  it("renders nothing when the year has no other lesson", () => {
    const { container } = render(<NextAvailableLesson yearId="y2" next={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
