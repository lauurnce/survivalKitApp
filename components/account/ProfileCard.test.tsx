import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileCard } from "./ProfileCard";

// saveProfileAction is a server action imported by ProfileCard; stub it so
// the component can render in jsdom without a server.
vi.mock("@/app/account/actions", () => ({
  saveProfileAction: vi.fn(),
}));

// Note: the modal's Gender <select> also carries an implicit ARIA role of
// "combobox" (current HTML-AAM mapping, as reflected by this repo's
// aria-query/testing-library versions), so a bare screen.getByRole("combobox")
// matches two elements once the university field is wired up too. We
// disambiguate by filtering to the <input> element — the university field is
// the only combobox-role <input> in the form, the Gender combobox is a
// <select>.
function getUniversityCombobox() {
  const candidates = screen.getAllByRole("combobox");
  const input = candidates.find((el) => el.tagName === "INPUT");
  if (!input) throw new Error("No combobox-role <input> found");
  return input as HTMLInputElement;
}

describe("ProfileCard edit modal", () => {
  it("renders the UniversityCombobox (role=combobox) instead of a plain text input for university", () => {
    render(<ProfileCard profile={null} />);
    fireEvent.click(screen.getByText("Add your info"));
    expect(getUniversityCombobox()).toBeInTheDocument();
  });

  it("pre-fills the combobox with the existing profile's university", () => {
    render(
      <ProfileCard
        profile={{
          firstName: "Juan",
          lastName: "Dela Cruz",
          age: null,
          gender: null,
          university: "University of Santo Tomas",
          major: null,
          pathways: [],
        }}
      />
    );
    fireEvent.click(screen.getByText("Edit"));
    const input = getUniversityCombobox();
    expect(input.value).toBe("University of Santo Tomas");
  });
});
