// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";

vi.mock("@/lib/analytics", () => ({ logEvent: vi.fn(), logSectionView: vi.fn() }));
vi.mock("@/hooks/useSubscriptionStatus", () => ({
  useSubscriptionStatus: () => ({ subscribed: true, polling: false, unlocked: true, pollTimedOut: false }),
}));

import { SectionRenderer } from "./SectionRenderer";

// remark-math only opens display math on a `$$` line of its own: anything after
// an opening `$$` is fence meta and is silently dropped. Written as
// `$$\begin{array}{llcc}`, the environment vanished, KaTeX met bare `&`
// separators, and a free-sample answer key rendered as red source (QA CT-01).
// The body renderer is lazy-loaded (next/dynamic), so wait for KaTeX output.
async function renderBody(body_md: string) {
  const result = render(
    <SectionRenderer
      section={{ id: "s1", kind: "content", heading: "Body", body_md, sort_order: 1 }}
      index={1}
      moduleId="m"
      yearId="y"
      subjectId="s"
      unlockAll={false}
    />
  );
  await waitFor(() => expect(result.container.querySelector(".katex")).not.toBeNull());
  return result;
}

describe("SectionRenderer — display math", () => {
  it("renders an array whose $$ fences sit on their own lines", async () => {
    const { container } = await renderBody(
      "$$\n\\begin{array}{llcc}\n\\text{Dec 31} & \\text{Cash} & 1 & \\\\\n\\end{array}\n$$"
    );
    expect(container.querySelectorAll(".katex-error")).toHaveLength(0);
    expect(container.querySelectorAll(".katex-display")).toHaveLength(1);
  });

  it("renders the Accounting Principles module source without a KaTeX error", async () => {
    const file = path.join(
      process.cwd(),
      "content/modules/1st year/1st sem/Financial Accounting Principles.md"
    );
    const { container } = await renderBody(fs.readFileSync(file, "utf8"));
    const errors = [...container.querySelectorAll(".katex-error")].map((e) =>
      (e.getAttribute("title") ?? "").slice(0, 120)
    );
    expect(errors).toEqual([]);
  });
});
