# HERALD (X-update generator) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a department agent (HERALD) + skill (`/x-updates`) that drafts X post batches — 20 posts on the first run telling the project's story since day 1, exactly 5 posts on every run after — from public sources only, each post validated against X's 280-character free-tier limit.

**Architecture:** A `.claude/agents/herald.md` definition (matching the existing pulse/vantage/ledger/warden department pattern) dispatched by a thin `.claude/skills/x-updates/SKILL.md`. No collector script — HERALD reads `git log`, `README.md`, and `STORY.md` directly since none of it needs privileged credentials. A small deterministic Node script (`scripts/social/check-post-lengths.mjs`) validates every post's character count independently of the agent's own arithmetic, because LLM self-counting is unreliable and a post that doesn't fit can't be posted.

**Tech Stack:** Markdown agent/skill definitions (Claude Code convention), plain Node `.mjs` scripts (matches `scripts/gen-story-svgs.mjs` + `.check.mjs` convention already in this repo — no Vitest wiring needed for a script this small).

**Spec:** `docs/superpowers/specs/2026-08-29-x-updates-herald-design.md`

## Global Constraints

- Every X post ≤ 280 characters. A URL inside a post costs a flat 23 characters toward that limit regardless of its real length (X's `t.co` shortener).
- Content sources allowed: `README.md`, `STORY.md`, git commit subjects, `docs/HANDOFF-*.md`. Never `docs/reports/**` (gitignored, private) or `docs/POST-MORTEM.md` (revenue/shutdown figures excluded from public disclosure).
- INITIAL batch (no prior `docs/social/x-updates-*.md`) = exactly 20 posts. UPDATE batch (a prior file exists) = exactly 5 posts, diffed from that file's `covers_commit`.
- `docs/social/` output is **committed** (public content) — the opposite of `docs/reports/`, which stays gitignored.
- No X API integration. Output is draft text for manual copy-paste only.
- All work happens in `~/projects/survivalKitApp-herald` on branch `feat/x-updates-herald`. Never edit the main checkout.

---

## File Structure

| File | Responsibility |
|---|---|
| `.claude/agents/herald.md` | Department agent definition: voice, char-limit rule, source allow/denylist, batch-detection + draft procedure, output format |
| `.claude/skills/x-updates/SKILL.md` | Thin dispatch skill: how to invoke HERALD, the inverted (committed, not gitignored) disclosure rule |
| `scripts/social/check-post-lengths.mjs` | Deterministic validator: parses a batch file, computes each post's effective length, checks post count against `batch_type` |
| `scripts/social/check-post-lengths.check.mjs` | Self-test for the validator (mirrors `scripts/gen-story-svgs.check.mjs`'s pattern) |
| `docs/social/x-updates-<date>.md` | Generated output — the actual 20-post initial batch |
| `README.md` | One new bullet under "Where things stand" pointing at the new capability |
| `package.json` | New `social:check` script entry |

---

### Task 1: HERALD agent definition

**Files:**
- Create: `.claude/agents/herald.md`

**Interfaces:**
- Produces: the procedure Task 4's stand-in dispatch reads and executes verbatim.

- [ ] **Step 1: Write the agent definition**

```markdown
---
name: herald
description: Public updates department agent. Use when generating X (Twitter) post drafts about project progress — the initial 20-post history batch, or the ongoing 5-post update batches. Never for private/internal reports.
tools: Bash, Read, Write, Edit, Glob, Grep
---

# HERALD · Public Updates

You are HERALD, the Public Updates department. You write X post drafts, not
internal reports — everything you produce is meant to be read by strangers,
so treat every number and sentence as something a stranger will see.

## The one rule that overrides all others

**Never write a number, incident, or fact that isn't already public.**
Public means: it appears in `README.md`, `STORY.md`, or a git commit
subject. If a figure only exists in `docs/reports/**` or
`docs/POST-MORTEM.md`, it does not exist for you. `docs/POST-MORTEM.md` in
particular holds revenue and shutdown-consideration figures Lawrence
explicitly chose to keep out of public disclosure — never open it, never
recall it from any other context, never paraphrase around it.

Allowed sources, and only these:
- `README.md` — "Where things stand" section and the data snapshot table
- `STORY.md` — origin story, problem, validation, reach stats, roadmap
- `git log` commit subjects (not diffs — a subject line is already a public
  changelog entry; a diff might not be)
- `docs/HANDOFF-*.md` — for narrative color on what shipped and why

Forbidden, always: `docs/reports/**` (gitignored, private department
reports), `docs/POST-MORTEM.md`, any number you can't point to in the
allowed sources above.

## Character limit

X's free tier caps a post at **280 characters**. Count every character in
the post text. If a post includes a URL, the URL costs a flat **23
characters** toward that limit regardless of its real length (X's `t.co`
auto-shortener rewrites every link to that length) — so
`https://survival-kit-app.vercel.app` costs 23, not 36.

A post that doesn't fit gets cut, not truncated with "…" — rewrite it
shorter. Every post you emit must show its count inline, e.g.
`### Post 3 (247/280)`, computed after the link substitution above. Your
own arithmetic is unreliable — `scripts/social/check-post-lengths.mjs` is
the real check and will run after you finish; aim to pass it, don't trust
your count as final.

## Voice

First person, Lawrence's own voice — match STORY.md's register: direct,
concrete, numbers over adjectives. "6,668 students found this with zero ad
spend" beats "we've grown a lot." No corporate voice, no hashtag stuffing
(zero or one hashtag, only if it's already how the project talks about
itself — check STORY.md/README.md for precedent before inventing one).

## Step 1 — Detect batch type

```sh
find docs/social -maxdepth 1 -name 'x-updates-*.md' 2>/dev/null | sort | tail -1
```

- **Nothing printed** → this is the **INITIAL** batch. Produce exactly
  **20** posts.
- **A path printed** → this is an **UPDATE** batch. Read that file's front
  matter for `covers_commit`. Produce exactly **5** posts.

If you cannot produce the required count from real, allowed-source material
(too little changed for 5 honest posts), say so instead of padding with
filler — report back with fewer real posts and name the shortfall rather
than inventing content.

## Step 2 — Gather context

Always:
```sh
cat README.md
```

**INITIAL batch**, additionally:
```sh
cat STORY.md
git log --reverse --format='%ad %s' --date=short | head -20
```
Read the whole `STORY.md` — its five sections (§01 why, §02 problem, §03
validation, §04 reach, §05 what's next) are the backbone of the 20-post arc.

**UPDATE batch**, additionally:
```sh
git log <covers_commit>..HEAD --oneline
```
And diff the current README data-snapshot table against the numbers named
in the previous `docs/social/x-updates-*.md` file's posts — call out only
values that actually moved.

## Step 3 — Draft

**INITIAL (20 posts).** Spread across the STORY.md arc so the batch reads
as a thread even though each post stands alone:
- 3-4 posts: why the project exists (§01 — no tech background, generic
  tutorials failed, built his own notes, TikTok went viral)
- 2-3 posts: the problem (§02 — nothing built for BSIT, group-chat study
  habits, GCash/no-credit-card economics)
- 3-4 posts: validation (§03 — TikTok before code, launch day devices, six
  weeks of organic reach, waitlist demand)
- 4-5 posts: reach so far (§04 — current data snapshot numbers from
  README: subjects, modules, tracked events, accounts, universities)
- 3-4 posts: current progress (README's "Where things stand" shipped
  features — per-subject quizzes, navigation overhaul, roadmap, profile
  dashboard, SQL labs)
- 2-3 posts: what's next (§05 — subscription pivot framed as "more
  commitment," not "more expensive")

Every number must trace to README.md or STORY.md — no exceptions.

**UPDATE (exactly 5 posts).** Pull only from what changed since
`covers_commit`:
- Shipped features: new commit subjects since last batch, cross-referenced
  against README's "Where things stand" (a commit subject alone can be
  cryptic — confirm it shipped by checking README reflects it)
- Data movement: any data-snapshot number that changed since the previous
  batch (name both the old and new value)
- If fewer than 5 honest posts exist, say so per Step 1's rule rather than
  padding

## Step 4 — Validate and write

For each post: count characters (URL = 23 flat, per above), confirm ≤280,
tag the count inline.

Write to `docs/social/x-updates-<YYYY-MM-DD>.md` (use today's date,
`TZ=Asia/Manila`):

```markdown
---
batch_type: initial | update
covers_commit: <HEAD short hash at run time>
post_count: 20 | 5
generated: <YYYY-MM-DD>
---

# X updates — <date>

### Post 1 (NNN/280)
<text>

### Post 2 (NNN/280)
<text>

...
```

Get `HEAD`'s short hash with `git rev-parse --short HEAD` and record it as
`covers_commit` — the next UPDATE run diffs from this exact point.

Then run:
```sh
node scripts/social/check-post-lengths.mjs docs/social/x-updates-<date>.md
```
If it reports any FAIL or a count mismatch, rewrite the flagged posts and
re-run until it passes cleanly.

## What you are not

You do not post to X. You do not touch the X API. You produce draft text
for Lawrence to copy-paste himself. If asked to auto-post, say that's out of
scope for this agent.
```

- [ ] **Step 2: Verify frontmatter and required sections are present**

```sh
grep -c "^name: herald$" .claude/agents/herald.md
grep -c "^tools: Bash, Read, Write, Edit, Glob, Grep$" .claude/agents/herald.md
grep -c "docs/POST-MORTEM.md" .claude/agents/herald.md
```

Expected: each prints `1` or more (frontmatter fields present; the denylist
is named explicitly, not just implied).

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/herald.md
git commit -m "feat: add HERALD department agent for public X-update drafts"
```

---

### Task 2: `/x-updates` dispatch skill

**Files:**
- Create: `.claude/skills/x-updates/SKILL.md`

**Interfaces:**
- Consumes: nothing from Task 1 (references HERALD by name/role only, not its file content).
- Produces: nothing later tasks call programmatically — this is a human/agent-facing doc.

- [ ] **Step 1: Write the skill**

```markdown
---
name: x-updates
description: Generate X (Twitter) post drafts about project progress — the initial 20-post history/progress batch, or an ongoing 5-post update batch. Use when asked to "post project updates to X", "generate X posts", "/x-updates", or "what should I post about progress".
---

# X updates

Drafts X-ready post text from **public sources only** — `README.md`,
`STORY.md`, git commit subjects. Never reads `docs/reports/**` or
`docs/POST-MORTEM.md`.

## Running it

Dispatch HERALD with the Agent tool: `subagent_type: "herald"`. No
collector step first — HERALD reads `git log` and the two markdown files
itself; nothing here needs Supabase credentials or a deterministic
pre-pass.

**If you have just edited `.claude/agents/herald.md`, restart the session
before dispatching it.** Agent definitions load at session start, same as
every other department agent in this repo — a subagent dispatched after a
mid-session edit runs the old instructions.

HERALD decides its own batch size: 20 posts if `docs/social/` has no prior
`x-updates-*.md` file, otherwise exactly 5, diffed against the most recent
one. See `.claude/agents/herald.md` for the full procedure.

## Validating output

Before treating a batch as ready to post, run:
```sh
node scripts/social/check-post-lengths.mjs
```
(no argument needed — it finds the most recent `docs/social/x-updates-*.md`
file on its own). This is a deterministic re-check independent of HERALD's
own char counts.

## Output — the opposite disclosure rule from `report`

`docs/social/` is **committed** — it holds public content, meant to be
posted. This is the reverse of `docs/reports/`, which is gitignored because
it holds private data. Don't carry the `report` skill's "never commit this"
habit over here by reflex — committing `docs/social/x-updates-*.md` is the
correct, intended behavior.

## Relaying the result

Report the batch type (initial/update), post count, and the output file
path. If HERALD reported a shortfall (fewer than the required count because
too little changed), relay that honestly rather than treating it as an
error.
```

- [ ] **Step 2: Verify it references the validator and the session-restart gotcha**

```sh
grep -c "check-post-lengths.mjs" .claude/skills/x-updates/SKILL.md
grep -c "restart the session" .claude/skills/x-updates/SKILL.md
```

Expected: both print `1` or more.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/x-updates/SKILL.md
git commit -m "feat: add /x-updates skill to dispatch HERALD"
```

---

### Task 3: Post-length validator script

**Files:**
- Create: `scripts/social/check-post-lengths.mjs`
- Create: `scripts/social/check-post-lengths.check.mjs`
- Modify: `package.json` (add `social:check` script)

**Interfaces:**
- Produces: `effectiveLength(text: string): number`, `parsePosts(content: string): {number, claimed, text}[]`, `parseFrontMatter(content: string): Record<string,string>`, `validateBatch(content: string): {fm, results, failures, mismatches, countOk, expectedCount, actualCount}` — all exported from `check-post-lengths.mjs`, all consumed by Task 4's verification step and by HERALD's own Step 4.

- [ ] **Step 1: Write the self-test first**

```javascript
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node scripts/social/check-post-lengths.check.mjs`
Expected: FAIL with `Cannot find module './check-post-lengths.mjs'` (the
implementation doesn't exist yet).

- [ ] **Step 3: Write the implementation**

```javascript
#!/usr/bin/env node
// scripts/social/check-post-lengths.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const X_LIMIT = 280;
const URL_COST = 23;
const URL_RE = /https?:\/\/\S+/g;

export function effectiveLength(text) {
  const urls = text.match(URL_RE) ?? [];
  const withoutUrls = text.replace(URL_RE, '');
  return withoutUrls.length + urls.length * URL_COST;
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
  const countOk = expectedCount === null || posts.length === expectedCount;
  return {
    fm,
    results,
    failures,
    mismatches,
    countOk,
    expectedCount,
    actualCount: posts.length,
  };
}

function main() {
  let filePath = process.argv[2];
  if (!filePath) {
    const dir = 'docs/social';
    const files = readdirSync(dir).filter((f) =>
      /^x-updates-\d{4}-\d{2}-\d{2}\.md$/.test(f)
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

  const ok = report.failures.length === 0 && report.countOk;
  if (!ok) {
    if (report.failures.length > 0) {
      console.error(`\n${report.failures.length} post(s) exceed 280 characters.`);
    }
    if (!report.countOk) {
      console.error(`\nExpected ${report.expectedCount} posts, found ${report.actualCount}.`);
    }
    process.exit(1);
  }
  console.log('\nAll posts within limit.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
```

- [ ] **Step 4: Run the self-test to verify it passes**

Run: `node scripts/social/check-post-lengths.check.mjs`
Expected: `check-post-lengths self-test: all assertions passed`

- [ ] **Step 5: Add the npm script**

In `package.json`, add to `"scripts"` (alongside the existing `story:check`
entry):

```json
    "social:check": "node scripts/social/check-post-lengths.mjs",
```

- [ ] **Step 6: Commit**

```bash
git add scripts/social/check-post-lengths.mjs scripts/social/check-post-lengths.check.mjs package.json
git commit -m "feat: add deterministic X-post length validator"
```

---

### Task 4: Generate the first INITIAL batch (20 posts)

**Depends on:** Task 1 (herald.md's procedure), Task 3 (the validator).

**Files:**
- Create: `docs/social/x-updates-<today>.md` (date from `TZ=Asia/Manila date +%F`)

**Interfaces:**
- Consumes: `.claude/agents/herald.md`'s procedure (Task 1), `scripts/social/check-post-lengths.mjs` (Task 3).

- [ ] **Step 1: Confirm Tasks 1–3 are committed**

```sh
git -C ~/projects/survivalKitApp-herald log --oneline -5
git -C ~/projects/survivalKitApp-herald status --short
```

Expected: three feature commits from Tasks 1–3, clean tree.

- [ ] **Step 2: Dispatch a general-purpose agent to execute HERALD's procedure**

`subagent_type: "herald"` is **not** available this session — Claude Code
loads the list of dispatchable agent types once at session start, before
`.claude/agents/herald.md` existed. Use `subagent_type: "general-purpose"`
instead, with a self-contained prompt that names the exact file to follow:

> "Open `.claude/agents/herald.md` in
> `/Users/lauurnce/projects/survivalKitApp-herald` and execute its
> procedure exactly as written (Steps 1–4), from that working directory.
> This is the first run, so `docs/social/` will be empty — follow the
> INITIAL branch (20 posts). Do not deviate from the source allowlist /
> denylist in the file. When done, report the output file path and the
> validator's final pass/fail summary."

(Once this branch merges to `main` and a future session starts fresh,
`subagent_type: "herald"` will work directly via the `/x-updates` skill —
this workaround is only needed because the definition was created in the
same session that needs to use it.)

- [ ] **Step 3: Independently re-run the validator**

Don't trust the dispatched agent's self-reported pass — re-run it directly:

```sh
cd ~/projects/survivalKitApp-herald
node scripts/social/check-post-lengths.mjs
```

Expected: `All posts within limit.` with `actual_count=20` and
`batch_type=initial`.

- [ ] **Step 4: If it fails, fix and re-run**

Edit the flagged posts in `docs/social/x-updates-<date>.md` directly (trim
text, don't just re-truncate) and re-run Step 3 until it passes cleanly.

- [ ] **Step 5: Spot-check for source-allowlist violations**

Read the generated file. Confirm every number in it traces to something you
can find in `README.md` or `STORY.md` — this is the one check the script
can't do. If anything looks like it came from a private source, remove or
rewrite that post before committing.

- [ ] **Step 6: Commit**

```bash
cd ~/projects/survivalKitApp-herald
git add docs/social/x-updates-*.md
git commit -m "content: generate initial 20-post X update batch"
```

---

### Task 5: README pointer

**Depends on:** Task 2 (the skill's final name/description).

**Files:**
- Modify: `README.md` (the "Where things stand" bullet list)

- [ ] **Step 1: Add one bullet**

In `README.md`, immediately after the existing bullet that reads "Ongoing
security/finance/ops/growth department reports (`npm run report:*`) audit
RLS posture, route guards, revenue reconciliation, and funnel metrics on a
recurring cadence.", add:

```markdown
- Public update drafts (`/x-updates` skill → HERALD) turn shipped progress
  into X-ready post batches — 20 posts on the first run, 5 on every run
  after — each checked against the 280-character free-tier limit.
```

- [ ] **Step 2: Verify it renders as a sibling bullet, not nested**

```sh
grep -A1 "report:\*.*recurring cadence" README.md
```

Expected: the new bullet's `-` starts at the same column as the others in
that list.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: mention the /x-updates skill in README"
```
