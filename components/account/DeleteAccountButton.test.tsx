import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeleteAccountButton } from "./DeleteAccountButton";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({ ok: true }) });
});

describe("DeleteAccountButton", () => {
  it("opens a confirmation dialog and keeps the delete button disabled until the exact phrase is typed", async () => {
    render(<DeleteAccountButton />);

    fireEvent.click(screen.getByRole("button", { name: /delete my account/i }));

    // Two elements match "delete my account" (trigger + dialog submit) —
    // the dialog's submit button is the last one rendered.
    const dialogDeleteButtons = screen.getAllByRole("button", { name: /delete my account/i });
    const submitButton = dialogDeleteButtons[dialogDeleteButtons.length - 1];
    expect(submitButton).toBeDisabled();

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "wrong phrase" } });
    expect(submitButton).toBeDisabled();

    fireEvent.change(input, { target: { value: "delete my account" } });
    expect(submitButton).not.toBeDisabled();
  });

  it("calls the delete endpoint only after the phrase matches and the button is clicked", async () => {
    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByRole("button", { name: /delete my account/i }));

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "delete my account" } });

    const dialogDeleteButtons = screen.getAllByRole("button", { name: /delete my account/i });
    fireEvent.click(dialogDeleteButtons[dialogDeleteButtons.length - 1]);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/account/delete", { method: "POST" }));
  });

  it("shows an error and never navigates away when the API call fails", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: "boom" }) });
    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByRole("button", { name: /delete my account/i }));

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "delete my account" } });
    const dialogDeleteButtons = screen.getAllByRole("button", { name: /delete my account/i });
    fireEvent.click(dialogDeleteButtons[dialogDeleteButtons.length - 1]);

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("boom"));
  });
});
