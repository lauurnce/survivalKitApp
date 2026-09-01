import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "BSIT Survival Kit — module notes, guides, and reviewers for BSIT students";

// Default social share preview for every link into the app (Messenger,
// WhatsApp, Facebook, Twitter/X all read this via the opengraph-image file
// convention; twitter-image falls back to it automatically). Kept to a big
// mark plus a short wordmark so it stays legible at the small thumbnail
// sizes chat apps render link previews at — same palette as icon.tsx /
// apple-icon.tsx so the preview, tab favicon, and home-screen icon read as
// one brand.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1A1A1A",
        }}
      >
        <div style={{ color: "#E0492B", fontSize: 220, fontWeight: 600, lineHeight: 1 }}>
          §
        </div>
        <div
          style={{
            display: "flex",
            color: "#F7F5F3",
            fontSize: 72,
            fontWeight: 600,
            letterSpacing: 4,
            marginTop: 12,
          }}
        >
          BSIT SURVIVAL KIT
        </div>
        <div
          style={{
            display: "flex",
            color: "#F7F5F3",
            opacity: 0.7,
            fontSize: 32,
            marginTop: 20,
          }}
        >
          Module notes · guides · reviewers
        </div>
      </div>
    ),
    size
  );
}
