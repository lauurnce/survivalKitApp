// @vitest-environment jsdom
import { useState } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const logged: Array<[string, Record<string, unknown>]> = [];
vi.mock("@/lib/analytics", () => ({
  logEvent: (type: string, meta: Record<string, unknown> = {}) => {
    logged.push([type, meta]);
    return Promise.resolve();
  },
}));

vi.mock("@/lib/progress", () => ({
  fetchCompletedModules: () => Promise.resolve(new Set(["m1", "m2", "m3"])),
}));

import { ShareProgressCard } from "./ShareProgressCard";

const SUBJECT_ID = "11111111-2222-3333-4444-555555555555";

function DialogHarness() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open share dialog
      </button>
      {open && (
        <ShareProgressCard
          subjectId={SUBJECT_ID}
          subjectTitle="CP1"
          moduleIds={["m1"]}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

beforeEach(() => {
  logged.length = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn((url: RequestInfo | URL) => {
      if (String(url).startsWith("/api/me")) {
        return Promise.resolve(
          new Response(JSON.stringify({ firstName: "Andrea" }), { status: 200 })
        );
      }
      return Promise.resolve(new Response(new Blob(), { status: 200 }));
    })
  );
});

describe("ShareProgressCard", () => {
  it("renders the preview with count, subject, module, and name in the card URL", async () => {
    render(
      <ShareProgressCard
        subjectId={SUBJECT_ID}
        subjectTitle="Computer Programming 1"
        moduleIds={["m1", "m2", "m3", "m4"]}
        moduleId="m3"
        moduleTitle="Loops & Iteration"
        onClose={() => {}}
      />
    );

    const img = await screen.findByRole("img", { name: /progress card/i });
    const src = img.getAttribute("src") ?? "";
    const params = new URLSearchParams(src.split("?")[1]);
    expect(params.get("subject")).toBe("Computer Programming 1");
    expect(params.get("count")).toBe("3");
    expect(params.get("module")).toBe("Loops & Iteration");
    expect(params.get("name")).toBe("Andrea");
  });

  it("logs share_card_open once with subject and module ids", async () => {
    render(
      <ShareProgressCard
        subjectId={SUBJECT_ID}
        subjectTitle="CP1"
        moduleIds={["m1"]}
        onClose={() => {}}
      />
    );
    await screen.findByRole("img", { name: /progress card/i });
    const opens = logged.filter(([t]) => t === "share_card_open");
    expect(opens).toHaveLength(1);
    expect(opens[0][1]).toMatchObject({ subject_id: SUBJECT_ID });
  });

  it("always offers a Download link with the slugged filename", async () => {
    render(
      <ShareProgressCard
        subjectId={SUBJECT_ID}
        subjectTitle="Computer Programming 1"
        moduleIds={["m1"]}
        onClose={() => {}}
      />
    );
    const link = (await screen.findByRole("link", { name: /download/i })) as HTMLAnchorElement;
    expect(link.getAttribute("download")).toBe("bsit-progress-computer-programming-1.png");
    await waitFor(() => expect(link.getAttribute("href")).toContain("/api/card/progress?"));
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    render(
      <ShareProgressCard
        subjectId={SUBJECT_ID}
        subjectTitle="CP1"
        moduleIds={["m1"]}
        onClose={onClose}
      />
    );
    (await screen.findByRole("button", { name: /close/i })).click();
    expect(onClose).toHaveBeenCalled();
  });

  it("contains keyboard focus, closes on Escape, and restores the trigger", async () => {
    const { container } = render(<DialogHarness />);
    const trigger = screen.getByRole("button", { name: /open share dialog/i });
    trigger.focus();
    fireEvent.click(trigger);

    const close = await screen.findByRole("button", { name: /close/i });
    const download = await screen.findByRole("link", { name: /download/i });

    await waitFor(() => expect(close).toHaveFocus());
    await waitFor(() => expect(download).not.toHaveAttribute("aria-disabled", "true"));
    expect(container).toHaveAttribute("inert");

    download.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(close).toHaveFocus();

    close.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(download).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(container).not.toHaveAttribute("inert");
  });
});
