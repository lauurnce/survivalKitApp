import { afterEach, describe, it, expect, vi } from "vitest";
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

describe("SearchClient — query matching and the ?q= link (QA FL-07)", () => {
  const catalogue: SearchItem[] = [
    { type: "subject", id: "cp1", title: "Computer Programming 1", href: "/cp1", context: "1st Year" },
    { type: "module", id: "sql", title: "SQL Joins and Subqueries", href: "/sql", context: "2nd Year · Database Systems" },
    { type: "module", id: "ll", title: "Linked List", href: "/ll", context: "2nd Year · Data Structures and Algorithms" },
  ];

  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  function type(value: string) {
    fireEvent.change(screen.getByLabelText("Search subjects and modules"), { target: { value } });
  }

  it("matches every word of a multi-word query, not the whole phrase", () => {
    render(<SearchClient items={catalogue} />);
    type("SQL join");
    expect(screen.getByText("SQL Joins and Subqueries")).toBeInTheDocument();
  });

  it("expands course abbreviations like cp1", () => {
    render(<SearchClient items={catalogue} />);
    type("cp1");
    expect(screen.getByText("Computer Programming 1")).toBeInTheDocument();
  });

  it("treats a trailing plural as optional", () => {
    render(<SearchClient items={catalogue} />);
    type("linked lists");
    expect(screen.getByText("Linked List")).toBeInTheDocument();
  });

  it("opens with the query from ?q=", () => {
    window.history.replaceState(null, "", "/search?q=linked");
    render(<SearchClient items={catalogue} />);
    expect(screen.getByLabelText("Search subjects and modules")).toHaveValue("linked");
    expect(screen.getByText("Linked List")).toBeInTheDocument();
  });

  it("writes the typed query back into the URL, and removes it when cleared", () => {
    window.history.replaceState(null, "", "/search");
    render(<SearchClient items={catalogue} />);
    type("sql join");
    expect(new URL(window.location.href).searchParams.get("q")).toBe("sql join");
    type("");
    expect(new URL(window.location.href).searchParams.has("q")).toBe(false);
  });
});
