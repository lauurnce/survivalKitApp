// scripts/social/check-post-lengths.check.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  effectiveLength,
  parsePosts,
  splitSections,
  latestSection,
  validateBatch,
} from './check-post-lengths.mjs';

// effectiveLength: a URL always costs 23 chars regardless of real length
{
  const short = effectiveLength('See https://x.co now');
  const long = effectiveLength(
    'See https://survival-kit-app.vercel.app/some/very/long/path/here now'
  );
  assert.equal(short, 31);
  assert.equal(long, 31);
  assert.equal(short, long, 'URL cost must be flat regardless of real URL length');
}

// effectiveLength: X's real weighted char count, not plain String#length
{
  // U+20B1 PHILIPPINE PESO SIGN falls outside every weight-1 code point range,
  // so X counts it as 2 chars, not 1.
  const ascii = 'x'.repeat(10);
  const withPeso = effectiveLength(`${ascii}₱`);
  assert.equal(withPeso, 12, '₱ must weigh 2, so 10 ASCII chars + ₱ totals 12, not 11');

  // U+2014 EM DASH (decimal 8212) sits inside the [8208,8223] weight-1 range.
  const withEmDash = effectiveLength(`${ascii}—`);
  assert.equal(withEmDash, 11, 'em dash sits in the weight-1 range and must weigh 1');
}

// parsePosts: extracts number, claimed count, and trimmed body text
{
  const md = [
    '### Post 1 (10/280)',
    'hello world',
    '',
    '### Post 2 (5/280)',
    'hi',
  ].join('\n');
  const posts = parsePosts(md);
  assert.equal(posts.length, 2);
  assert.equal(posts[0].number, 1);
  assert.equal(posts[0].claimed, 10);
  assert.equal(posts[0].text, 'hello world');
  assert.equal(posts[1].text, 'hi');
}

// splitSections: an append-only file with multiple batches splits into one
// entry per "## <date> — <type> (N posts, covers <hash>)" header
{
  const md = [
    '# X updates',
    '',
    '## 2026-08-30 — initial (2 posts, covers aaa0000)',
    '',
    '### Post 1 (5/280)',
    'first',
    '',
    '### Post 2 (5/280)',
    'batch',
    '',
    '## 2026-08-31 — update (1 posts, covers bbb1111)',
    '',
    '### Post 1 (6/280)',
    'second',
  ].join('\n');
  const sections = splitSections(md);
  assert.equal(sections.length, 2);
  assert.equal(sections[0].date, '2026-08-30');
  assert.equal(sections[0].batchType, 'initial');
  assert.equal(sections[0].declaredCount, 2);
  assert.equal(sections[0].coversCommit, 'aaa0000');
  assert.equal(sections[1].date, '2026-08-31');
  assert.equal(sections[1].batchType, 'update');
  assert.equal(sections[1].coversCommit, 'bbb1111');

  // Earlier sections' posts must never bleed into a later one.
  const firstPosts = parsePosts(sections[0].body);
  assert.equal(firstPosts.length, 2);
  const secondPosts = parsePosts(sections[1].body);
  assert.equal(secondPosts.length, 1);
  assert.equal(secondPosts[0].text, 'second');

  // latestSection always picks the most recently appended one, never the first.
  const latest = latestSection(md);
  assert.equal(latest.date, '2026-08-31');
}

// validateBatch: validates only the latest section, ignoring earlier ones
// entirely — an old section full of failures must not fail today's run.
{
  const oldBrokenSection = [
    '## 2026-01-01 — initial (1 posts, covers 0ddba00)',
    '',
    `### Post 1 (${'x'.repeat(281)}/280)`,
    'x'.repeat(281),
  ].join('\n');
  const newGoodSection = [
    '## 2026-01-02 — update (1 posts, covers face000)',
    '',
    '### Post 1 (5/280)',
    'hello',
  ].join('\n');
  const md = ['# X updates', '', oldBrokenSection, '', newGoodSection].join('\n');
  const report = validateBatch(md);
  assert.equal(report.section.date, '2026-01-02', 'must validate the newest section');
  assert.equal(report.failures.length, 0, 'the old broken section must not affect this run');
}

