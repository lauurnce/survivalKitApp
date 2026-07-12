# 🛠 Implementation Plan — GTM Calendar AY 2026–27

**Compiled July 13, 2026 · MVP stage · web-first**
Companion to [academic-calendars-ay2026-27.md](academic-calendars-ay2026-27.md) and [user-personas-icp.md](user-personas-icp.md).

**Operating principle:** every phase must move one of three numbers — (1) teaser→click rate, (2) organic sales, (3) MRR vs. infra burn. Anything that doesn't move one of these waits.

---

## 💰 Track R — The Revenue Ledger (always-on, checked weekly)

The plan exists to make the product pay for its own development. Costs and break-even ladder:

| Item | Now | Goal | Monthly cost (₱ @ ~57/USD) |
| --- | --- | --- | --- |
| Claude subscription | Pro ($20) | **Max 5× ($100)** | ₱1,150 → **₱5,700** |
| Supabase | current plan | **Pro ($25)** | **₱1,450** |
| Vercel | Hobby (free) | Hobby until traffic forces Pro | ₱0 |
| Domain / misc | — | — | ~₱100/mo amortized |

**Break-even ladder (monthly recurring revenue targets):**

- **Tier 1 — ₱3,000/mo:** covers today's stack (Claude Pro + Supabase current + misc). *Minimum survival.*
- **Tier 2 — ₱7,500/mo:** covers the goal stack (Claude Max 5× + Supabase Pro). **This is the October target (₱8,000) — hitting it means the upgrade pays for itself.**
- **Tier 3 — ₱15,000+/mo:** Tier 2 + ₱7,500 founder stipend. Target: December finals window.
- Rule: **upgrade Claude to Max only in the month after revenue ≥ ₱7,500**, not before. The subscription must chase revenue, not lead it.

**Unit math to keep in head:** 1 block sale (₱999) ≈ 2 weeks of Tier-2 infra. 8 block sales/mo = Tier 2 covered by blocks alone. 1 all-access block (₱1,999) ≈ 1 month of Claude Max.

**Weekly Monday ritual (15 min):** query devices/day, teaser CTR, sales count, MRR vs. burn; log 4 numbers in a running note. If two consecutive weeks miss phase targets, cut scope from the current track — never add.

---

## 🧰 PHASE 0 — Jul 14 → Jul 31 · "Fix the machine while it's quiet"

### Track A — Teaser CTR: 3% → 10% (est. 2–3 days total, do first)

1. **A1 (Jul 14):** Baseline query saved as a snippet: teaser views → clicks → subscribe clicks by day, by subject. This is the scoreboard for everything in Phase 0.
2. **A2 (Jul 14–15):** Rewrite the teaser around Andrea's moment. Ship one variant, not five: state the exam job ("Ready for the CP1 midterm? 8 exam-prep modules"), show what's inside (module titles visible but locked), put the free first activity **inside** the teaser as a button, price anchored at ₱49.
3. **A3 (Jul 16):** Add `teaser_variant` to the event payload (or a second event_type) so variants are measurable. Check the events CHECK constraint before adding any new event type — it silently rejected unknown types before (see git 9f4ab58).
4. **A4 (Jul 21, weekly check):** If CTR < 6%, ship variant 2 (social proof: "2,940 students studied CP1 here"). If ≥ 6%, leave it and move on. Cap this track at 2 iterations in July — low traffic means slow signal; don't over-fit on 30 clicks.

### Track B — Block sales + Class Rep system (the Phase-0 centerpiece)

Sequence is deliberately **manual-first**: sell one block by hand before building any dashboard. UI built for zero paying classes is inventory, not product.

