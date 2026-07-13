import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandmarkArt } from "./LandmarkArt";

describe("LandmarkArt", () => {
  it("renders the matched school's landmark image", () => {
    render(<LandmarkArt university="University of Santo Tomas" />);
    const img = screen.getByRole("presentation", { hidden: true });
    expect(img).toHaveAttribute("src", expect.stringContaining("ust"));
  });

  it("renders the default image for an unmatched school", () => {
    render(<LandmarkArt university="Cavite State University" />);
    const img = screen.getByRole("presentation", { hidden: true });
    expect(img).toHaveAttribute("src", expect.stringContaining("default"));
  });

  it("renders the default image for null university", () => {
    render(<LandmarkArt university={null} />);
    const img = screen.getByRole("presentation", { hidden: true });
    expect(img).toHaveAttribute("src", expect.stringContaining("default"));
  });
});
