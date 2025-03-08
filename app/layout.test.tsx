import { Children, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

// Any request-time API in the root layout would make every route dynamic.
vi.mock("next/headers", () => ({
  headers: () => {
    throw new Error("RootLayout must not read request headers");
  },
  cookies: () => {
    throw new Error("RootLayout must not read cookies");
  },
}));

const { frauncesCalls, isItalic } = vi.hoisted(() => ({
  frauncesCalls: [] as Record<string, unknown>[],
  isItalic: (o: Record<string, unknown>) => ([] as unknown[]).concat(o.style).includes("italic"),
}));

vi.mock("next/font/google", () => ({
  Fraunces: (opts: Record<string, unknown>) => {
    frauncesCalls.push(opts);
    return { variable: isItalic(opts) ? "font-fraunces-italic" : "font-fraunces" };
  },
  Inter_Tight: () => ({ variable: "font-inter-tight" }),
  JetBrains_Mono: () => ({ variable: "font-jetbrains-mono" }),
}));

import RootLayout, { metadata } from "./layout";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/csp";

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

// QA PF-06: the 45 KB Fraunces italic was preloaded on every public page,
// though only two signed-in screens set serif italic.
describe("RootLayout fonts", () => {
  it("preloads only the upright Fraunces; the italic face loads on use", () => {
    const upright = frauncesCalls.find((o) => !isItalic(o));
    const italic = frauncesCalls.find(isItalic);
    expect(upright?.style).toEqual(["normal"]);
    expect(upright?.preload).not.toBe(false);
    expect(italic).toMatchObject({ preload: false, variable: "--font-fraunces-italic" });
  });
});

describe("RootLayout", () => {
  it("renders the theme bootstrap without a nonce, hash-pinned in lib/csp", async () => {
    const layout = RootLayout({ children: <main>Content</main> });
    const [head] = Children.toArray(layout.props.children) as ReactElement<{
      children: ReactNode;
    }>[];
    const script = Children.only(head.props.children) as ReactElement<{
      nonce?: string;
      suppressHydrationWarning?: boolean;
      dangerouslySetInnerHTML?: { __html: string };
    }>;

    expect(script.type).toBe("script");
    expect(script.props.nonce).toBeUndefined();
    expect(script.props.dangerouslySetInnerHTML?.__html).toBe(THEME_BOOTSTRAP_SCRIPT);
    expect(script.props.suppressHydrationWarning).toBe(true);
  });

  it("links to the FAQ page from the footer, next to the Privacy Policy link", async () => {
    const layout = RootLayout({ children: <main>Content</main> });
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

// QA CR-10 / GT-17: no page emitted <link rel="canonical">.
describe("root metadata", () => {
  it("gives every route a self-referencing canonical by default", () => {
    // "./" is resolved by Next against each page's pathname, dropping the query.
    expect(metadata.alternates?.canonical).toBe("./");
    expect(metadata.metadataBase).toBeInstanceOf(URL);
  });
});

describe("RootLayout metadata", () => {
  it("resolves og:url per page, like the canonical, instead of pinning the home page", () => {
    expect(metadata.alternates?.canonical).toBe("./");
    expect(metadata.openGraph?.url).toBe("./");
  });
});
