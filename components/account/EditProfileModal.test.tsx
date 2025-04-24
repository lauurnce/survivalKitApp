import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditProfileModal } from "./EditProfileModal";
import type { Profile } from "@/lib/profile";

vi.mock("@/app/account/actions", () => ({
  saveProfileAction: vi.fn(),
}));

const { saveProfileAction } = (await import("@/app/account/actions")) as {
  saveProfileAction: ReturnType<typeof vi.fn>;
};

const profile: Profile = {
  firstName: "Juan",
  lastName: "Dela Cruz",
  age: 19,
  gender: "Male",
  university: null,
  schoolType: null,
  major: null,
  pathways: [],
  devices: [],
  languages: [],
  background: null,
  itReason: null,
  careerGoal: null,
  githubUrl: null,
  portfolioUrl: null,
  createdAt: null,
};

beforeEach(() => {
  saveProfileAction.mockReset();
});

describe("EditProfileModal — server validation error (GT-11)", () => {
  it("keeps every edit on screen when the server rejects the form", async () => {
    saveProfileAction.mockResolvedValue({ error: "Something the server didn't like." });
    render(<EditProfileModal profile={profile} onClose={() => {}} />);

    fireEvent.change(screen.getByLabelText(/First name/), { target: { value: "Maria" } });
    fireEvent.change(screen.getByLabelText(/Where are you headed\?/), { target: { value: "Data analyst" } });
    fireEvent.click(screen.getByLabelText("Laptop"));
    fireEvent.click(screen.getByRole("button", { name: /Save profile/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Something the server didn't like.");
    expect(screen.getByLabelText(/First name/)).toHaveValue("Maria");
    expect(screen.getByLabelText(/Where are you headed\?/)).toHaveValue("Data analyst");
    expect(screen.getByLabelText("Laptop")).toBeChecked();
  });

  it("asks the browser to require https:// on the link fields, matching the server rule", () => {
    render(<EditProfileModal profile={profile} onClose={() => {}} />);
    expect(screen.getByLabelText("GitHub URL")).toHaveAttribute("pattern", "https://.*");
    expect(screen.getByLabelText("Portfolio URL")).toHaveAttribute("pattern", "https://.*");
  });
});