1. **B1 (Jul 15): Price card + Messenger CTA (half day).** A `/for-blocks` page: "Unlock a subject for your whole section — ₱999/semester (≈₱22/student)." CTA = m.me link to the official page. No checkout build; PayMongo link is generated manually per deal. Add `paywall` and pricing-page links to it ("Buying for your block? →").
2. **B2 (Jul 15): Manual grant recipe (half day).** A documented SQL/script path: given a list of device_ids OR a class code, insert subscriptions rows (mark `paymongo_link_id` prefix `block-` for reconciliation, mirroring the `owner-unlock-%` convention). Test it end-to-end on a fake class.
3. **B3 (Jul 16–17): Class join mechanism (1–2 days).** Minimum viable "class": a `classes` table (id, code, name, subject_id/year_id scope, rep_user_id, seat_cap default 50, paid_until) + `class_members` (class_id, device_id/user_id, joined_at). Student flow: enter 6-char class code → row in class_members → `isSubscribed` returns true if their class has an active grant. **This replaces per-device manual grants and is the only schema work Phase 0 requires.**
4. **B4 (Jul 20–24): Class Rep dashboard v1 (3–4 days).** One page, `/class/[code]/rep`, gated to the rep. Four blocks, nothing more:
   - **Roster:** joined students vs. seat cap ("34/50 joined"), join date; copy-invite-link button.
   - **Class progress:** per-member modules completed + class aggregate ("Your class finished 212 modules this week") from module_progress.
   - **Payment status:** plan, paid_until, renewal CTA (Messenger link, still manual).
   - **Share kit:** the class invite link + a downloadable class progress card (see Track C — reuse the same renderer).
   - Deliberately NOT in v1: rep-initiated checkout, member removal, multiple subjects per class, analytics charts. Add only after 3 paying classes.
5. **B5 (Jul 24): Member-facing touch (half day).** Badge on subject page: "Unlocked for [class name] 🎓" — social proof inside the section, and the reason a rival section's student asks their own rep to buy.
6. **B6 (Jul 25–31): First sale attempt.** Offer to the warmest channels: the 82-waitlist + 92 accounts (see Phase 1 email — a teaser line goes in early), and any known class-rep contact. **Success = 1 paying class before Aug 10.** If zero bites by Aug 15 despite the freshman wave, the price or the pitch is wrong — run 3 Messenger interviews with reps before touching code again.

### Track C — PLG share cards ("Strava for studying") (est. 3 days, Jul 27–29)

**The catalog — what's downloadable as a story-format PNG (1080×1920, 9:16) + square (1080×1080), all with logo watermark + QR/short-link:**

| # | Card | Trigger | What it shows | Why it spreads |
| --- | --- | --- | --- | --- |
| 1 | **Quiz Score Card** | After any quiz/activity | Score %, subject, module title, date, percentile vs. all takers ("Top 12% of 2,940 CP1 students") | Bragging right with a built-in challenge ("beat mo 'to?") — the GC viral loop |
| 2 | **Module Completion Card** | Module marked complete | Module title, subject, ✓ stamp, running count ("14 modules done this sem") | The Strava "activity" unit — habitual, low-stakes |
| 3 | **Streak Card** | 3/7/14/30-day streaks | Flame + day count, subjects touched | Habit loop; posts itself to stories repeatedly |
| 4 | **Exam Readiness Card** | ≥N exam-prep modules done for a subject | Gauge: "87% ready for CP1 Midterms · Oct 7" (uses the real exam date from the calendar research!) | Timely — appears exactly in exam week when everyone's anxious |
| 5 | **Semester Wrap Card** | End of sem (Dec) | Strava "Year in Sport" style: total modules, quizzes, best subject, percentile | The December mega-share; annual ritual material |
| 6 | **"I Survived" Card** | Subject's finals window passes with ≥X modules done | "Survived CP1 — AY 2026–27" collectible badge | Collectible identity; freshmen collect all 9 |
| 7 | **Class Card** (rep-only) | Weekly, from rep dashboard | "BSIT 1-A finished 212 modules this week · Top class in CP1" | Inter-section rivalry — sells blocks to *other* sections |

