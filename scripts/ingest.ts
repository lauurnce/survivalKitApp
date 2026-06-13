#!/usr/bin/env tsx
/**
 * BSIT Survival Kit — PDF Ingest Script
 *
 * Usage:
 *   npx tsx scripts/ingest.ts --year 1 --subject "intro-to-computing" --file content-source/1st-year/intro-to-computing/module1.pdf
 *   npx tsx scripts/ingest.ts --dry-run   # outputs markdown only, no DB writes
 *
 * Env required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
// @ts-ignore — pdf-parse has no bundled types
import pdfParse from "pdf-parse";

// ── Config ──────────────────────────────────────────────────────────────────

const ACTIVITY_PATTERNS = [
  /^activity\s*\d*/i,
  /^exercise\s*\d*/i,
  /^lab\s*(activity|exercise)?\s*\d*/i,
  /^problem\s*(set|solving)?\s*\d*/i,
  /^computation\s*\d*/i,
  /^program(ming)?\s*(exercise|activity)?\s*\d*/i,
  /^coding\s*(exercise|challenge)?\s*\d*/i,
  /^assignment\s*\d*/i,
];

const HEADING_PATTERNS = [
  // Numbered headings: "1.", "1.1", "I.", "A."
  /^(\d+\.[\d.]*|[IVX]+\.|[A-Z]\.)\s+.{3,}/,
  // ALL CAPS lines (short)
  /^[A-Z][A-Z\s\-:]{4,60}$/,
  // "Module N" / "Chapter N" / "Unit N"
  /^(module|chapter|unit|topic|lesson|part)\s+\d+/i,
  // "Activity N" / "Exercise N"
  /^(activity|exercise|lab|assignment|computation)\s*\d*/i,
];

// ── Args ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const yearArg = args[args.indexOf("--year") + 1];
const subjectSlugArg = args[args.indexOf("--subject") + 1];
const fileArg = args[args.indexOf("--file") + 1];

// ── Supabase ─────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function isHeading(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3 || trimmed.length > 120) return false;
  return HEADING_PATTERNS.some((p) => p.test(trimmed));
}

function isActivityHeading(line: string): boolean {
  const trimmed = line.trim();
  return ACTIVITY_PATTERNS.some((p) => p.test(trimmed));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

interface ParsedSection {
  heading: string;
  body: string;
  kind: "content" | "activity";
}

function splitIntoSections(rawText: string): ParsedSection[] {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
  const sections: ParsedSection[] = [];
  let currentHeading = "Introduction";
  let currentLines: string[] = [];
  let currentKind: "content" | "activity" = "content";

  function flush() {
    const body = currentLines.join("\n\n").trim();
    if (body || sections.length === 0) {
      sections.push({ heading: currentHeading, body, kind: currentKind });
    }
  }

  for (const line of lines) {
    if (isHeading(line)) {
      flush();
      currentHeading = line;
      currentKind = isActivityHeading(line) ? "activity" : "content";
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  flush();

  return sections;
}

function outputMarkdown(sections: ParsedSection[], filePath: string): string {
  const header = `# Parsed: ${path.basename(filePath)}\n\n---\n\n`;
  const body = sections
    .map(
      (s, i) =>
        `## [${s.kind.toUpperCase()}] §${String(i + 1).padStart(2, "0")} — ${s.heading}\n\n${s.body}\n`
    )
    .join("\n---\n\n");
  return header + body;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function ingestFile(filePath: string, subjectSlug: string, yearLabel: string) {
  console.log(`\n📄 Reading: ${filePath}`);

  const buffer = fs.readFileSync(filePath);
  const pdf = await pdfParse(buffer);
  const rawText: string = pdf.text;

  console.log(`   Pages: ${pdf.numpages}, chars: ${rawText.length}`);

  const sections = splitIntoSections(rawText);
  console.log(`   Sections found: ${sections.length} (${sections.filter(s => s.kind === "activity").length} activities)`);

  // Derive module title from filename
  const moduleTitle = path.basename(filePath, ".pdf")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const moduleSlug = slugify(moduleTitle);

  // Output reviewable markdown
  const mdPath = path.join("scripts/output", `${moduleSlug}.md`);
  const md = outputMarkdown(sections, filePath);
  fs.mkdirSync("scripts/output", { recursive: true });
  fs.writeFileSync(mdPath, md, "utf-8");
  console.log(`\n✅ Markdown written to: ${mdPath}`);
  console.log("   Review it before inserting. Run without --dry-run to insert.\n");

  if (isDryRun) {
    console.log("── DRY RUN — no DB writes ──");
    return;
  }

  // Look up or create year
  let { data: year } = await supabase
    .from("years")
    .select("id")
    .eq("label", yearLabel)
    .single();

  if (!year) {
    const sortOrder = yearLabel.startsWith("1") ? 1 : 2;
    const { data: newYear } = await supabase
      .from("years")
      .insert({ label: yearLabel, sort_order: sortOrder })
      .select("id")
      .single();
    year = newYear;
  }

  // Look up or create subject
  let { data: subject } = await supabase
    .from("subjects")
    .select("id")
    .eq("slug", subjectSlug)
    .eq("year_id", year!.id)
    .single();

  if (!subject) {
    const title = subjectSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const { data: newSubject } = await supabase
      .from("subjects")
      .insert({ year_id: year!.id, title, slug: subjectSlug, sort_order: 1 })
      .select("id")
      .single();
    subject = newSubject;
  }

  // Get current max sort_order for modules in this subject
  const { data: existingModules } = await supabase
    .from("modules")
    .select("sort_order")
    .eq("subject_id", subject!.id)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextModuleOrder = (existingModules?.[0]?.sort_order ?? 0) + 1;

  // Insert module
  const { data: module } = await supabase
    .from("modules")
    .insert({
      subject_id: subject!.id,
      title: moduleTitle,
      slug: moduleSlug,
      sort_order: nextModuleOrder,
    })
    .select("id")
    .single();

  if (!module) {
    console.error("Failed to insert module");
    process.exit(1);
  }

  // Insert sections
  const sectionRows = sections.map((s, i) => ({
    module_id: module.id,
    kind: s.kind as "content" | "activity",
    heading: s.heading,
    body_md: s.body,
    sort_order: i + 1,
  }));

  const { error } = await supabase.from("sections").insert(sectionRows);
  if (error) {
    console.error("Section insert error:", error.message);
    process.exit(1);
  }

  console.log(`✅ Inserted module "${moduleTitle}" with ${sectionRows.length} sections.`);
}

async function main() {
  if (!fileArg) {
    console.log(`
BSIT Survival Kit — Ingest Script

Usage:
  npx tsx scripts/ingest.ts \\
    --year "1st Year" \\
    --subject "intro-to-computing" \\
    --file content-source/1st-year/intro-to-computing/module1.pdf \\
    [--dry-run]

Options:
  --year       Year label (e.g. "1st Year")
  --subject    Subject slug (e.g. "intro-to-computing")
  --file       Path to PDF file
  --dry-run    Parse + write markdown only, no DB writes

Output:
  scripts/output/<module-slug>.md  — review this before inserting
`);
    process.exit(0);
  }

  await ingestFile(fileArg, subjectSlugArg, `${yearArg} Year`);
}

main().catch((e) => { console.error(e); process.exit(1); });
