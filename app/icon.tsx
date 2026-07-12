import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Browser-tab favicon: the "§" section mark on the brand dark ground, echoing
// the editorial section labels used across the app.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1A1A1A",
          color: "#E0492B",
          fontSize: 24,
          fontWeight: 600,
        }}
      >
        §
      </div>
    ),
    size
  );
}
