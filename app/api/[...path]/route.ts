import { NextResponse } from "next/server";

// Every /api/* path that matches no real route handler lands here (a
// catch-all has the lowest priority, so it never shadows one). Without it,
// Next answered with the full HTML app 404, which Vercel's CDN served with
// access-control-allow-origin: * (QA GT-23). API clients get JSON instead,
// with no CORS header.
function notFound() {
  return NextResponse.json({ error: "not_found" }, { status: 404 });
}

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
