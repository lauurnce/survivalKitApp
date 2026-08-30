// scripts/social/check-post-lengths.check.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  effectiveLength,
  parsePosts,
  parseFrontMatter,
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

// parseFrontMatter: reads batch_type/covers_commit/post_count
{
  const md = '---\nbatch_type: update\ncovers_commit: abc1234\npost_count: 5\n---\nbody';
  const fm = parseFrontMatter(md);
  assert.equal(fm.batch_type, 'update');
  assert.equal(fm.covers_commit, 'abc1234');
  assert.equal(fm.post_count, '5');
}

// validateBatch: flags a post over 280 and a wrong post count
{
  const overLimit = 'x'.repeat(281);
  const md = [
    '---',
    'batch_type: update',
    'covers_commit: abc1234',
    'post_count: 5',
    '---',
    '',
    '### Post 1 (281/280)',
    overLimit,
  ].join('\n');
  const report = validateBatch(md);
  assert.equal(report.failures.length, 1, 'the 281-char post must fail');
  assert.equal(report.countOk, false, 'update batches need exactly 5 posts, this file has 1');
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

// effectiveLength: the flat URL cost still holds under the weighted algorithm
{
  const withPesoAndUrl = effectiveLength('₱99 a month https://survival-kit-app.vercel.app');
  // '₱99 a month ' (with trailing space) = ₱(2) + 9(1) + 9(1) + space(1) + a(1) + space(1)
  // + m(1) + o(1) + n(1) + t(1) + h(1) + space(1) = 2 + 11*1 = 13, plus flat URL cost 23.
  assert.equal(withPesoAndUrl, 36, 'weighted text length plus flat URL cost');
}

// validateBatch: an unrecognized batch_type fails countOk distinctly
{
  const md = [
    '---',
    'batch_type: initial | update',
    'covers_commit: abc1234',
    'post_count: 1',
    '---',
    '',
    '### Post 1 (5/280)',
    'hello',
  ].join('\n');
  const report = validateBatch(md);
  assert.equal(report.validBatchType, false, 'placeholder batch_type must not validate');
  assert.equal(report.countOk, false, 'an invalid batch_type must fail countOk');
}

// validateBatch: post_count front matter disagreeing with actual posts fails,
// even when the actual post count matches expectedCount for the batch_type
{
  const md = [
    '---',
    'batch_type: update',
    'covers_commit: abc1234',
    'post_count: 4',
    '---',
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
  assert.equal(report.validBatchType, true, 'batch_type is valid here');
  assert.equal(
    report.postCountFrontMatterOk,
    false,
    'front matter post_count (4) disagrees with actual post count (5)'
  );
  assert.equal(
    report.countOk,
    false,
    'countOk must fail when front-matter post_count disagrees with reality'
  );
}

// CLI: missing docs/social/ directory fails cleanly, no stack trace
{
  const scriptPath = fileURLToPath(new URL('./check-post-lengths.mjs', import.meta.url));
  const emptyCwd = mkdtempSync(join(tmpdir(), 'check-post-lengths-'));
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: emptyCwd,
    encoding: 'utf8',
  });
  assert.equal(result.status, 1, 'missing docs/social/ should exit 1, not crash');
  assert.match(
    result.stderr,
    /No docs\/social\/x-updates-\*\.md files found\./,
    'missing directory should print the same clean message as an empty directory'
  );
  assert.doesNotMatch(
    result.stderr,
    /ENOENT|at Object\.readdirSync/,
    'missing directory must not leak a raw fs stack trace'
  );
}

console.log('check-post-lengths self-test: all assertions passed');
