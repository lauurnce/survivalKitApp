// Generates empty seed-file scaffolds for BSIT subjects that currently have
// zero modules. Each scaffold pre-assigns a deterministic, collision-free UUID
// namespace per subject (derived from the slug via a UUIDv5-style hash) so that
// module/section UUIDs never clash with existing seeds or with each other.
//
// Run: node scripts/gen-module-scaffolds.mjs
// Output: supabase/seeds/_scaffold_<slug>_modules_sections.sql
//
// Workflow: paste GPT-5.5 deep-research output for a subject, then the import
// step fills in real module titles + section bodies using the reserved UUIDs.

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEEDS_DIR = join(__dirname, "..", "supabase", "seeds");

// The 20 real teachable empty subjects (IT Electives 1-4, Capstone 1/2, and
// Practicum are intentionally excluded — they are school-specific projects/OJT,
// not standard lecturable curriculum). subject_id values are the LIVE ids
// pulled from the survivalKitApp Supabase project on 2026-06-27.
const SUBJECTS = [
  { id: "11509900-1340-449a-993c-13b894dee299", slug: "understanding-the-self", title: "Understanding the Self", year: "1st Year", sem: 1, kind: "minor" },
  { id: "2ffc307f-4e05-4ef3-a033-1f6b3ed200d9", slug: "science-technology-and-society", title: "Science, Technology and Society", year: "1st Year", sem: 2, kind: "minor" },
  { id: "34687e6e-77e9-4b25-a4d9-8d0fd7c05582", slug: "the-contemporary-world", title: "The Contemporary World", year: "1st Year", sem: 2, kind: "minor" },
  { id: "20000000-0002-0002-0001-000000000003", slug: "information-management", title: "Information Management", year: "2nd Year", sem: 2, kind: "major" },
  { id: "20000000-0002-0002-0001-000000000004", slug: "human-computer-interaction", title: "Human Computer Interaction", year: "2nd Year", sem: 2, kind: "major" },
  { id: "20000000-0002-0002-0001-000000000005", slug: "integrative-programming-and-technologies-1", title: "Integrative Programming and Technologies 1", year: "2nd Year", sem: 2, kind: "major" },
  { id: "476dbfed-5212-4296-9036-895bbbe546d4", slug: "ethics", title: "Ethics", year: "2nd Year", sem: 2, kind: "minor" },
  { id: "6c302241-54af-4da4-9078-d1c65c1ce6e7", slug: "life-and-works-of-rizal", title: "The Life and Works of Rizal", year: "2nd Year", sem: 2, kind: "minor" },
  { id: "30000000-0003-0001-0001-000000000001", slug: "multimedia", title: "Multimedia", year: "3rd Year", sem: 1, kind: "major" },
  { id: "30000000-0003-0001-0001-000000000002", slug: "systems-integration-and-architecture", title: "Systems Integration and Architecture", year: "3rd Year", sem: 1, kind: "major" },
  { id: "30000000-0003-0001-0001-000000000003", slug: "fundamentals-of-research", title: "Fundamentals of Research", year: "3rd Year", sem: 1, kind: "minor" },
  { id: "69e11f2d-2a28-41d3-85b2-632981d17b4b", slug: "web-development", title: "Web Development", year: "3rd Year", sem: 1, kind: "major" },
  { id: "0a7947c5-6b9d-4a9c-8980-3d4187ec8d82", slug: "database-administration", title: "Database Administration", year: "3rd Year", sem: 1, kind: "major" },
  { id: "30000000-0003-0002-0001-000000000001", slug: "applications-development-and-emerging-technologies", title: "Applications Development and Emerging Technologies", year: "3rd Year", sem: 2, kind: "major" },
  { id: "30000000-0003-0002-0001-000000000002", slug: "technopreneurship", title: "Technopreneurship", year: "3rd Year", sem: 2, kind: "minor" },
  { id: "30000000-0003-0002-0001-000000000003", slug: "systems-analysis-and-design", title: "Systems Analysis and Design", year: "3rd Year", sem: 2, kind: "major" },
  { id: "30000000-0003-0002-0001-000000000004", slug: "information-assurance-and-security-1", title: "Information Assurance and Security 1", year: "3rd Year", sem: 2, kind: "major" },
  { id: "40000000-0004-0001-0001-000000000001", slug: "systems-administration-and-maintenance", title: "Systems Administration and Maintenance", year: "4th Year", sem: 1, kind: "major" },
  { id: "40000000-0004-0001-0001-000000000002", slug: "information-assurance-and-security-2", title: "Information Assurance and Security 2", year: "4th Year", sem: 1, kind: "major" },
  { id: "40000000-0004-0001-0001-000000000003", slug: "social-and-professional-issues-in-it", title: "Social and Professional Issues in IT", year: "4th Year", sem: 1, kind: "major" },
];

// How many module/section UUID slots to reserve up front.
const MODULES_PER_SUBJECT = 12;   // generous: majors need 6-10, minors 4-6
const SECTIONS_PER_MODULE = 10;   // 3-6 content + 1 activity, with headroom

