#!/usr/bin/env node
// Renders the brand-styled SVG charts embedded in STORY.md from
// assets/story/story-data.json. Zero dependencies; any Node >= 18.
// Regenerate after editing the JSON:  node scripts/gen-story-svgs.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const INK = "#1A1A1A";
const PAPER = "#F3F1ED";
const VERMILION = "#E5502E";
const MUTED = "#A0A0A0";
const HAIRLINE = "#DDD9D1";
const MONO = "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace";
const SERIF = "Fraunces, Georgia, 'Times New Roman', serif";

export const fmt = (n) => n.toLocaleString("en-US");
export const barW = (value, max, maxPx) => Math.round((value / max) * maxPx);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// Horizontal bar: square at the baseline (left), 4px-rounded data-end (right).
export function bar(x, y, w, h, fill, r = 4) {
  if (w <= r) return `<rect x="${x}" y="${y}" width="${Math.max(w, 1)}" height="${h}" fill="${fill}"/>`;
  return `<path d="M${x} ${y}h${w - r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 -${r} ${r}h-${w - r}z" fill="${fill}"/>`;
}

const text = (x, y, s, { font = MONO, size = 10, fill = MUTED, anchor = "start", ls = 1 } = {}) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" letter-spacing="${ls}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`;

const shell = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">\n` +
  `<rect width="${w}" height="${h}" fill="${PAPER}"/>\n<rect width="${w}" height="4" fill="${INK}"/>\n${body}\n</svg>\n`;

export function statStripSVG(d) {
  const W = 720, H = 150;
  const stats = [
    ["UNIQUE DEVICES", fmt(d.devices_total)],
    ["EVENTS TRACKED", fmt(d.events_total)],
    ["ACCOUNTS", fmt(d.accounts)],
    ["SUBJECTS COVERED", fmt(d.subjects_covered)],
    ["UNIVERSITIES", fmt(d.universities.length)],
  ];
  const colW = (W - 48) / stats.length;
  let b = text(24, 34, "§ 04 — REACH, ALL ORGANIC");
  b += text(W - 24, 34, `AS OF ${d.as_of} · SOURCE: APP ANALYTICS`, { size: 9, anchor: "end" });
  stats.forEach(([label, value], i) => {
    const x = 24 + i * colW;
    if (i) b += `<line x1="${x - 16}" y1="60" x2="${x - 16}" y2="120" stroke="${HAIRLINE}" stroke-width="1"/>`;
    b += text(x, 98, value, { font: SERIF, size: 28, fill: INK, ls: 0 });
    b += text(x, 122, label, { size: 9 });
  });
  return shell(W, H, b);
}

function hBarChart({ title, rows, accentIndex, labelW, footnote }) {
  const W = 720, rowH = 44, top = 70, barH = 20;
  const H = top + rows.length * rowH + (footnote ? 30 : 12);
  const maxPx = W - labelW - 96;
  const max = Math.max(...rows.map((r) => r.value));
  let b = text(24, 36, title);
  b += `<line x1="24" y1="48" x2="${W - 24}" y2="48" stroke="${HAIRLINE}" stroke-width="1"/>`;
  rows.forEach((r, i) => {
    const y = top + i * rowH;
    const w = barW(r.value, max, maxPx);
    b += text(24, y + 14, String(i + 1).padStart(2, "0"));
    b += text(labelW - 12, y + 14, r.label.toUpperCase(), { size: 11, fill: INK, anchor: "end", ls: 0.5 });
    b += bar(labelW, y, w, barH, i === accentIndex ? VERMILION : INK);
    b += text(labelW + w + 10, y + 14, fmt(r.value), { size: 12, fill: INK, ls: 0 });
  });
  b += `<line x1="${labelW}" y1="${top - 8}" x2="${labelW}" y2="${top + (rows.length - 1) * rowH + barH + 8}" stroke="${HAIRLINE}" stroke-width="1"/>`;
  if (footnote) b += text(24, H - 12, footnote, { size: 9 });
  return shell(W, H, b);
}

export const yearChartSVG = (d) =>
  hBarChart({
    title: "§ 04.1 — UNIQUE DEVICES BY YEAR LEVEL, LIFETIME",
    rows: d.devices_by_year,
    accentIndex: 0,
    labelW: 140,
    footnote: "3RD & 4TH YEAR CONTENT WAS “COMING SOON” FOR MOST OF THIS WINDOW — THOSE BARS MEASURE CURIOSITY.",
  });

export const subjectsChartSVG = (d) =>
  hBarChart({
    title: "§ 04.2 — TOP SUBJECTS BY UNIQUE DEVICES",
    rows: d.top_subjects,
    accentIndex: 0,
    labelW: 248,
    footnote: `${d.top_subjects[0].label.toUpperCase()} ALONE = ${Math.round((d.top_subjects[0].value / d.devices_total) * 100)}% OF ALL SITE TRAFFIC.`,
  });

export function generate(dataPath, outDir) {
  const d = JSON.parse(readFileSync(dataPath, "utf8"));
  const files = {
    "reach-stats.svg": statStripSVG(d),
    "devices-by-year.svg": yearChartSVG(d),
    "top-subjects.svg": subjectsChartSVG(d),
  };
  for (const [name, svg] of Object.entries(files)) writeFileSync(path.join(outDir, name), svg);
  return Object.keys(files);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const out = generate(path.join(root, "assets/story/story-data.json"), path.join(root, "assets/story"));
  console.log(`wrote ${out.join(", ")} to assets/story/`);
}
