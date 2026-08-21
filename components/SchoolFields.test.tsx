import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SchoolFields } from "./SchoolFields";

function schoolInput() {
  const input = screen.getAllByRole("combobox").find((el) => el.tagName === "INPUT");
  if (!input) throw new Error("No combobox-role <input> found");
  return input as HTMLInputElement;
}

const sectorButton = (name: "Public" | "Private") =>
  screen.getByRole("button", { name });

function hiddenSchoolType(container: HTMLElement) {
  const el = container.querySelector('input[name="schoolType"]');
  if (!el) throw new Error("No schoolType input found");
  return el as HTMLInputElement;
}

function open(value: string) {
  const input = schoolInput();
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value } });
  return input;
}

function type(value: string) {
  const input = open(value);
  fireEvent.blur(input);
  return input;
}

describe("SchoolFields — structure", () => {
  it("submits the school under the name the profile column uses", () => {
    render(<SchoolFields />);
    expect(schoolInput()).toHaveAttribute("name", "university");
  });

  it("requires the school, because signup will not accept a blank one", () => {
    render(<SchoolFields />);
    expect(schoolInput()).toBeRequired();
  });

  it("offers exactly two sectors", () => {
    render(<SchoolFields />);
    expect(sectorButton("Public")).toBeInTheDocument();
    expect(sectorButton("Private")).toBeInTheDocument();
  });

  it("starts with neither sector chosen", () => {
    render(<SchoolFields />);
    expect(sectorButton("Public")).toHaveAttribute("aria-pressed", "false");
    expect(sectorButton("Private")).toHaveAttribute("aria-pressed", "false");
  });

  it("starts with an empty schoolType value, so a skipped answer stays empty", () => {
    const { container } = render(<SchoolFields />);
    expect(hiddenSchoolType(container).value).toBe("");
  });
});

describe("SchoolFields — sector auto-fill", () => {
  it("presses Private when the student picks a private school from the list", () => {
    render(<SchoolFields />);
    open("santo tomas");
    fireEvent.mouseDown(screen.getByRole("option"));
    expect(sectorButton("Private")).toHaveAttribute("aria-pressed", "true");
    expect(sectorButton("Public")).toHaveAttribute("aria-pressed", "false");
  });

  it("presses Public when the student picks a state school from the list", () => {
    render(<SchoolFields />);
    open("Polytechnic");
    // Two schools carry "Polytechnic" in their name; take the one we mean.
    const option = screen.getAllByRole("option")[0];
    expect(option).toHaveTextContent("Polytechnic University of the Philippines");
    fireEvent.mouseDown(option);
    expect(sectorButton("Public")).toHaveAttribute("aria-pressed", "true");
  });

  it("presses the sector when the student types a bare acronym", () => {
    render(<SchoolFields />);
    type("PUP");
    expect(sectorButton("Public")).toHaveAttribute("aria-pressed", "true");
  });

  it("says so when it filled the sector in itself", () => {
    render(<SchoolFields />);
    type("PUP");
    expect(screen.getByText(/auto-filled/i)).toBeInTheDocument();
  });

  it("carries the auto-filled sector in the submitted value", () => {
    const { container } = render(<SchoolFields />);
    type("PUP");
    expect(hiddenSchoolType(container).value).toBe("Public");
  });

  it("leaves the sector alone for a school outside the catalog", () => {
    render(<SchoolFields />);
    type("Cavite State University");
    expect(sectorButton("Public")).toHaveAttribute("aria-pressed", "false");
    expect(sectorButton("Private")).toHaveAttribute("aria-pressed", "false");
  });

  it("clears an auto-filled sector when the school is edited into free text", () => {
    render(<SchoolFields />);
    type("PUP");
    expect(sectorButton("Public")).toHaveAttribute("aria-pressed", "true");
    type("Cavite State University");
    expect(sectorButton("Public")).toHaveAttribute("aria-pressed", "false");
  });
});

describe("SchoolFields — the student's own answer wins", () => {
  it("presses the sector the student clicks", () => {
    const { container } = render(<SchoolFields />);
    fireEvent.click(sectorButton("Private"));
    expect(sectorButton("Private")).toHaveAttribute("aria-pressed", "true");
    expect(hiddenSchoolType(container).value).toBe("Private");
  });

  it("drops the auto-filled note once the student sets the sector themselves", () => {
    render(<SchoolFields />);
    type("PUP");
    fireEvent.click(sectorButton("Private"));
    expect(screen.queryByText(/auto-filled/i)).not.toBeInTheDocument();
  });

  it("does not overwrite a hand-set sector when a school is picked afterwards", () => {
    const { container } = render(<SchoolFields />);
    fireEvent.click(sectorButton("Private"));
    type("PUP");
    expect(sectorButton("Private")).toHaveAttribute("aria-pressed", "true");
    expect(hiddenSchoolType(container).value).toBe("Private");
  });

  it("does not clear a hand-set sector when the school becomes free text", () => {
    const { container } = render(<SchoolFields />);
    fireEvent.click(sectorButton("Public"));
    type("Cavite State University");
    expect(hiddenSchoolType(container).value).toBe("Public");
  });
});

describe("SchoolFields — landmark preview", () => {
  it("invites the student to pick a school before one is chosen", () => {
    render(<SchoolFields />);
    expect(screen.getByText(/pick a school/i)).toBeInTheDocument();
  });

  it("names the landmark once a school with one is chosen", () => {
    render(<SchoolFields />);
    type("BISU");
    expect(screen.getByText("BISU Main Admin Building")).toBeInTheDocument();
  });

  it("falls back to the school name for a school with no named landmark", () => {
    render(<SchoolFields />);
    type("UST");
    expect(screen.getByText("University of Santo Tomas")).toBeInTheDocument();
  });

  it("says plainly that a school outside the catalog has no art yet", () => {
    render(<SchoolFields />);
    type("Cavite State University");
    expect(screen.getByText(/no art for this school yet/i)).toBeInTheDocument();
  });
});

describe("SchoolFields — existing answers", () => {
  it("prefills the school it was given", () => {
    render(<SchoolFields defaultUniversity="University of Santo Tomas" />);
    expect(schoolInput().value).toBe("University of Santo Tomas");
  });

  it("presses the sector it was given", () => {
    render(
      <SchoolFields defaultUniversity="University of Santo Tomas" defaultSchoolType="Private" />
    );
    expect(sectorButton("Private")).toHaveAttribute("aria-pressed", "true");
  });

  it("does not call a saved sector auto-filled — the student gave us that", () => {
    render(
      <SchoolFields defaultUniversity="University of Santo Tomas" defaultSchoolType="Private" />
    );
    expect(screen.queryByText(/auto-filled/i)).not.toBeInTheDocument();
  });

  it("leaves a saved school with no saved sector unpressed rather than guessing", () => {
    render(<SchoolFields defaultUniversity="University of Santo Tomas" />);
    expect(sectorButton("Private")).toHaveAttribute("aria-pressed", "false");
    expect(sectorButton("Public")).toHaveAttribute("aria-pressed", "false");
  });
});
