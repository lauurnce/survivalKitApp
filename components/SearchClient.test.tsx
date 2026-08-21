import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchClient, type SearchItem } from "./SearchClient";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const items: SearchItem[] = [
  {
    type: "subject",
    id: "s1",
    title: "Data Structures",
    href: "/year/1/subjects/s1/modules",
    context: "1st Year",
  },
  {
    type: "module",
    id: "m1",
    title: "Networking Basics",
    href: "/year/1/subjects/s2/modules/m1",
    context: "1st Year · Networking",
  },
];

describe("SearchClient", () => {
  it("renders suggestion chips before any query is typed", () => {
    render(<SearchClient items={items} suggestions={["Data", "Networking"]} />);
    expect(screen.getByRole("button", { name: "Data" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Networking" })).toBeInTheDocument();
  });

  it("omits the chip block when no suggestions are given", () => {
    render(<SearchClient items={items} />);
    expect(screen.queryByText("Popular topics")).not.toBeInTheDocument();
  });

  it("runs the search when a chip is clicked", () => {
    render(<SearchClient items={items} suggestions={["Data", "Networking"]} />);
    fireEvent.click(screen.getByRole("button", { name: "Data" }));
    expect(screen.getByText("Data Structures")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Data" })).not.toBeInTheDocument();
  });

  it("filters results as the student types", () => {
    render(<SearchClient items={items} suggestions={["Data"]} />);
    fireEvent.change(screen.getByLabelText("Search subjects and modules"), {
      target: { value: "Networking" },
    });
    expect(screen.getByText("Networking Basics")).toBeInTheDocument();
    expect(screen.queryByText("Data Structures")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Data" })).not.toBeInTheDocument();
  });
});
