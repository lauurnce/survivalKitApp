// Assertion suite for the STORY.md chart generator.
// Run: node scripts/gen-story-svgs.check.mjs
// Plain node:assert on purpose — zero dependencies, and NOT named *.test.*
// so the Vitest suite never collects it.
import assert from "node:assert/strict";
import {
  fmt, barW, bar, statStripSVG, yearChartSVG, subjectsChartSVG,
} from "./gen-story-svgs.mjs";

const sample = {
  as_of: "2026-07-25",
  devices_total: 6668, events_total: 123075, accounts: 216, subjects_covered: 36,
  universities: [
    { name: "Polytechnic University of the Philippines", short: "PUP", type: "State university", region: "NCR — Manila" },
    { name: "Catanduanes State University", short: "CatSU", type: "State university", region: "Bicol — Virac" },
  ],
  devices_by_year: [
    { label: "1st Year", value: 4827 }, { label: "2nd Year", value: 1333 },
    { label: "3rd Year", value: 216 }, { label: "4th Year", value: 185 },
  ],
  top_subjects: [
    { label: "Computer Programming 1", value: 3483 }, { label: "Intro to Computing", value: 977 },
    { label: "Math in the Modern World", value: 682 }, { label: "Data Comm & Networking", value: 462 },
    { label: "Purposive Communication", value: 328 },
  ],
};

const count = (s, needle) => (s.match(new RegExp(needle, "gi")) ?? []).length;

// number formatting
assert.equal(fmt(4827), "4,827");
assert.equal(fmt(123075), "123,075");
assert.equal(fmt(36), "36");

// bar geometry
assert.equal(barW(4827, 4827, 490), 490);
assert.equal(barW(2414, 4828, 490), 245);
assert.equal(barW(0, 4827, 490), 0);

// bar mark: square at baseline (left), 4px rounded data-end (right)
const mark = bar(140, 70, 200, 20, "#1A1A1A");
assert.ok(mark.startsWith('<path d="M140 70h196a4 4 0 0 1 4 4'), mark);
assert.ok(mark.includes('fill="#1A1A1A"'));

const strip = statStripSVG(sample);
const year = yearChartSVG(sample);
const subjects = subjectsChartSVG(sample);

for (const [name, svg] of [["strip", strip], ["year", year], ["subjects", subjects]]) {
  assert.ok(svg.includes('fill="#F3F1ED"'), `${name}: paper background`);
  assert.ok(svg.includes('height="4" fill="#1A1A1A"'), `${name}: ink top band`);
  assert.ok(!/sale|revenue|conversion|funnel/i.test(svg), `${name}: disclosure`);
}

// vermilion accent discipline: exactly one accent bar per chart, none in the strip
assert.equal(count(strip, "E5502E"), 0, "strip has no accent");
assert.equal(count(year, "E5502E"), 1, "year chart: one accent");
assert.equal(count(subjects, "E5502E"), 1, "subjects chart: one accent");

// stat strip content
for (const v of ["6,668", "123,075", "216", "36", "UNIVERSITIES", "AS OF 2026-07-25"]) {
  assert.ok(strip.includes(v), `strip includes ${v}`);
}

// year chart content: uppercase labels, values at tips, footnote present
for (const v of ["1ST YEAR", "4TH YEAR", "4,827", "185", "CURIOSITY"]) {
  assert.ok(year.includes(v), `year includes ${v}`);
}

// subjects chart: XML-escaped ampersands, computed traffic share (3483/6668 → 52%)
assert.ok(subjects.includes("DATA COMM &amp; NETWORKING"), "ampersand escaped");
assert.ok(!/ & /.test(subjects.replace(/&amp;/g, "")), "no raw ampersands");
assert.ok(subjects.includes("52%"), "computed CP1 share");

console.log("all checks passed");
