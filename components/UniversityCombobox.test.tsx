import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UniversityCombobox } from "./UniversityCombobox";

describe("UniversityCombobox", () => {
  it("renders a text input with the given name and default value", () => {
    render(<UniversityCombobox name="university" defaultValue="" className="" />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input).toHaveAttribute("name", "university");
    expect(input.value).toBe("");
  });

  it("shows the default value pre-filled", () => {
    render(<UniversityCombobox name="university" defaultValue="University of Santo Tomas" className="" />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("University of Santo Tomas");
  });

  it("shows no dropdown list until the input is focused", () => {
    render(<UniversityCombobox name="university" defaultValue="" className="" />);
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("shows all 50 options when focused with empty input", () => {
    render(<UniversityCombobox name="university" defaultValue="" className="" />);
    fireEvent.focus(screen.getByRole("combobox"));
    expect(screen.getAllByRole("option")).toHaveLength(50);
  });

  it("filters options live by substring, case-insensitively", () => {
    render(<UniversityCombobox name="university" defaultValue="" className="" />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "santo tomas" } });
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("University of Santo Tomas");
  });

  it("allows free text that matches no option — no options shown, input keeps the typed value", () => {
    render(<UniversityCombobox name="university" defaultValue="" className="" />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Cavite State University" } });
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    expect(input.value).toBe("Cavite State University");
  });

  it("clicking an option fills the input with the canonical name and closes the list", () => {
    render(<UniversityCombobox name="university" defaultValue="" className="" />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "santo tomas" } });
    fireEvent.mouseDown(screen.getByRole("option"));
    expect(input.value).toBe("University of Santo Tomas");
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });
});

describe("UniversityCombobox — acronym search", () => {
  it("finds a school by an acronym its canonical name does not contain", () => {
    render(<UniversityCombobox name="university" defaultValue="" className="" />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "PUP" } });
    expect(screen.getByRole("option")).toHaveTextContent(
      "Polytechnic University of the Philippines"
    );
  });

  it("finds a school by a hyphenated alias", () => {
    render(<UniversityCombobox name="university" defaultValue="" className="" />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "MSU-IIT" } });
    expect(screen.getAllByRole("option")[0]).toHaveTextContent(
      "Mindanao State University – Iligan Institute of Technology"
    );
  });
});

describe("UniversityCombobox — keyboard", () => {
  function openWith(value: string) {
    render(<UniversityCombobox name="university" defaultValue="" className="" />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value } });
    return input;
  }

  it("ArrowDown highlights the first option", () => {
    openWith("la salle");
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
    expect(screen.getAllByRole("option")[0]).toHaveAttribute("aria-selected", "true");
  });

  it("ArrowDown twice highlights the second option", () => {
    openWith("state university");
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "false");
    expect(options[1]).toHaveAttribute("aria-selected", "true");
  });

  it("ArrowUp from the top wraps to the last option", () => {
    openWith("la salle");
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    const options = screen.getAllByRole("option");
    expect(options[options.length - 1]).toHaveAttribute("aria-selected", "true");
  });

  it("Enter picks the highlighted option and closes the list", () => {
    const input = openWith("santo tomas");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect((input as HTMLInputElement).value).toBe("University of Santo Tomas");
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("Enter with nothing highlighted leaves the typed text alone", () => {
    const input = openWith("santo tomas");
    fireEvent.keyDown(input, { key: "Enter" });
    expect((input as HTMLInputElement).value).toBe("santo tomas");
  });

  it("Escape closes the list without changing the typed text", () => {
    const input = openWith("santo tomas");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe("santo tomas");
  });
});

describe("UniversityCombobox — onSchoolChange", () => {
  it("reports the catalog entry when an option is picked", () => {
    const seen: (string | null)[] = [];
    render(
      <UniversityCombobox
        name="university"
        defaultValue=""
        className=""
        onSchoolChange={(entry) => seen.push(entry?.slug ?? null)}
      />
    );
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "santo tomas" } });
    fireEvent.mouseDown(screen.getByRole("option"));
    expect(seen.at(-1)).toBe("ust");
  });

  it("reports the catalog entry when the student types an exact alias", () => {
    const seen: (string | null)[] = [];
    render(
      <UniversityCombobox
        name="university"
        defaultValue=""
        className=""
        onSchoolChange={(entry) => seen.push(entry?.slug ?? null)}
      />
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "PUP" } });
    expect(seen.at(-1)).toBe("pup");
  });

  it("reports null while the typed text matches no school", () => {
    const seen: (string | null)[] = [];
    render(
      <UniversityCombobox
        name="university"
        defaultValue=""
        className=""
        onSchoolChange={(entry) => seen.push(entry?.slug ?? null)}
      />
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Cavite State University" },
    });
    expect(seen.at(-1)).toBeNull();
  });
});
