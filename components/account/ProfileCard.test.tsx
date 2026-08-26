import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileCard } from "./ProfileCard";
import type { Profile } from "@/lib/profile";

// saveProfileAction is a server action imported by EditProfileModal; stub it so
// the component can render (and submit) in jsdom without a server.
vi.mock("@/app/account/actions", () => ({
  saveProfileAction: vi.fn(async () => ({ savedAt: Date.now() })),
}));

const { saveProfileAction } = (await import("@/app/account/actions")) as {
  saveProfileAction: ReturnType<typeof vi.fn>;
};

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    firstName: "Juan",
    lastName: "Dela Cruz",
    age: 19,
    gender: "Male",
    university: "University of Santo Tomas",
    schoolType: "Private",
    major: "BS Information Technology",
    pathways: [],
    devices: [],
    languages: [],
    background: null,
    itReason: null,
    careerGoal: null,
    githubUrl: null,
    portfolioUrl: null,
    createdAt: null,
    ...overrides,
  };
}

function renderDashboard(profile: Profile | null, props = {}) {
  return render(
    <ProfileCard
      profile={profile}
      joinedLabel="BS Information Technology · University of Santo Tomas"
      startedLabel="June 2026"
      {...props}
    />
  );
}

// The hero Edit pill and six per-section Edit links share a name; any of them
// opens the same modal.
function openModal() {
  fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
}

describe("ProfileCard hero", () => {
  it("shows the student's name, school line, sector badge, and journey start", () => {
    renderDashboard(
      makeProfile({ createdAt: "2026-06-15T00:00:00.000Z" })
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Juan Dela Cruz" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/BS Information Technology · University of Santo Tomas/)
    ).toBeInTheDocument();
    expect(screen.getByText("Private")).toBeInTheDocument();
    expect(screen.getByText(/Journey started June 2026/)).toBeInTheDocument();
  });

  it("says the name is missing instead of rendering a blank heading", () => {
    renderDashboard(makeProfile({ firstName: null, lastName: null }));
    expect(screen.getByText(/name not set/i)).toBeInTheDocument();
  });

  it("renders the matched university's landmark image", () => {
    renderDashboard(makeProfile({ university: "Bohol Island State University" }));
    const img = screen.getByRole("img", { name: /bisu main admin building/i });
    expect(img).toHaveAttribute("src", expect.stringContaining("bisu"));
  });

  it("renders the default landmark when the university is unmatched or null", () => {
    renderDashboard(makeProfile({ university: null }));
    const img = screen.getByRole("img", { name: /campus building/i });
    expect(img).toHaveAttribute("src", expect.stringContaining("default"));
  });
});

describe("ProfileCard sections — populated", () => {
  const profile = makeProfile({
    pathways: ["Backend", "Cybersecurity"],
    languages: ["Python", "SQL"],
    devices: ["Laptop", "Smartphone"],
    background: "TVL / ICT strand",
    itReason: "I want to build tools my barangay can use.",
    careerGoal: "Backend developer at a fintech",
    githubUrl: "https://github.com/juandelacruz",
    portfolioUrl: "https://juande.dev",
  });

  beforeEach(() => renderDashboard(profile));

  it("lists pathway interests as chips", () => {
    expect(screen.getByText("Backend")).toBeInTheDocument();
    expect(screen.getByText("Cybersecurity")).toBeInTheDocument();
  });

  it("lists known languages as mono chips", () => {
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("SQL")).toBeInTheDocument();
  });

  it("lists each owned device", () => {
    expect(screen.getByText("Laptop")).toBeInTheDocument();
    expect(screen.getByText("Smartphone")).toBeInTheDocument();
  });

  it("shows the starting point chip and reason as a quote", () => {
    expect(screen.getByText("TVL / ICT strand")).toBeInTheDocument();
    expect(
      screen.getByText(/tools my barangay can use/)
    ).toBeInTheDocument();
  });

  it("shows the career goal", () => {
    expect(screen.getByText(/Backend developer at a fintech/)).toBeInTheDocument();
  });

  it("renders cleaned external links", () => {
    const gh = screen.getByText("github.com/juandelacruz");
    expect(gh).toHaveAttribute("href", "https://github.com/juandelacruz");
    expect(gh).toHaveAttribute("target", "_blank");
    expect(screen.getByText("juande.dev")).toBeInTheDocument();
  });
});

