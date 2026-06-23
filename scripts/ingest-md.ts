#!/usr/bin/env tsx
/**
 * BSIT Survival Kit — Markdown Ingest Script
 * Loads 2nd year .md module files into Supabase.
 *
 * Usage:
 *   npx tsx scripts/ingest-md.ts [--dry-run] [--subject <slug>]
 *
 * Env required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

// ── Config ─────────────────────────────────────────────────────────────────────

const BASE_DIR = path.join(process.cwd(), "modules md files", "2nd year");
const YEAR_LABEL = "2nd Year";

// ── Subject definitions ────────────────────────────────────────────────────────

interface SubjectDef {
  title: string;
  slug: string;
  semester: 1 | 2;
  kind: "major" | "minor";
  sortOrder: number;
  semDir: "1st sem" | "2nd sem";
  source: { type: "dir"; name: string } | { type: "file"; name: string };
}

const SUBJECTS: SubjectDef[] = [
  {
    title: "Data Communications and Networking",
    slug: "data-comms-and-networking",
    semester: 1, kind: "major", sortOrder: 1,
    semDir: "1st sem",
    source: { type: "dir", name: "MAJOR - Data Communication and Networking" },
  },
  {
    title: "Data Structures and Algorithms",
    slug: "data-structures-and-algorithms",
    semester: 1, kind: "major", sortOrder: 2,
    semDir: "1st sem",
    source: { type: "file", name: "MAJOR - Discrete Structures and Algorithm.md" },
  },
  {
    title: "Structured Programming (COBOL)",
    slug: "structured-programming-cobol",
    semester: 1, kind: "major", sortOrder: 3,
    semDir: "1st sem",
    source: { type: "file", name: "MAJOR - Structured Programming (COBOL).md" },
  },
  {
    title: "Operating Systems",
    slug: "operating-systems",
    semester: 1, kind: "major", sortOrder: 4,
    semDir: "1st sem",
    source: { type: "file", name: "MAJOR - Operating System.md" },
  },
  {
    title: "World Literature",
    slug: "world-literature",
    semester: 1, kind: "minor", sortOrder: 5,
    semDir: "1st sem",
    source: { type: "file", name: "MINOR - World Literature.md" },
  },
  {
    title: "Object-Oriented Programming with Java",
    slug: "oop-java",
    semester: 2, kind: "major", sortOrder: 1,
    semDir: "2nd sem",
    source: { type: "dir", name: "MAJOR - Object Oriented Programming (Java)" },
  },
  {
    title: "Network Administration",
    slug: "network-administration",
    semester: 2, kind: "major", sortOrder: 2,
    semDir: "2nd sem",
    source: { type: "dir", name: "MAJOR - Network Administration" },
  },
];

// ── Types ──────────────────────────────────────────────────────────────────────

interface ParsedSection {
  heading: string;
  body_md: string;
  kind: "content" | "activity";
}

interface ParsedModule {
  title: string;
  slug: string;
  sections: ParsedSection[];
}

// ── Args ───────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const subjectFilter = args.includes("--subject")
  ? args[args.indexOf("--subject") + 1]
  : null;

// ── Supabase ───────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Helpers ────────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function moduleSlugFromFilename(filename: string): string {
  const base = path.basename(filename, ".md");
  return base
    .replace(/^\d+[-_]/, "")   // strip leading "01_" or "01-"
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]/gi, "-")
    .toLowerCase()
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseMdFile(filePath: string): ParsedModule {
  const content = fs.readFileSync(filePath, "utf-8");
  const basename = path.basename(filePath);

  // Extract module title from first # heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch
    ? titleMatch[1].trim()
    : basename.replace(".md", "").replace(/[-_]/g, " ");

  // Strip metadata comment, title line, and ⚠️ review warning lines
  const cleaned = content
    .replace(/<!--\s*subject:[^>]*-->/gi, "")
    .replace(/^#\s+.+$/m, "")
    .replace(/^⚠️\s*REVIEW[^\n]*/gm, "")
    .trim();

  // Split at <!-- kind: content/activity --> markers.
  // With a capture group, split() interleaves the captures:
  //   [preamble, kind1, body1, kind2, body2, ...]
  const parts = cleaned.split(/<!--\s*kind:\s*(content|activity)\s*-->/i);

  const sections: ParsedSection[] = [];

  for (let i = 1; i < parts.length - 1; i += 2) {
    const kind = parts[i].toLowerCase().trim() as "content" | "activity";
    const body = (parts[i + 1] ?? "").trim();
    if (!body) continue;

    const bodyLines = body.split("\n");
    const headingIdx = bodyLines.findIndex((l) => /^#{2,3}\s+/.test(l));

    let heading: string;
    let bodyMd: string;

    if (headingIdx >= 0) {
      heading = bodyLines[headingIdx].replace(/^#{2,3}\s+/, "").trim();
      bodyMd = [
        ...bodyLines.slice(0, headingIdx),
        ...bodyLines.slice(headingIdx + 1),
      ]
        .join("\n")
        .trim();
    } else {
      heading = kind === "activity" ? "Activity" : title;
      bodyMd = body;
    }

    if (bodyMd.length > 0) {
      sections.push({ heading, body_md: bodyMd, kind });
    }
  }

  const slug = /^\d+[-_]/.test(basename)
    ? moduleSlugFromFilename(basename)
    : slugify(title);

  return { title, slug, sections };
}

function getModuleFiles(subject: SubjectDef): string[] {
  const basePath = path.join(BASE_DIR, subject.semDir);

  if (subject.source.type === "file") {
    const filePath = path.join(basePath, subject.source.name);
    return fs.existsSync(filePath) ? [filePath] : [];
  }

  const dirPath = path.join(basePath, subject.source.name);
  if (!fs.existsSync(dirPath)) {
    console.warn(`  ⚠️  Directory not found: ${dirPath}`);
    return [];
  }

  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(".md") && !/^readme/i.test(f))
    .sort()
    .map((f) => path.join(dirPath, f));
}

