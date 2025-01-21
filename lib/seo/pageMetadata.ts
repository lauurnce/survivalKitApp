import type { Metadata } from "next";

// Per-page metadata that link previews and search engines actually read.
//
// Most readers arrive from a link pasted into a class group chat. Messenger
// and Facebook build that preview from og:title / og:url, and before this every
// page inherited the root layout's: og:title "BSIT Survival Kit" and og:url
// https://tryi2i.com. Facebook treats og:url as the page's canonical address,
// so a shared page was previewed (and counted) as the home page. The
// canonical <link> is set from the same path (the root layout's
// `alternates: "./"` covers pages that don't use this helper).
//
// Next.js replaces a parent's `openGraph` object wholesale when a child sets
// one, including the root opengraph-image, so this returns the complete set,
// image included.

export const SITE_NAME = "BSIT Survival Kit";

/** app/opengraph-image.tsx, the default share card. */
export const DEFAULT_SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "BSIT Survival Kit — module notes, guides, and reviewers for BSIT students",
};

export interface PageMetadataInput {
  /** Page title without the site suffix; the root template adds it. */
  title: string;
  description: string;
  /**
   * Root-relative path for og:url and the canonical <link>, e.g. "/year".
   * metadataBase makes it absolute. Pass the validated path built from the
   * page's rows, never raw params, so both always name the page's one URL.
   */
  path: string;
  /** Use `title` verbatim, skipping the "— BSIT Survival Kit" template. */
  absoluteTitle?: boolean;
}

/** The title as the root layout's template renders it. */
export function fullTitle(title: string, absolute = false): string {
  return absolute || title === SITE_NAME ? title : `${title} — ${SITE_NAME}`;
}

export function pageMetadata({ title, description, path, absoluteTitle = false }: PageMetadataInput): Metadata {
  const shareTitle = fullTitle(title, absoluteTitle);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    // The root layout's `canonical: "./"` echoes whatever URL was requested;
    // pin it to the same path as og:url so the two can never disagree.
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_PH",
      title: shareTitle,
      description,
      url: path,
      images: [DEFAULT_SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: [DEFAULT_SHARE_IMAGE],
    },
  };
}

/** Names the first few subjects: that is what a student searches for. */
export function subjectsDescription(
  yearLabel: string,
  subjects: { title: string; semester: number; sort_order: number }[],
): string {
  const names = [...subjects]
    .sort((a, b) => a.semester - b.semester || a.sort_order - b.sort_order)
    .map((s) => s.title);
  const shown = names.slice(0, 4).join(", ");
  const more = names.length > 4 ? ` and ${names.length - 4} more` : "";
  return names.length > 0
    ? `${yearLabel} BSIT subjects: ${shown}${more}. Free lesson notes and reviewers for every module.`
    : `Browse all ${yearLabel} BSIT subjects, modules, and reviewers.`;
}
