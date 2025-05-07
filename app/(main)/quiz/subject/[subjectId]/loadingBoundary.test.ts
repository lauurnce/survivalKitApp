import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";

// A loading.tsx is a Suspense boundary. Any boundary above a page that calls
// notFound() lets Next stream a 200 shell first, so the "404" ships as HTTP 200
// with only a noindex tag (QA CR-01/GT-18/CT-17). These routes 404 on bad
// input, so nothing between them and the root layout may hold a loading.tsx.
const APP = path.resolve(__dirname, "../../../..");

const GUARDED = [
  "",
  "(main)",
  "(main)/quiz",
  "(main)/quiz/subject",
  "(main)/quiz/subject/[subjectId]",
  "(main)/unlock",
  "(main)/class",
  "(main)/class/[code]",
  "(main)/class/[code]/join",
  "(main)/class/[code]/rep",
];

describe("routes that 404 keep a real 404 status", () => {
  it.each(GUARDED)("app/%s has no loading.tsx", (segment) => {
    expect(existsSync(path.join(APP, segment, "loading.tsx"))).toBe(false);
  });
});
