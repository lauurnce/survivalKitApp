import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }));

const { AdminLoginForm } = await import("./AdminLoginForm");

function submit(password = "secret") {
  fireEvent.change(screen.getByLabelText("Admin password"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: "Enter" }));
}

beforeEach(() => push.mockReset());
afterEach(() => vi.unstubAllGlobals());

describe("AdminLoginForm (QA GT-21)", () => {
  it("returns to the page the admin was headed for", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })));
    render(<AdminLoginForm next="/admin/feedback" />);
    submit();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/feedback"));
  });

  it("shows the API's message for a wrong password", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: "Invalid password" }), { status: 401 })),
    );
    render(<AdminLoginForm next="/admin" />);
    submit();
    expect(await screen.findByText("Invalid password")).toBeInTheDocument();
  });

  it("does not call a non-JSON error a network error", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>Too Many Requests</html>", { status: 429 })));
    render(<AdminLoginForm next="/admin" />);
    submit();
    expect(await screen.findByText(/Too many attempts/)).toBeInTheDocument();
    expect(screen.queryByText(/Network error/)).toBeNull();
  });
});