**Design & build steps:**
1. **C1 (Jul 27):** Card design system: brand paper/ink/vermillion, Fraunces display numbers, logo wordmark bottom-right + short-link/QR (`bsitkit.app/s/xxxx` style). One template layout, 7 content variants. (Logo is "future" — ship v1 with the text wordmark; swap the asset later, cards are generated so old shares keep the old mark, fine.)
2. **C2 (Jul 27–28):** Renderer: `@vercel/og` (satori) route — `/api/card/[type]` returns PNG. Server-side = consistent fonts, no canvas quirks, and the URL itself is shareable.
3. **C3 (Jul 28–29):** Ship cards **#1 and #2 only** for MVP (quiz score + module completion — they trigger on existing events). "Share your score" button on the quiz-result screen: Web Share API on mobile (native share sheet → IG/TikTok/FB story), download-PNG fallback on desktop. Log `share_card_click` + `share_card_download` events (check the CHECK constraint again).
4. **C4 (defer):** Cards #3–#7 ship with Phase 1/2 as their triggers become real (streaks need streak tracking; readiness needs the exam-date table; class card ships with rep dashboard B4 if time allows).
5. **Success metric:** ≥5% of quiz completions produce a share action by Aug 31; ≥3% of new devices arrive via card short-links (utm) by Sep 30.

### Track D — Freshman Survival Guide page (1 day, Jul 30)

1. Free, no-login, shareable page: "BSIT 1st Year Survival Guide" — subject-by-subject what-to-expect (CP1 gets the most ink), 3 genuinely useful tips per subject, link into each subject's free first activity. UTM-tagged share links per channel.
2. This is the orientation-season GC drop. It must load fast on mobile data and read well inside the Messenger in-app browser.

### Track E — AdDU dry run (Jul 14–18, ~2 hrs, no code)

1. AdDU classes start ~Jul 14. Post the survival-guide (once live — or the CP1 free activity meanwhile) into 2–3 Davao freshman FB groups/GCs with `utm_source=addu`.
2. This validates *messaging*, not revenue. Watch: do freshman-facing hooks outperform the generic homepage? Feed the winner into the August wave copy.

### Phase 0 exit criteria (checked Aug 1)

- [ ] Teaser CTR ≥ 6% (10% is the stretch)
- [ ] Block flow live end-to-end: code join + rep dashboard v1 + manual payment path
- [ ] Share cards #1–#2 live with share/download tracking
- [ ] Survival guide live with UTM links
- [ ] ≥1 block sale closed or 3 rep conversations in progress

---

## 🌊 PHASE 1 — Aug 1 → Sep 7 · The freshman flood

1. **P1-1 (Aug 3–5): Reactivation email** to 92 accounts + 82 waitlist: "AY 2026–27 starts this week — here's what's new" (exam-prep modules, free first activities, block deals for reps, share cards). One email, plain, from the founder. Include the auto-confirm fix for the 8 stuck-unconfirmed users first (see pending-outreach note).
2. **P1-2 (Aug 4 / Aug 10 / Sep 1): Wave-timed GC seeding.** Survival guide + free CP1 activity into freshman groups per wave: WVSU (Aug 4), UP/USTP/CTU (Aug 10–11), PUP (Sep 1 — biggest push, Manila). Each wave gets its own utm_source.
3. **P1-3 (Aug 10–17): HYPOTHESIS CHECKPOINT.** If devices/day ≥ 500 (3× July baseline) → calendar thesis confirmed, double down on Phase 2 prep. If flat → problem is discovery; pivot Phase 2 effort from content to distribution (more GC seeding, campus-page partnerships, rep referrals) before spending on anything else.
4. **P1-4 (ongoing): Block-sale pipeline.** Every new class code created = a lead. Follow up reps whose class joined ≥10 members but hasn't paid.
5. **P1-5 (Sep 1–7): PUP-specific push** — PUP is 42%-of-traffic CP1 territory and enrolls latest; their freshmen arrive after everyone else's hype. Fresh content drop timed here reads as "made for you."

**Phase 1 targets:** 10,000 new devices Aug–Sep · ≥200 registered profiles · ≥1 paying block · share-action rate ≥5%.

---