// validateBatch: flags a post over 280 and a wrong post count in the latest section
{
  const overLimit = 'x'.repeat(281);
  const md = [
    '## 2026-08-31 — update (1 posts, covers abc1234)',
    '',
    `### Post 1 (281/280)`,
    overLimit,
  ].join('\n');
  const report = validateBatch(md);
  assert.equal(report.failures.length, 1, 'the 281-char post must fail');
  assert.equal(report.countOk, false, 'update batches need exactly 5 posts, this section has 1');
}

// validateBatch: an unrecognized batch type fails countOk distinctly
{
  const md = [
    '## 2026-08-31 — bogus (1 posts, covers abc1234)',
    '',
    '### Post 1 (5/280)',
    'hello',
  ].join('\n');
  const report = validateBatch(md);
  assert.equal(report.validBatchType, false, 'an unrecognized batch type must not validate');
  assert.equal(report.countOk, false, 'an invalid batch type must fail countOk');
}

// validateBatch: the section header's declared count disagreeing with the
// actual post count fails, even when actual matches the batch type's expectation
{
  const md = [
    '## 2026-08-31 — update (4 posts, covers abc1234)',
    '',
    '### Post 1 (5/280)',
    'hello',
    '',
    '### Post 2 (5/280)',
    'world',
    '',
    '### Post 3 (5/280)',
    'three',
    '',
    '### Post 4 (5/280)',
    'four!',
    '',
    '### Post 5 (5/280)',
    'five!',
  ].join('\n');
  const report = validateBatch(md);
  assert.equal(report.actualCount, 5, 'sanity check: five posts present, matches expectedCount');
  assert.equal(report.validBatchType, true, 'batch type is valid here');
  assert.equal(
    report.declaredCountOk,
    false,
    'section header declares 4 posts but 5 are actually present'
  );
  assert.equal(
    report.countOk,
    false,
    'countOk must fail when the declared count disagrees with reality'
  );
}

// CLI: missing docs/social/x-updates.md fails cleanly, no stack trace
{
  const scriptPath = fileURLToPath(new URL('./check-post-lengths.mjs', import.meta.url));
  const emptyCwd = mkdtempSync(join(tmpdir(), 'check-post-lengths-'));
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: emptyCwd,
    encoding: 'utf8',
  });
  assert.equal(result.status, 1, 'missing docs/social/x-updates.md should exit 1, not crash');
  assert.match(
    result.stderr,
    /No docs\/social\/x-updates\.md found\./,
    'missing file should print a clean, specific message'
  );
  assert.doesNotMatch(
    result.stderr,
    /ENOENT|at Object\.readFileSync/,
    'missing file must not leak a raw fs stack trace'
  );
}

// CLI: an append-only file with two batches validates only the second
// (latest) one, and the CLI needs no filename argument to find it
{
  const scriptPath = fileURLToPath(new URL('./check-post-lengths.mjs', import.meta.url));
  const cwd = mkdtempSync(join(tmpdir(), 'check-post-lengths-'));
  const socialDir = join(cwd, 'docs', 'social');
  mkdirSync(socialDir, { recursive: true });

  const content = [
    '# X updates',
    '',
    '## 2026-08-30 — initial (1 posts, covers aaa0000)',
    '',
    '### Post 1 (5/280)',
    'first (this whole section is stale and must be ignored)',
    '',
    '## 2026-08-31 — update (5 posts, covers bbb1111)',
    '',
    '### Post 1 (5/280)',
    'first',
    '',
    '### Post 2 (6/280)',
    'second',
    '',
    '### Post 3 (5/280)',
    'third',
    '',
    '### Post 4 (6/280)',
    'fourth',
    '',
    '### Post 5 (5/280)',
    'fifth',
  ].join('\n');
  writeFileSync(join(socialDir, 'x-updates.md'), content);

  const result = spawnSync(process.execPath, [scriptPath], { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, 'a clean, valid latest section should exit 0');
  assert.match(result.stdout, /date=2026-08-31/, 'must report on the latest section, not the first');
  assert.match(result.stdout, /All posts within limit\./);
}

console.log('check-post-lengths self-test: all assertions passed');
