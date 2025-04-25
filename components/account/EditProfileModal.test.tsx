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

describe("EditProfileModal — dialog behaviour (GT-19)", () => {
  it("is a labelled modal dialog with focus on the first field", () => {
    render(<EditProfileModal profile={profile} onClose={() => {}} />);
    const dialog = screen.getByRole("dialog", { name: "Edit profile" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByLabelText(/First name/)).toHaveFocus();
  });

  it("closes on Escape when nothing was edited", () => {
    const onClose = vi.fn();
    render(<EditProfileModal profile={profile} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("asks before a backdrop click throws away edits", () => {
    const onClose = vi.fn();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<EditProfileModal profile={profile} onClose={onClose} />);
    fireEvent.change(screen.getByLabelText(/First name/), { target: { value: "Maria" } });

    const backdrop = screen.getByRole("dialog").parentElement!;
    fireEvent.click(backdrop);
    expect(confirm).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/First name/)).toHaveValue("Maria");

    confirm.mockReturnValue(true);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    confirm.mockRestore();
  });

  it("wraps Tab from the last control back to the first", () => {
    render(<EditProfileModal profile={profile} onClose={() => {}} />);
    const save = screen.getByRole("button", { name: /Save profile/i });
    save.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });
});
