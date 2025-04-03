import Link from "next/link";
import { canonicalOrigin } from "@/lib/appOrigin";

const SITE_URL = canonicalOrigin();

export interface BreadcrumbItem {
  label: string;
  /** Omit on the current page — it renders as plain text, not a link. */
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
  className?: string;
}

// Year → Subject → Module trail rendered at the top of the three hierarchy
// pages (see docs on the pages themselves). Reused as-is at every depth —
// callers just hand in however many levels apply to that page.
export function Breadcrumbs({ items, className }: Props) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className={className}>
      {/* Below lg the fixed TopBar (theme toggle + Log in) sits over the top
          right of the header band; the right padding keeps the trail from
          running underneath it. */}
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 pr-36 font-mono text-label-sm uppercase tracking-[0.1em] lg:pr-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  prefetch={true}
                  className="text-on-inverse/70 hover:text-on-inverse transition-colors duration-150"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className="text-on-inverse">
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true" className="text-on-inverse/40">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {/* BreadcrumbList structured data for Google rich snippets, reusing the
          same names/hrefs as the visible trail above. Not subject to the
          nonce-based script-src CSP in proxy.ts — that policy governs
          executable <script> elements, and a type="application/ld+json"
          block is never executed as script, so browsers don't gate it. */}
      <script
        type="application/ld+json"
        // Labels are subject/module titles from the database, not raw user
        // input, but the "<" escape still matters: JSON.stringify never
        // escapes it, so a title containing "</script>" could otherwise
        // close this tag early and inject arbitrary markup.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </nav>
  );
}
