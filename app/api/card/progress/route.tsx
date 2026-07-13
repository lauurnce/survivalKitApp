import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseProgressCardParams, ACADEMIC_YEAR_LABEL } from "@/lib/shareCard";

export const dynamic = "force-dynamic";

const WIDTH = 1080;
const HEIGHT = 1920;
const VERMILLION = "#E0492B";
const SHADOW = "0 2px 12px rgba(0,0,0,0.5)";

// Fonts load once per server instance, not per request.
const fontsPromise = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/fraunces-latin-600-normal.woff")),
  readFile(join(process.cwd(), "assets/fonts/inter-tight-latin-400-normal.woff")),
  readFile(join(process.cwd(), "assets/fonts/inter-tight-latin-500-normal.woff")),
]).then(([fraunces, interRegular, interMedium]) => [
  { name: "Fraunces", data: fraunces, weight: 600 as const, style: "normal" as const },
  { name: "InterTight", data: interRegular, weight: 400 as const, style: "normal" as const },
  { name: "InterTight", data: interMedium, weight: 500 as const, style: "normal" as const },
]);

export async function GET(req: NextRequest) {
  const parsed = parseProgressCardParams(req.nextUrl.searchParams);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { subject, count, module: moduleTitle, name } = parsed.value;

  const dateLabel = new Date().toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });

  try {
    const fonts = await fontsPromise;

    return new ImageResponse(
      (
        // Transparent root — the card is a sticker overlaid on the student's
        // own story photo, so no background anywhere except the pill.
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "160px 80px",
            fontFamily: "InterTight",
            color: "#FFFFFF",
          }}
        >
          {name && (
            <div
              style={{
                display: "flex",
                fontSize: 36,
                fontWeight: 500,
                letterSpacing: 8,
                textTransform: "uppercase",
                textShadow: SHADOW,
                marginBottom: 24,
              }}
            >
              {name}
            </div>
          )}

          <div
            style={{
              display: "flex",
              fontFamily: "Fraunces",
              fontWeight: 600,
              fontSize: 360,
              lineHeight: 0.95,
              color: VERMILLION,
              textShadow: "0 6px 32px rgba(0,0,0,0.45)",
            }}
          >
            {count}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: 24,
            }}
          >
            <div style={{ display: "flex", fontSize: 44, textShadow: SHADOW }}>
              {count === 1 ? "module done in" : "modules done in"}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 58,
                fontWeight: 500,
                textAlign: "center",
                textShadow: SHADOW,
                marginTop: 12,
              }}
            >
              {subject}
            </div>
          </div>

          {moduleTitle && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginTop: 56,
                padding: "20px 40px",
                borderRadius: 999,
                backgroundColor: "rgba(26,31,35,0.62)",
                fontSize: 36,
              }}
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12.5L9.5 18L20 6.5"
                  stroke={VERMILLION}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div style={{ display: "flex" }}>just finished: {moduleTitle}</div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 20,
              marginTop: 48,
              fontSize: 32,
              letterSpacing: 2,
              opacity: 0.85,
              textShadow: SHADOW,
            }}
          >
            <div style={{ display: "flex" }}>{dateLabel}</div>
            <div style={{ display: "flex" }}>·</div>
            <div style={{ display: "flex" }}>{ACADEMIC_YEAR_LABEL}</div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 140,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              textShadow: SHADOW,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 34,
                fontWeight: 500,
                letterSpacing: 6,
                textTransform: "uppercase",
              }}
            >
              BSIT Survival Kit
            </div>
            <div style={{ display: "flex", fontSize: 28, opacity: 0.85 }}>
              survival-kit-app.vercel.app
            </div>
          </div>
        </div>
      ),
      {
        width: WIDTH,
        height: HEIGHT,
        fonts,
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      }
    );
  } catch (err) {
    console.error("card render failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Card render failed" }, { status: 500 });
  }
}
