import type { ReactNode } from "react";

// Exact live-DB subject title → icon slug. Keys must match the `subjects.title`
// column verbatim (project mpdymglipgzuybtxuvhy). Matching at runtime is
// case-insensitive + trimmed via resolveSubjectSlug.
export const SUBJECT_SLUGS: Record<string, string> = {
  "Computer Programming 1": "comp-prog-1",
  "Introduction to Computing": "intro-computing",
  "Mathematics in the Modern World": "math-modern-world",
  "Accounting Principles": "accounting",
  "Purposive Communication": "purposive-comm",
  "Filipinolohiya": "filipinolohiya",
  "Understanding the Self": "understanding-self",
  "Computer Programming 2": "comp-prog-2",
  "Discrete Structures 1": "discrete-structures",
  "Reading in Philippine History": "ph-history",
  "Science, Technology and Society": "sts",
  "The Contemporary World": "contemporary-world",
  "Data Communications and Networking": "data-comm-network",
  "Data Structures and Algorithms": "dsa",
  "Structured Programming (COBOL)": "cobol",
  "Operating Systems": "operating-systems",
  "World Literature": "world-lit",
  "Object-Oriented Programming with Java": "oop-java",
  "Network Administration": "network-admin",
  "Information Management": "info-management",
  "Human Computer Interaction": "hci",
  "Integrative Programming and Technologies 1": "ipt-1",
  "Ethics": "ethics",
  "The Life and Works of Rizal": "rizal",
  "Multimedia": "multimedia",
  "Systems Integration and Architecture": "sys-integration",
  "Fundamentals of Research": "research",
  "Web Development": "web-dev",
  "Database Administration": "database-admin",
  "Applications Development and Emerging Technologies": "app-dev-emerging",
  "Technopreneurship": "technopreneurship",
  "Systems Analysis and Design": "sad",
  "Information Assurance and Security 1": "ias-1",
  "Systems Administration and Maintenance": "sys-admin",
  "Information Assurance and Security 2": "ias-2",
  "Social and Professional Issues in IT": "social-prof-issues",
};

// Lowercase+trimmed lookup table, built once.
const NORMALIZED_SLUGS: Record<string, string> = Object.fromEntries(
  Object.entries(SUBJECT_SLUGS).map(([title, slug]) => [title.trim().toLowerCase(), slug]),
);

export function resolveSubjectSlug(title: string): string | null {
  return NORMALIZED_SLUGS[title.trim().toLowerCase()] ?? null;
}

// Generic fallback for any subject whose title isn't mapped (open book).
export const BOOK_FALLBACK: ReactNode = (
  <>
    <path d="M12 6.5C10.5 5.3 8.4 4.8 6 4.8V17c2.4 0 4.5.5 6 1.7 1.5-1.2 3.6-1.7 6-1.7V4.8c-2.4 0-4.5.5-6 1.7Z" />
    <path d="M12 6.5v12.2" />
  </>
);

