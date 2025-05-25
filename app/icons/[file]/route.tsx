import { ImageResponse } from "next/og";
import { PWA_ICON_SIZES, isPwaIconFile } from "@/lib/retention/pwa";

// Home-screen icons for Android's install prompt, which needs 192px and
// 512px PNGs in the manifest; the 180px apple-icon alone does not qualify.
// The ".png" names keep these paths outside proxy.ts's matcher, and both are
// rendered once at build time.

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(PWA_ICON_SIZES).map((file) => ({ file }));
}

// "maskable": Android crops icons to a circle or squircle, so the mark sits
// inside the central 60% safe zone on a full-bleed background.
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!isPwaIconFile(file)) return new Response("Not found", { status: 404 });
  const px = PWA_ICON_SIZES[file];
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
          fontSize: Math.round(px * 0.5),
          fontWeight: 600,
        }}
      >
        §
      </div>
    ),
    { width: px, height: px },
  );
}
