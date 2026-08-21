import { Children, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-csp-nonce": "test-nonce" }),
}));

vi.mock("next/font/google", () => ({
  Fraunces: () => ({ variable: "font-fraunces" }),
  Inter_Tight: () => ({ variable: "font-inter-tight" }),
  JetBrains_Mono: () => ({ variable: "font-jetbrains-mono" }),
}));

import RootLayout from "./layout";

describe("RootLayout", () => {
  it("suppresses the expected browser nonce hydration difference", async () => {
    const layout = await RootLayout({ children: <main>Content</main> });
    const [head] = Children.toArray(layout.props.children) as ReactElement<{
      children: ReactNode;
    }>[];
    const script = Children.only(head.props.children) as ReactElement<{
      nonce?: string;
      suppressHydrationWarning?: boolean;
    }>;

    expect(script.type).toBe("script");
    expect(script.props.nonce).toBe("test-nonce");
    expect(script.props.suppressHydrationWarning).toBe(true);
  });
});
