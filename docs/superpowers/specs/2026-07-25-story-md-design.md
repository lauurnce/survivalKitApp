# STORY.md — Public Project Story Design

**Date:** 2026-07-25
**Status:** Approved by lauurnce (this doc records the approved design)

## Purpose

A public-facing `STORY.md` at the repo root so anyone viewing the project understands why it was started, the problem it solves, how the problem was validated, its reach so far, and where it's going. Linked from `README.md`.

## Deliverables

1. `STORY.md` at repo root
2. One link line added to `README.md` ("Read the story behind this project →")
3. Brand-styled SVG data visualizations committed to `assets/story/`
4. Fresh metrics pulled from live Supabase at build time

## Document structure (approved)

### 1. Header — photo + quote sidebar
- GitHub avatar (`https://github.com/lauurnce.png`) on the left via HTML `<img align>` / table layout (GitHub-flavored markdown)
- Right side: name (Lawrence Panes), tagline ("BSIT student at PUP · Iskolar ng Bayan · builder of BSIT Survival Kit"), and the approved sidebar quote:
  > "I built the resource I couldn't find when I was a freshman."

### 2. "Why I built this" — founder narrative (~250 words, first person)
Arc: entered BSIT with zero tech background → searched for course-aligned prep material, found none → months on 10-hour YouTube tutorials → false hope, retained nothing (generic tutorials don't teach curriculum fundamentals) → pivoted to studying the curriculum itself, built projects from lesson plans → finished 1st year with self-made projects and assessments → before 2nd year, searched again, still nothing → posted projects and subject content on TikTok → went viral → incoming freshmen offered to pay for comprehensive module content, practice exercises, and exam reviewers → built the app.

### 3. "The problem" — problem identification
Three named problems, each backed by a data point:
1. **No curriculum-aligned resources exist** for BSIT in the PH — generic tutorials create false confidence (lived experience)
2. **Studying happens in group chats, the night before exams** — 95% of visitors arrive via shared GC/Messenger links; 77% single-session; visits cluster around exam dates
3. **Existing ed-tech ignores how PH students actually pay and study** — 80% mobile, GCash wallets, no credit cards

### 4. "How I know it's real" — problem validation
- TikTok virality + unsolicited willingness to pay (validation before code)
- Launch June 16, 2026: ~1,300 devices in one day, zero ad spend
- 5,600+ devices, ~90k events in first 4 weeks, all organic
- Demand matches hypothesis: 74% first-years; CP1 = 52% of all traffic
- Students from PUP, USTP, Catanduanes State U, PLV, University of Eastern Pangasinan
- 3rd-year waitlist hand-raise rate 13% (~14× the 1st-year rate) for unpublished content

### 5. "Reach so far" — data + visualizations
- Stat strip: devices · events · accounts · waitlist · universities
- Bar chart: unique devices by year level
- Bar chart: top subjects by demand (CP1, Intro to Computing, MMW, DataComm, DSA)
- University table (school · type · region)

### 6. "What's next" — mission + subscription announcement
- Mission: "help someone like me when I was a freshman prepare before entering BSIT"
- Announcement: current one-time unlock passes (₱49/₱99/₱299) are transitioning to a **subscription model**, framed around continuous value (new reviewers every semester, progress tracking, growing subject coverage), not billing mechanics

## Disclosure rules (approved)

- **Include:** traffic & reach numbers, registered account count, waitlist count, university names
- **Exclude:** sales counts, revenue figures, conversion/funnel rates, the ₱8k revenue goal

## Data source

Query live Supabase (project `mpdymglipgzuybtxuvhy`) at build time for fresh counts: devices, events, auth accounts, waitlist, universities from `profiles`, year-level splits, subject splits. Fall back to the Jul 13 figures in `docs/gtm/user-personas-icp.md` only if live access fails, and label the as-of date either way.

## Visualization approach (approved)

Hand-built **SVG files** committed to `assets/story/`, referenced from STORY.md. Mermaid was rejected: GitHub's mermaid rendering cannot follow the brand typography or design elements.

**Brand palette (from the live site):**
| Token | Hex | Use in charts |
| --- | --- | --- |
| Ink | `#1A1A1A` | Headings, primary bars, axis text |
| Paper | `#F3F1ED` | Chart backgrounds |
| Vermilion | `#E5502E` | Single accent per chart (the standout bar/arrow) |
| Body Gray | `#6E6E6E` | Secondary text |
| Muted Gray | `#A0A0A0` | Metadata, mono labels, hairlines |

**Typography (confirmed in `app/layout.tsx`):** Fraunces (display serif), Inter Tight (body sans), JetBrains Mono (mono). SVGs use these with fallback stacks (`Fraunces, Georgia, serif`; `'JetBrains Mono', ui-monospace, Menlo, monospace`; `'Inter Tight', Inter, sans-serif`) since GitHub `<img>` SVGs cannot load webfonts.

**Design elements to carry into charts:** `§ 00 — LABEL` mono section markers, numbered index (01/02/03) beside list rows, → arrow motif (vermilion when highlighted), thin hairline dividers, generous whitespace, vermilion used once per view.

**Trade-off accepted:** numbers are baked into the SVGs; refreshing requires regenerating the files. Generation should be scripted or at least trivially repeatable.

**Process note:** read the `dataviz` skill before writing any chart code.

## Out of scope

- No changes to the app itself
- No sales/funnel/revenue disclosure
- No new photo assets (GitHub avatar only)
- STORY.md is English-language (Taglish only inside quoted student voice, if used)