// ── DB operations ──────────────────────────────────────────────────────────────

async function getOrCreateYear(): Promise<string> {
  const { data: existing } = await supabase
    .from("years")
    .select("id")
    .eq("label", YEAR_LABEL)
    .single();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("years")
    .insert({ label: YEAR_LABEL, sort_order: 2 })
    .select("id")
    .single();

  if (error || !created)
    throw new Error(`Failed to create year: ${error?.message}`);
  return created.id;
}

async function upsertSubject(
  subject: SubjectDef,
  yearId: string
): Promise<string> {
  const { data: existing } = await supabase
    .from("subjects")
    .select("id")
    .eq("year_id", yearId)
    .eq("slug", subject.slug)
    .single();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("subjects")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert({
      year_id: yearId,
      title: subject.title,
      slug: subject.slug,
      sort_order: subject.sortOrder,
      semester: subject.semester,
      kind: subject.kind,
    } as any)
    .select("id")
    .single();

  if (error || !created)
    throw new Error(
      `Failed to create subject "${subject.slug}": ${error?.message}`
    );
  return created.id;
}

async function upsertModule(
  mod: ParsedModule,
  subjectId: string,
  sortOrder: number
): Promise<string> {
  const { data: existing } = await supabase
    .from("modules")
    .select("id")
    .eq("subject_id", subjectId)
    .eq("slug", mod.slug)
    .single();

  if (existing) {
    await supabase
      .from("modules")
      .update({ title: mod.title, sort_order: sortOrder })
      .eq("id", existing.id);
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from("modules")
    .insert({
      subject_id: subjectId,
      title: mod.title,
      slug: mod.slug,
      sort_order: sortOrder,
    })
    .select("id")
    .single();

  if (error || !created)
    throw new Error(
      `Failed to create module "${mod.slug}": ${error?.message}`
    );
  return created.id;
}

async function replaceSections(
  moduleId: string,
  sections: ParsedSection[]
): Promise<void> {
  await supabase.from("sections").delete().eq("module_id", moduleId);
  if (sections.length === 0) return;

  const rows = sections.map((s, i) => ({
    module_id: moduleId,
    kind: s.kind,
    heading: s.heading,
    body_md: s.body_md,
    sort_order: i + 1,
  }));

  const { error } = await supabase.from("sections").insert(rows);
  if (error) throw new Error(`Failed to insert sections: ${error.message}`);
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function processSubject(
  subject: SubjectDef,
  yearId: string
): Promise<void> {
  console.log(
    `\n📚 ${subject.title}  [${subject.kind}, sem ${subject.semester}]`
  );

  const files = getModuleFiles(subject);
  if (files.length === 0) {
    console.log("   No files found — skipping.");
    return;
  }

  const subjectId = isDryRun ? "dry-run-id" : await upsertSubject(subject, yearId);

  for (let i = 0; i < files.length; i++) {
    const mod = parseMdFile(files[i]);
    const activityCount = mod.sections.filter((s) => s.kind === "activity").length;

    console.log(
      `   [${String(i + 1).padStart(2, "0")}] ${mod.title}`
    );
    console.log(
      `        slug: ${mod.slug} | ${mod.sections.length} sections (${activityCount} activities)`
    );

    if (isDryRun) {
      mod.sections.forEach((s, j) => {
        const preview = s.body_md.slice(0, 60).replace(/\n/g, " ");
        console.log(
          `        §${j + 1} [${s.kind}] "${s.heading}" — ${s.body_md.length} chars — "${preview}…"`
        );
      });
      continue;
    }

    const moduleId = await upsertModule(mod, subjectId, i + 1);
    await replaceSections(moduleId, mod.sections);
    console.log(`        ✅ saved`);
  }
}

async function main(): Promise<void> {
  console.log("\n🎒  BSIT Survival Kit — 2nd Year MD Ingest");
  console.log(`    Mode  : ${isDryRun ? "DRY RUN (no DB writes)" : "LIVE"}`);
  console.log(`    Source: ${BASE_DIR}\n`);

  const subjects = subjectFilter
    ? SUBJECTS.filter((s) => s.slug === subjectFilter)
    : SUBJECTS;

  if (subjects.length === 0) {
    console.error(`No subject with slug "${subjectFilter}" found.`);
    process.exit(1);
  }

  const yearId = isDryRun ? "dry-run-year-id" : await getOrCreateYear();

  for (const subject of subjects) {
    await processSubject(subject, yearId);
  }

  console.log("\n🎉  Done!\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
