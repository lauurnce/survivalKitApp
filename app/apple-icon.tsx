import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home-screen icon for iOS "Add to Home Screen" — same mark as the favicon at
// touch-icon size, with the cream wordmark initial under the section sign.
export default function AppleIcon() {
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
        <div style={{ color: "#E0492B", fontSize: 96, fontWeight: 600, lineHeight: 1 }}>§</div>
        <div
          style={{
            color: "#F7F5F3",
            fontSize: 28,
            letterSpacing: 6,
            marginTop: 8,
          }}
        >
          BSIT
        </div>
      </div>
    ),
    size
  );
}
