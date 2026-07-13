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

  it("shows all 25 options when focused with empty input", () => {
    render(<UniversityCombobox name="university" defaultValue="" className="" />);
    fireEvent.focus(screen.getByRole("combobox"));
    expect(screen.getAllByRole("option")).toHaveLength(25);
  });

  it("filters options live by substring, case-insensitively", () => {
    render(<UniversityCombobox name="university" defaultValue="" className="" />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "santo" } });
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
    fireEvent.change(input, { target: { value: "santo" } });
    fireEvent.mouseDown(screen.getByRole("option"));
    expect(input.value).toBe("University of Santo Tomas");
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });
});
