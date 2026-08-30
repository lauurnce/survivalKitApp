#!/usr/bin/env node
// scripts/social/check-post-lengths.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const X_LIMIT = 280;
const URL_COST = 23;
const URL_RE = /https?:\/\/\S+/g;

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

export function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    fm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return fm;
}

export function validateBatch(content) {
  const fm = parseFrontMatter(content);
  const posts = parsePosts(content);
  const validBatchType = fm.batch_type === 'initial' || fm.batch_type === 'update';
  const expectedCount =
    fm.batch_type === 'initial' ? 20 : fm.batch_type === 'update' ? 5 : null;
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

  const frontMatterPostCount = fm.post_count !== undefined ? Number(fm.post_count) : null;
  const postCountFrontMatterOk =
    frontMatterPostCount === null || frontMatterPostCount === posts.length;

  const countOk =
    validBatchType && posts.length === expectedCount && postCountFrontMatterOk;

  return {
    fm,
    results,
    failures,
    mismatches,
    countOk,
    validBatchType,
    expectedCount,
    actualCount: posts.length,
    frontMatterPostCount,
    postCountFrontMatterOk,
  };
}

function main() {
  let filePath = process.argv[2];
  if (!filePath) {
    const dir = 'docs/social';
    if (!existsSync(dir)) {
      console.error('No docs/social/x-updates-*.md files found.');
      process.exit(1);
    }
    const files = readdirSync(dir).filter((f) =>
      /^x-updates-\d{4}-\d{2}-\d{2}[a-z]?\.md$/.test(f)
    ).sort();
    if (files.length === 0) {
      console.error('No docs/social/x-updates-*.md files found.');
      process.exit(1);
    }
    filePath = join(dir, files[files.length - 1]);
  }
  const content = readFileSync(filePath, 'utf8');
  const report = validateBatch(content);

  console.log(`Checking ${filePath}`);
  console.log(
    `batch_type=${report.fm.batch_type ?? 'MISSING'} expected_count=${
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
          `\nInvalid or missing batch_type: expected "initial" or "update", got ${JSON.stringify(
            report.fm.batch_type ?? null
          )}.`
        );
      } else if (report.actualCount !== report.expectedCount) {
        console.error(`\nExpected ${report.expectedCount} posts, found ${report.actualCount}.`);
      } else if (!report.postCountFrontMatterOk) {
        console.error(
          `\nFront matter post_count (${report.frontMatterPostCount}) does not match actual post count (${report.actualCount}).`
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
