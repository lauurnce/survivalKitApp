// scripts/social/check-post-lengths.check.mjs
import assert from 'node:assert/strict';
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

console.log('check-post-lengths self-test: all assertions passed');
