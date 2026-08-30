#!/usr/bin/env node
// scripts/social/check-post-lengths.mjs
import { readFileSync, existsSync } from 'node:fs';

const X_LIMIT = 280;
const URL_COST = 23;
const URL_RE = /https?:\/\/\S+/g;
const DEFAULT_PATH = 'docs/social/x-updates.md';

function weightedLength(text) {
  let total = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    const lowWeight =
      (cp >= 0 && cp <= 4351) ||
      (cp >= 8192 && cp <= 8205) ||
      (cp >= 8208 && cp <= 8223) ||
      (cp >= 8242 && cp <= 8247);
    total += lowWeight ? 1 : 2;
  }
  return total;
}

export function effectiveLength(text) {
  const urls = text.match(URL_RE) ?? [];
  const withoutUrls = text.replace(URL_RE, '');
  return weightedLength(withoutUrls) + urls.length * URL_COST;
}

const POST_HEADER_RE = /^### Post (\d+) \((\d+)\/280\)\s*$/;

export function parsePosts(content) {
  const lines = content.split('\n');
  const posts = [];
  let current = null;
  for (const line of lines) {
    const match = line.match(POST_HEADER_RE);
    if (match) {
      if (current) posts.push(current);
      current = { number: Number(match[1]), claimed: Number(match[2]), bodyLines: [] };
    } else if (current) {
      current.bodyLines.push(line);
    }
  }
  if (current) posts.push(current);
  return posts.map((p) => ({
    number: p.number,
    claimed: p.claimed,
    text: p.bodyLines.join('\n').trim(),
  }));
}

// A batch section header, e.g.:
// ## 2026-08-30 — initial (20 posts, covers fd35a52)
const SECTION_HEADER_RE =
  /^## (\d{4}-\d{2}-\d{2}) — (\S+) \((\d+) posts?, covers ([0-9a-f]+)\)\s*$/;

export function splitSections(content) {
  const lines = content.split('\n');
  const sections = [];
  let current = null;
  for (const line of lines) {
    const match = line.match(SECTION_HEADER_RE);
    if (match) {
      if (current) sections.push(current);
      current = {
        date: match[1],
        batchType: match[2],
        declaredCount: Number(match[3]),
        coversCommit: match[4],
        bodyLines: [],
      };
    } else if (current) {
      current.bodyLines.push(line);
    }
  }
  if (current) sections.push(current);
  return sections.map((s) => ({
    date: s.date,
    batchType: s.batchType,
    declaredCount: s.declaredCount,
    coversCommit: s.coversCommit,
    body: s.bodyLines.join('\n'),
  }));
}

// The file is an append-only log of every batch ever generated; validation
// always targets the most recently appended section, since that is the
// only one a given run could have just written.
export function latestSection(content) {
  const sections = splitSections(content);
  return sections.length > 0 ? sections[sections.length - 1] : null;
}

export function validateBatch(content) {
  const section = latestSection(content);
  if (!section) {
    return {
      section: null,
      results: [],
      failures: [],
      mismatches: [],
      countOk: false,
      validBatchType: false,
      expectedCount: null,
      actualCount: 0,
      declaredCountOk: false,
    };
  }

  const validBatchType = section.batchType === 'initial' || section.batchType === 'update';
  const expectedCount =
    section.batchType === 'initial' ? 20 : section.batchType === 'update' ? 5 : null;

  const posts = parsePosts(section.body);
  const results = posts.map((p) => {
    const effective = effectiveLength(p.text);
    return {
      number: p.number,
      claimed: p.claimed,
      effective,
      pass: effective <= X_LIMIT,
      countMismatch: effective !== p.claimed,
    };
  });
  const failures = results.filter((r) => !r.pass);
  const mismatches = results.filter((r) => r.countMismatch);

  const declaredCountOk = section.declaredCount === posts.length;
  const countOk = validBatchType && posts.length === expectedCount && declaredCountOk;

  return {
    section,
    results,
    failures,
    mismatches,
    countOk,
    validBatchType,
    expectedCount,
    actualCount: posts.length,
    declaredCountOk,
  };
}

function main() {
  const filePath = process.argv[2] || DEFAULT_PATH;
  if (!existsSync(filePath)) {
    console.error(`No ${filePath} found.`);
    process.exit(1);
  }
  const content = readFileSync(filePath, 'utf8');
  const report = validateBatch(content);

  console.log(`Checking ${filePath} (latest batch section)`);
  if (!report.section) {
    console.error(
      'No batch sections found — expected a "## <date> — initial|update (N posts, covers <hash>)" header.'
    );
    process.exit(1);
  }
  console.log(
    `date=${report.section.date} batch_type=${report.section.batchType} expected_count=${
      report.expectedCount ?? 'unknown'
    } actual_count=${report.actualCount}`
  );
  for (const r of report.results) {
    const status = r.pass ? 'PASS' : 'FAIL';
    const flag = r.countMismatch ? ' [header count mismatch]' : '';
    console.log(
      `Post ${r.number}: effective=${r.effective}/280 claimed=${r.claimed}/280 ${status}${flag}`
    );
  }

  const ok =
    report.failures.length === 0 && report.mismatches.length === 0 && report.countOk;
  if (!ok) {
    if (report.failures.length > 0) {
      console.error(`\n${report.failures.length} post(s) exceed 280 characters.`);
    }
    if (report.mismatches.length > 0) {
      console.error(
        `\n${report.mismatches.length} post(s) have a header count that does not match their actual (effective) length.`
      );
    }
    if (!report.countOk) {
      if (!report.validBatchType) {
        console.error(
          `\nInvalid batch type in section header: expected "initial" or "update", got ${JSON.stringify(
            report.section.batchType
          )}.`
        );
      } else if (report.actualCount !== report.expectedCount) {
        console.error(`\nExpected ${report.expectedCount} posts, found ${report.actualCount}.`);
      } else if (!report.declaredCountOk) {
        console.error(
          `\nSection header declares ${report.section.declaredCount} posts but ${report.actualCount} were found.`
        );
      }
    }
    process.exit(1);
  }
  console.log('\nAll posts within limit.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