// Deterministic UUIDv5 (SHA-1 based, RFC 4122) so the same slug+seed always
// yields the same UUID — re-running the generator is idempotent.
const NAMESPACE = "b9f8c1a0-7d3e-4c2b-9a14-survivalkit00"; // fixed app namespace
function uuidv5(name, namespace) {
  const nsBytes = Buffer.from(namespace.replace(/-/g, "").padEnd(32, "0").slice(0, 32), "hex");
  const hash = createHash("sha1").update(nsBytes).update(name).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function moduleUuid(slug, m) {
  return uuidv5(`${slug}:module:${m}`, NAMESPACE);
}
function sectionUuid(slug, m, s) {
  return uuidv5(`${slug}:module:${m}:section:${s}`, NAMESPACE);
}

mkdirSync(SEEDS_DIR, { recursive: true });

const idx = [];

for (const sub of SUBJECTS) {
  const modCount = sub.kind === "major" ? "6-10" : "4-6";
  const lines = [];

  lines.push("-- ============================================================");
  lines.push(`-- ${sub.title} — Modules & Sections (SCAFFOLD)`);
  lines.push(`-- Subject ID: ${sub.id}`);
  lines.push(`-- ${sub.year}, Semester ${sub.sem} — ${sub.kind}`);
  lines.push(`-- Suggested module count: ${modCount}`);
  lines.push("--");
  lines.push("-- Reserved UUID namespace below is collision-free and deterministic.");
  lines.push("-- Fill module titles/slugs + section headings/bodies from the GPT-5.5");
  lines.push("-- deep-research output, then run this file once. Re-running is safe");
  lines.push("-- (the DELETE clears prior rows for this subject first).");
  lines.push("-- ============================================================");
  lines.push("");
  lines.push(`DELETE FROM modules WHERE subject_id = '${sub.id}';`);
  lines.push("");

  // Reserved module UUIDs (commented reference table).
  lines.push("-- ---- Reserved module UUIDs (use in order; delete unused rows) ----");
  for (let m = 1; m <= MODULES_PER_SUBJECT; m++) {
    lines.push(`--   M${String(m).padStart(2, "0")}: ${moduleUuid(sub.slug, m)}`);
  }
  lines.push("");

  // INSERT modules skeleton.
  lines.push("-- INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES");
  const modRows = [];
  for (let m = 1; m <= MODULES_PER_SUBJECT; m++) {
    modRows.push(
      `--   ('${moduleUuid(sub.slug, m)}','${sub.id}','Lesson ${m}: <TITLE>','lesson-${m}-<slug>',${m})`
    );
  }
  lines.push(modRows.join(",\n") + ";");
  lines.push("");

  // Per-module reserved section UUIDs.
  lines.push("-- ---- Reserved section UUIDs, per module ----");
  for (let m = 1; m <= MODULES_PER_SUBJECT; m++) {
    lines.push(`-- Module ${m} (${moduleUuid(sub.slug, m)}):`);
    for (let s = 1; s <= SECTIONS_PER_MODULE; s++) {
      const note = s === SECTIONS_PER_MODULE ? "  <- reserve last for kind='activity'" : "";
      lines.push(`--   S${s}: ${sectionUuid(sub.slug, m, s)}${note}`);
    }
  }
  lines.push("");

  // Worked example showing the exact INSERT shape the importer should emit.
  lines.push("-- ============================================================");
  lines.push("-- IMPORT TEMPLATE — one INSERT per module. Replace placeholders.");
  lines.push("-- content sections are FREE; the final activity section is PAID.");
  lines.push("-- ide_language (python|sql|java|c), starter_code, topology_data are");
  lines.push("-- all OPTIONAL columns — include only when the section needs them.");
  lines.push("-- ============================================================");
  lines.push("--");
  lines.push("-- INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES");
  lines.push(`-- ('${moduleUuid(sub.slug, 1)}','content','<Heading>',$md$`);
  lines.push("-- <full markdown teaching body — free tier>");
  lines.push("-- $md$, 1),");
  lines.push(`-- ('${moduleUuid(sub.slug, 1)}','activity','Practice & Exam Drills — Lesson 1',$md$`);
  lines.push("-- <review questions, worked exam problems w/ solutions, how-to-pass tips — paid tier>");
  lines.push("-- $md$, 2);");
  lines.push("--");
  lines.push("-- With an interactive playground, use the 5-column form instead:");
  lines.push("-- INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES");
  lines.push(`-- ('${moduleUuid(sub.slug, 1)}','activity','Coding Drill',$md$<task>$md$, 3, 'python', $code$print("hi")$code$);`);
  lines.push("");
  lines.push("-- >>>>>>>>>>>>>>>>>>>>  PASTE FILLED-IN INSERTS BELOW  <<<<<<<<<<<<<<<<<<<<");
  lines.push("");

  const fname = `_scaffold_${sub.slug.replace(/-/g, "_")}_modules_sections.sql`;
  writeFileSync(join(SEEDS_DIR, fname), lines.join("\n") + "\n", "utf8");
  idx.push({ ...sub, fname });
}

// Write an index file so it's clear which scaffolds exist and in what order.
const idxLines = [];
idxLines.push("# Module Scaffold Index");
idxLines.push("");
idxLines.push("Generated by `scripts/gen-module-scaffolds.mjs`. One scaffold per empty,");
idxLines.push("teachable subject. Each reserves a collision-free UUID namespace so the");
idxLines.push("GPT-5.5 deep-research output can be imported instantly.");
idxLines.push("");
idxLines.push("| Order | Subject | Year/Sem | Kind | Scaffold file |");
idxLines.push("|---|---|---|---|---|");
idx.forEach((s, i) => {
  idxLines.push(`| ${i + 1} | ${s.title} | ${s.year} S${s.sem} | ${s.kind} | \`${s.fname}\` |`);
});
idxLines.push("");
idxLines.push("Excluded (not standard lecturable content): IT Elective 1-4, Capstone Project 1/2, Practicum.");
writeFileSync(join(SEEDS_DIR, "_SCAFFOLD_INDEX.md"), idxLines.join("\n") + "\n", "utf8");

console.log(`Generated ${idx.length} scaffolds + index in ${SEEDS_DIR}`);