describe("ProfileCard sections — empty", () => {
  beforeEach(() =>
    renderDashboard(
      makeProfile({
        pathways: [],
        languages: [],
        devices: [],
        background: null,
        itReason: null,
        careerGoal: null,
        githubUrl: null,
        portfolioUrl: null,
      })
    )
  );

  it("renders every card with its gentle hint instead of collapsing", () => {
    expect(screen.getByText(/No pathways picked yet\./)).toBeInTheDocument();
    expect(
      screen.getByText(/Python, SQL, anything counts\./)
    ).toBeInTheDocument();
    expect(screen.getByText("Not set yet.")).toBeInTheDocument();
    expect(
      screen.getByText(/Zero knowledge welcome — everyone starts somewhere\./)
    ).toBeInTheDocument();
    expect(screen.getByText(/No goal set yet/)).toBeInTheDocument();
    expect(screen.getByText(/Add your GitHub or portfolio\./)).toBeInTheDocument();
  });

  it("still shows the journey-started label passed by the page", () => {
    expect(screen.getByText(/Journey started June 2026/)).toBeInTheDocument();
  });
});

describe("ProfileCard — no profile yet", () => {
  it("swaps the hero for a dashed setup panel with no image", () => {
    render(<ProfileCard profile={null} joinedLabel="" startedLabel={null} />);
    expect(
      screen.getByRole("heading", { level: 2, name: /set up your profile/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText(/dashboard fills in here/)).toBeInTheDocument();
  });
});

describe("EditProfileModal — grouped fields", () => {
  it("opens via Edit and keeps the school combobox wired up", () => {
    renderDashboard(makeProfile({ university: "University of Santo Tomas" }));
    openModal();

    // Gender <select> and the university field both carry combobox roles under
    // current HTML-AAM; the university is the only <input> among them.
    const combo = screen
      .getAllByRole("combobox")
      .find((el) => el.tagName === "INPUT") as HTMLInputElement;
    expect(combo.value).toBe("University of Santo Tomas");

    expect(screen.getByRole("button", { name: "Public" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Private" })).toBeInTheDocument();
  });

  it("submits the new field names alongside the existing ones", async () => {
    renderDashboard(makeProfile());
    openModal();

    fireEvent.click(screen.getByLabelText("Laptop"));
    fireEvent.click(screen.getByLabelText("Python"));
    fireEvent.change(screen.getByLabelText(/Where are you starting from\?/), {
      target: { value: "TVL / ICT strand" },
    });
    fireEvent.change(screen.getByLabelText(/Why IT\?/), {
      target: { value: "I like solving problems." },
    });
    fireEvent.change(screen.getByLabelText(/Where are you headed\?/), {
      target: { value: "Game developer" },
    });
    fireEvent.change(screen.getByLabelText("GitHub URL"), {
      target: { value: "https://github.com/juandelacruz" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Save profile/i }));

    await vi.waitFor(() => expect(saveProfileAction).toHaveBeenCalledTimes(1));
    const formData = saveProfileAction.mock.calls[0][1] as FormData;
    expect(formData.getAll("devices")).toEqual(["Laptop"]);
    expect(formData.getAll("languages")).toEqual(["Python"]);
    expect(formData.get("background")).toBe("TVL / ICT strand");
    expect(formData.get("itReason")).toBe("I like solving problems.");
    expect(formData.get("careerGoal")).toBe("Game developer");
    expect(formData.get("githubUrl")).toBe("https://github.com/juandelacruz");
    expect(formData.get("portfolioUrl")).toBe("");
  });
});