export const SUBJECT_ICONS: Record<string, ReactNode> = {
  // </>  — code brackets
  "comp-prog-1": (
    <>
      <path d="M8.5 8 5 12l3.5 4" />
      <path d="M15.5 8 19 12l-3.5 4" />
      <path d="M13.5 6.5 10.5 17.5" />
    </>
  ),
  // desktop monitor
  "intro-computing": (
    <>
      <rect x="3.5" y="5" width="17" height="11" rx="1.5" />
      <path d="M9.5 20h5M12 16v4" />
    </>
  ),
  // pi symbol + small shapes
  "math-modern-world": (
    <>
      <path d="M5 9h9" />
      <path d="M8 9v8" />
      <path d="M12.5 9v6.5c0 1 .6 1.5 1.5 1.5" />
      <circle cx="18" cy="7" r="1.2" />
      <path d="M16.4 11.5h2.6l-1.3 2.2Z" />
    </>
  ),
  // ledger + coins
  "accounting": (
    <>
      <rect x="4" y="5" width="9" height="11" rx="1" />
      <path d="M6.5 8.5h4M6.5 11h4M6.5 13.5h2.5" />
      <circle cx="16.5" cy="14" r="3.2" />
      <path d="M16.5 12.2v3.6" />
    </>
  ),
  // two overlapping speech bubbles
  "purposive-comm": (
    <>
      <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h6A1.5 1.5 0 0 1 13 7.5v3A1.5 1.5 0 0 1 11.5 12H8l-2.5 2v-2H5.5A1.5 1.5 0 0 1 4 10.5Z" />
      <path d="M11 13.5v.5A1.5 1.5 0 0 0 12.5 15.5H16l2.5 2v-2h.5A1.5 1.5 0 0 0 20.5 14v-3A1.5 1.5 0 0 0 19 9.5h-3" />
    </>
  ),
  // three-stars-and-a-sun / sun with rays
  "filipinolohiya": (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 5v2M12 17v2M5 12h2M17 12h2M7 7l1.4 1.4M16.6 16.6 18 18M17 7l-1.4 1.4M8.4 15.6 7 17" />
    </>
  ),
  // head profile + heart
  "understanding-self": (
    <>
      <path d="M17 18c0-2.5-1-5.2-2.4-6.8C13.4 9.8 12 9 10.2 9 7.3 9 5.5 11 5.5 13.6c0 1.4.7 2.6 1.8 3.3V19" />
      <path d="M11 12.2c.5-.7 1.6-.6 1.9.2.3-.8 1.4-.9 1.9-.2.4.6.1 1.4-.9 2.1l-1 .7-1-.7c-1-.7-1.3-1.5-.9-2.1Z" />
    </>
  ),
  // { } braces
  "comp-prog-2": (
    <>
      <path d="M10 6c-1.5 0-2 .8-2 2v2c0 1-.6 1.6-1.5 2 .9.4 1.5 1 1.5 2v2c0 1.2.5 2 2 2" />
      <path d="M14 6c1.5 0 2 .8 2 2v2c0 1 .6 1.6 1.5 2-.9.4-1.5 1-1.5 2v2c0 1.2-.5 2-2 2" />
    </>
  ),
  // connected graph nodes (triangle)
  "discrete-structures": (
    <>
      <circle cx="7" cy="9" r="1.8" />
      <circle cx="17" cy="9" r="1.8" />
      <circle cx="12" cy="17" r="1.8" />
      <path d="M8.5 9.6 15.5 9.6M8 10.5 11 15.3M16 10.5 13 15.3" />
    </>
  ),
  // rolled scroll
  "ph-history": (
    <>
      <path d="M7 6h8a2 2 0 0 1 2 2v8a2 2 0 0 0 2 2H9a2 2 0 0 1-2-2Z" />
      <path d="M7 6a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2" />
      <path d="M10 10h4M10 13h4" />
    </>
  ),
  // atom + gear
  "sts": (
    <>
      <circle cx="10" cy="10" r="2" />
      <ellipse cx="10" cy="10" rx="6" ry="2.6" transform="rotate(45 10 10)" />
      <ellipse cx="10" cy="10" rx="6" ry="2.6" transform="rotate(-45 10 10)" />
      <circle cx="17.5" cy="16.5" r="2.4" />
      <path d="M17.5 13.4v-.9M17.5 20.5v-.9M14.4 16.5h-.9M21.5 16.5h-.9" />
    </>
  ),
  // globe + connecting lines
  "contemporary-world": (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M5 12h14M12 5c2 2.3 2 11.7 0 14M12 5c-2 2.3-2 11.7 0 14" />
    </>
  ),
  // linked network nodes
  "data-comm-network": (
    <>
      <circle cx="6" cy="12" r="1.8" />
      <circle cx="18" cy="7" r="1.8" />
      <circle cx="18" cy="17" r="1.8" />
      <path d="M7.6 11.1 16.4 7.8M7.6 12.9 16.4 16.2" />
    </>
  ),
  // branching node tree
  "dsa": (
    <>
      <circle cx="12" cy="6" r="1.6" />
      <circle cx="7" cy="13" r="1.6" />
      <circle cx="17" cy="13" r="1.6" />
      <circle cx="17" cy="18.5" r="1.6" />
      <path d="M11 7.2 8 11.6M13 7.2 16 11.6M17 14.6v2.3" />
    </>
  ),
  // retro punch card
  "cobol": (
    <>
      <path d="M5 6h11l3 3v9H5Z" />
      <path d="M16 6v3h3" />
      <path d="M7.5 12h2M11 12h2M7.5 14.5h6" />
    </>
  ),
  // stacked layers + central cog
  "operating-systems": (
    <>
      <path d="M4 8l8-3 8 3-8 3Z" />
      <path d="M4 12l8 3 8-3" />
      <circle cx="12" cy="15.5" r="2" />
      <path d="M12 12.8v-.6M12 18.8v-.6M9.2 15.5h.6M14.2 15.5h.6" />
    </>
  ),
  // open book + globe
  "world-lit": (
    <>
      <path d="M12 8.5C10.7 7.6 9 7.2 7 7.2V17c2 0 3.7.4 5 1.3 1.3-.9 3-1.3 5-1.3V7.2c-2 0-3.7.4-5 1.3Z" />
      <path d="M12 8.5v9.8" />
      <circle cx="16.5" cy="6" r="2" />
    </>
  ),
  // coffee cup (Java) + blocks
  "oop-java": (
    <>
      <path d="M6 9h9v4a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4Z" />
      <path d="M15 10h1.5a1.5 1.5 0 0 1 0 3H15" />
      <path d="M9 4.5c-.6.7-.6 1.3 0 2M12 4.5c-.6.7-.6 1.3 0 2" />
    </>
  ),
  // server rack + gear
  "network-admin": (
    <>
      <rect x="4" y="5" width="12" height="4" rx="1" />
      <rect x="4" y="11" width="12" height="4" rx="1" />
      <path d="M6.5 7h.01M6.5 13h.01" />
      <circle cx="17.5" cy="16.5" r="2.2" />
      <path d="M17.5 13.6v-.8M17.5 20.2v-.8M14.6 16.5h-.8M21.2 16.5h-.8" />
    </>
  ),
  // database cylinder / stacked records
  "info-management": (
    <>
      <ellipse cx="12" cy="6.5" rx="6" ry="2.2" />
      <path d="M6 6.5v11c0 1.2 2.7 2.2 6 2.2s6-1 6-2.2v-11" />
      <path d="M6 12c0 1.2 2.7 2.2 6 2.2s6-1 6-2.2" />
    </>
  ),
  // hand/cursor touching a screen
  "hci": (
    <>
      <rect x="4" y="5" width="14" height="9" rx="1.5" />
      <path d="M11 11.5a2 2 0 1 1 3 0" />
      <path d="M12.5 12v4.2l-1.2-.9-1 2-1.5-.7 1-2-1.4-.2Z" />
    </>
  ),
  // two puzzle pieces / plug (API)
  "ipt-1": (
    <>
      <path d="M5 8h3.5a1.3 1.3 0 0 0 2.5 0H14v3.5a1.3 1.3 0 0 1 0 2.5V17H5Z" />
      <path d="M14 9.5h3a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-3" />
    </>
  ),
  // balanced scale
  "ethics": (
    <>
      <path d="M12 5v13M7 18h10" />
      <path d="M5 8h14M5 8 3 13h4ZM19 8l-2 5h4Z" />
      <path d="M3 13a2 2 0 0 0 4 0M17 13a2 2 0 0 0 4 0" />
    </>
  ),
  // open book + quill
  "rizal": (
    <>
      <path d="M11 9C9.8 8.2 8 7.8 6 7.8V17c2 0 3.8.4 5 1.2V9Z" />
      <path d="M11 9v9.2" />
      <path d="M18.5 6.5c-3 1-5 3.5-5.5 6.5l1.2-.3 3.8-5.5Z" />
      <path d="M13.8 12.4 12.8 15" />
    </>
  ),
  // play + image + sound-wave layers
  "multimedia": (
    <>
      <rect x="4" y="6" width="10" height="8" rx="1.5" />
      <path d="M7.5 8.8v3.4l3-1.7Z" />
      <path d="M17 9v6M19.5 7.5v9M14.5 11v2" />
    </>
  ),
  // connected modular blocks
  "sys-integration": (
    <>
      <rect x="4" y="6" width="5" height="5" rx="1" />
      <rect x="15" y="6" width="5" height="5" rx="1" />
      <rect x="9.5" y="14" width="5" height="5" rx="1" />
      <path d="M9 8.5h6M6.5 11v1.5a2 2 0 0 0 2 2h1M17.5 11v1.5a2 2 0 0 1-2 2h-1" />
    </>
  ),
  // magnifying glass over document
  "research": (
    <>
      <path d="M6 5h7l3 3v4" />
      <path d="M13 5v3h3" />
      <circle cx="13" cy="15" r="3" />
      <path d="M15.2 17.2 18 20" />
    </>
  ),
  // browser window with </>
  "web-dev": (
    <>
      <rect x="4" y="5" width="16" height="13" rx="1.5" />
      <path d="M4 9h16" />
      <path d="M6.5 6.8h.01M8.5 6.8h.01" />
      <path d="M10.5 12 9 13.8l1.5 1.8M13.5 12 15 13.8l-1.5 1.8" />
    </>
  ),
  // database cylinder + key
  "database-admin": (
    <>
      <ellipse cx="10" cy="7" rx="5" ry="2" />
      <path d="M5 7v9c0 1.1 2.2 2 5 2 .5 0 1 0 1.5-.1" />
      <path d="M5 11.5c0 1.1 2.2 2 5 2" />
      <circle cx="16.5" cy="15.5" r="2" />
      <path d="M18 16.8 20 19M19 18l-1 1" />
    </>
  ),
  // phone app tile + spark
  "app-dev-emerging": (
    <>
      <rect x="6" y="4" width="10" height="16" rx="2" />
      <path d="M9 17h4" />
      <path d="M18 5.5v3M16.5 7h3M17.5 10.5v1.5M16.8 11.2h1.4" />
    </>
  ),
  // lightbulb + rising graph
  "technopreneurship": (
    <>
      <path d="M9 15a5 5 0 1 1 6 0c-.6.5-.9 1-.9 1.7H9.9c0-.7-.3-1.2-.9-1.7Z" />
      <path d="M10 19h4M10.5 20.5h3" />
      <path d="M10 12.5 12 10.5l1.5 1.5 1.8-2.2" />
      <path d="M15.3 9.8h-1.3M15.3 9.8v1.3" />
    </>
  ),
  // flowchart boxes
  "sad": (
    <>
      <rect x="8.5" y="4" width="7" height="4" rx="1" />
      <rect x="4" y="15" width="6" height="4" rx="1" />
      <rect x="14" y="15" width="6" height="4" rx="1" />
      <path d="M12 8v4M12 12H7v3M12 12h5v3" />
    </>
  ),
  // shield
  "ias-1": (
    <>
      <path d="M12 4l6 2.2v5.3c0 3.6-2.5 6.4-6 7.7-3.5-1.3-6-4.1-6-7.7V6.2Z" />
    </>
  ),
  // server + wrench
  "sys-admin": (
    <>
      <rect x="4" y="5" width="12" height="4" rx="1" />
      <rect x="4" y="11" width="12" height="4" rx="1" />
      <path d="M6.5 7h.01M6.5 13h.01" />
      <path d="M18.5 12.5a2 2 0 0 0-2.6 2.6l-2.4 2.4 1.4 1.4 2.4-2.4a2 2 0 0 0 2.6-2.6l-1 1-1-1Z" />
    </>
  ),
  // layered shield + check
  "ias-2": (
    <>
      <path d="M12 4l6 2.2v5.3c0 3.6-2.5 6.4-6 7.7-3.5-1.3-6-4.1-6-7.7V6.2Z" />
      <path d="M9.2 12l1.9 1.9 3.7-3.7" />
    </>
  ),
  // connected people + document
  "social-prof-issues": (
    <>
      <circle cx="8" cy="8" r="2" />
      <circle cx="16" cy="8" r="2" />
      <path d="M4.5 17c0-2.2 1.6-3.8 3.5-3.8s3.5 1.6 3.5 3.8" />
      <path d="M12.5 17c0-2.2 1.6-3.8 3.5-3.8s3.5 1.6 3.5 3.8" />
    </>
  ),
};

export function iconForTitle(title: string): ReactNode {
  const slug = resolveSubjectSlug(title);
  return (slug && SUBJECT_ICONS[slug]) || BOOK_FALLBACK;
}
