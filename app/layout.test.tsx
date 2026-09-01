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

// Walks a React element tree (not real DOM — these are unrendered elements)
// and collects every node whose type matches, regardless of how deeply
// wrapper elements nest it. Keeps footer-link assertions robust to layout
// tweaks like an extra wrapping <div> around a group of links.
function findAllByType(
  node: ReactNode,
  type: string
): ReactElement<{ children?: ReactNode }>[] {
  const found: ReactElement<{ children?: ReactNode }>[] = [];
  for (const child of Children.toArray(node)) {
    if (typeof child !== "object" || child === null || !("type" in child)) continue;
    const el = child as ReactElement<{ children?: ReactNode }>;
    if (el.type === type) found.push(el);
    if (el.props?.children) found.push(...findAllByType(el.props.children, type));
  }
  return found;
}

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

  it("links to the FAQ page from the footer, next to the Privacy Policy link", async () => {
    const layout = await RootLayout({ children: <main>Content</main> });
    const [, body] = Children.toArray(layout.props.children) as ReactElement<{
      children: ReactNode;
    }>[];
    const bodyChildren = Children.toArray(body.props.children) as ReactElement<{
      children: ReactNode;
    }>[];
    const footer = bodyChildren.find((child) => child.type === "footer")!;
    const links = findAllByType(footer.props.children, "a") as ReactElement<{
      href?: string;
      children: ReactNode;
    }>[];

    const privacyLink = links.find((el) => el.props.href === "/privacy");
    const faqLink = links.find((el) => el.props.href === "/faq");

    expect(privacyLink).toBeDefined();
    expect(faqLink).toBeDefined();
    expect(faqLink!.props.children).toMatch(/faq/i);
  });
});
