import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

let session = { ready: true, signedIn: false, userId: null, overallDone: 0, overallTotal: 0 };
vi.mock("@/hooks/useSession", () => ({ useSession: () => session }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/resources",
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/app/(auth)/actions", () => ({ signOutAction: vi.fn() }));

import { SessionNavRail } from "./SessionShell";

describe("SessionNavRail (CT-16)", () => {
  it("prompts a signed-out visitor to log in instead of showing 0 / 0", () => {
    render(<SessionNavRail />);
    expect(screen.queryByText("0 / 0")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login?next=%2Fresources");
  });

  it("doesn't flash the prompt before the session has resolved", () => {
    session = { ...session, ready: false };
    render(<SessionNavRail />);
    expect(screen.queryByRole("link", { name: "Log in" })).not.toBeInTheDocument();
  });
});