## ⚔️ PHASE 2 — Sep 28 → Oct 25 · Midterm gauntlet (first real revenue)

1. **P2-1 (by Sep 20):** Exam-date table in the app (from the calendar research; per school where known). Powers the Exam Readiness card (#4) and timed banners: "USTP midterms Oct 5–10 — 6 days left."
2. **P2-2:** Push sequence, one per school window: Silliman Sep 1–5 (early, small) → WVSU ~Sep 28 → **USTP Oct 5–10** → UP Oct 7 → PUP ~Oct 19–24. Each = banner + GC-seeded "readiness check" quiz whose result card (#1) is shareable.
3. **P2-3:** CP1 exam-prep is the spearhead SKU at ₱49; block deal is the upsell in every push ("your whole section, ₱999").
4. **P2-4 (Oct 31): Revenue review** against ₱8,000/Tier-2. If hit → upgrade Claude Pro → Max 5× in November per Track R rule; Supabase Pro when nearing free-tier limits or when revenue covers it, whichever first.

**Phase 2 targets:** ₱8,000 October revenue · ≥10 organic sales · ≥3 paying blocks.

---

## 🎓 PHASE 3 — Dec 9 → 19 · Finals mega-window

Set targets after October actuals. Prepared in advance:
1. Full-semester review bundles per subject ("everything you need for finals" repackaging — content exists, packaging is new).
2. Semester Wrap card (#5) ships Dec 1; "I Survived" cards (#6) unlock as each school's finals window closes.
3. If October hit Tier 2, December's target is **Tier 3 (₱15k+): infra + founder stipend.**

---

## 📱 FUTURE TRACK — MVP → App Store / Play Store (stage-gated, no dates until gates pass)

We are at MVP. Native apps are **earned by metrics, not scheduled**. Building store apps before validation burns the exact months when the web funnel needs iteration speed.

- **Gate 1 — Validation (now → Oct 31).** The web MVP must prove: ≥10 organic sales/mo, ≥3 paying blocks, ≥200 profiles, and a repeatable exam-week revenue spike. *Until then, zero native work.* The web app IS the validation instrument — it deploys in minutes, not app-review days.
- **Gate 2 — PWA (Nov–Dec, if Gate 1 passes).** Ship manifest + service worker + offline caching of purchased modules ("study on commute data-free" — real value for jeepney-commute users). Installable from the browser with zero store fees or review. Measure add-to-home-screen rate and D7 retention of installed users. This tests "do they want an app?" for ~1 week of work instead of ~2 months.
- **Gate 3 — Store apps (Q1 2027, if PWA installs ≥15% of active users AND MRR ≥ ₱25k for 2 consecutive months).** Path: Capacitor wrap of the existing Next.js app (fastest, one codebase) over a React Native rewrite. Costs: Google Play $25 one-time, Apple $99/yr, plus review compliance (privacy policy, account deletion flow).
  **⚠️ The store-economics trap:** digital content sold in-app on iOS must use Apple IAP (15–30% cut) — PayMongo/GCash checkout inside the app violates review rules. Mitigation: reader-app pattern — purchases stay on the website, apps consume already-purchased content (Netflix/Spotify model). Decide this *before* submission, not after rejection.
- **Why the gates protect revenue (Track R):** every month of premature native development is a month of Claude Max + founder time producing zero sales. The gates make the app a *reward* the revenue unlocks.

---

## 📊 The four numbers (weekly, every Monday)

| # | Metric | Phase 0 target | Phase 1 | Phase 2 |
| --- | --- | --- | --- | --- |
| 1 | Devices/day (7-day avg) | ~160 (hold) | ≥500 in wave weeks | ≥400 sustained |
| 2 | Teaser CTR | ≥6% | ≥8% | ≥10% |
| 3 | Organic sales (month) | 1+ | 3+ | 10+ / ₱8,000 |
| 4 | MRR vs burn | burn ₱2,700 | burn ₱2,700 | **revenue ≥ Tier 2 → upgrade stack** |
