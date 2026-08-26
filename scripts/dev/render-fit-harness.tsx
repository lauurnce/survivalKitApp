import { renderToStaticMarkup } from "react-dom/server";
import { HeroCard } from "@/components/dashboard/HeroCard";
import { RoadmapTimeline } from "@/components/dashboard/RoadmapTimeline";
import { SemesterSections } from "@/components/dashboard/SemesterSections";
import { ThisWeekPanel } from "@/components/dashboard/ThisWeekPanel";
import type { SubjectSummary } from "@/lib/account";
import type { Profile } from "@/lib/profile";
import { viewportConfig } from "@/lib/viewport";
import { readdirSync, copyFileSync, mkdirSync } from "fs";

const fontPreconnect = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Inter+Tight:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=JetBrains+Mono:ital,wght@0,400;0,500;1,400;1,500&display=swap" media="print" onload="this.media='all'">
`;

function copyBuiltCSS(outDir: string) {
  try {
    const chunksDir = ".next/static/chunks";
    const files = readdirSync(chunksDir);
    const cssFiles = files.filter(f => f.endsWith(".css"));
    if (cssFiles.length > 0) {
      const src = `${chunksDir}/${cssFiles[0]}`;
      const dest = `${outDir}/harness.css`;
      copyFileSync(src, dest);
      console.log(`Copied built CSS from ${src} to ${dest}`);
    } else {
      console.warn("No built CSS found - run 'npm run build' first");
    }
  } catch (e) {
    console.warn("Could not copy built CSS:", e);
  }
}

function generateMockData() {
  const mockSubjects: SubjectSummary[] = [
    { id: "sub-1", title: "Computer Programming 1", yearId: "yr-1", unlocked: true, doneCount: 3, totalCount: 15, semester: 1, kind: "major", modules: [] },
    { id: "sub-2", title: "Introduction to Computing", yearId: "yr-1", unlocked: true, doneCount: 1, totalCount: 12, semester: 1, kind: "major", modules: [] },
    { id: "sub-3", title: "Mathematics in the Modern World", yearId: "yr-1", unlocked: true, doneCount: 0, totalCount: 18, semester: 1, kind: "minor", modules: [] },
    { id: "sub-4", title: "Accounting Principles", yearId: "yr-1", unlocked: true, doneCount: 5, totalCount: 14, semester: 2, kind: "major", modules: [] },
    { id: "sub-5", title: "Data Structures", yearId: "yr-2", unlocked: true, doneCount: 0, totalCount: 20, semester: 1, kind: "major", modules: [] },
    { id: "sub-6", title: "Database Systems", yearId: "yr-2", unlocked: false, doneCount: 0, totalCount: 16, semester: 1, kind: "major", modules: [] },
    { id: "sub-7", title: "Web Development", yearId: "yr-3", unlocked: false, doneCount: 0, totalCount: 18, semester: 2, kind: "major", modules: [] },
    { id: "sub-8", title: "Software Engineering", yearId: "yr-4", unlocked: false, doneCount: 0, totalCount: 22, semester: 1, kind: "major", modules: [] },
  ];

  const years = [
    { yearId: "yr-1", label: "Year 1", sortOrder: 1, subjects: mockSubjects.filter(s => s.yearId === "yr-1") },
    { yearId: "yr-2", label: "Year 2", sortOrder: 2, subjects: mockSubjects.filter(s => s.yearId === "yr-2") },
    { yearId: "yr-3", label: "Year 3", sortOrder: 3, subjects: mockSubjects.filter(s => s.yearId === "yr-3") },
    { yearId: "yr-4", label: "Year 4", sortOrder: 4, subjects: mockSubjects.filter(s => s.yearId === "yr-4") },
  ];

  const { groupByTerm, deriveCurrentTerm, pickRecommended, roadmapNodes, continueHref } = require("@/lib/dashboard");

  const terms = groupByTerm(years);
  const current = deriveCurrentTerm(terms);
  const recs = pickRecommended(current, 3);
  const nodes = roadmapNodes(terms, current);
  const currentKey = current ? `${current.yearId}-${current.semester}` : null;
  const feedbackHref = recs[0] ? `${continueHref(recs[0])}?feedback=1` : "/year";

  return { terms, current, recs, nodes, currentKey, feedbackHref };
}

function navRailMobileMarkup(): string {
  return `
  <nav aria-label="Primary" class="relative flex items-center gap-1 overflow-x-auto border-b border-taupe/30 bg-paper lg:sticky lg:top-0 lg:min-h-screen lg:w-60 lg:shrink-0 lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-visible lg:border-b-0 lg:border-r">
    <ul class="flex shrink-0 items-stretch gap-1 px-2 py-2 lg:flex-col lg:gap-1 lg:px-3 lg:py-5">
      <li class="shrink-0">
        <a href="/account" aria-current="page" class="flex min-h-11 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent bg-accent/10 text-accent">
          <svg class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 9.5L10 3l7 6.5M4.5 8.5V17h11V8.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 17v-5h4v5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Dashboard
        </a>
      </li>
      <li class="shrink-0">
        <a href="/year" class="flex min-h-11 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent text-ink-muted hover:text-ink">
          <svg class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 4.5c1.5-.7 3.5-.7 6 0v11c-2.5-.7-4.5-.7-6 0v-11z" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 4.5c-1.5-.7-3.5-.7-6 0v11c2.5-.7 4.5-.7 6 0v-11z" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Subjects
        </a>
      </li>
      <li class="shrink-0">
        <a href="/account#roadmap" class="flex min-h-11 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent text-ink-muted hover:text-ink">
          <svg class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 4L3 5.5v11L7 15m0-11l6 2m-6-2v11m6-9l4-1.5v11L13 15m0-11v11m0-11l-6 2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Roadmap
        </a>
      </li>
      <li class="shrink-0">
        <a href="/resources" class="flex min-h-11 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent text-ink-muted hover:text-ink">
          <svg class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 5.5c0-.55.45-1 1-1h3.5l1.5 2H16c.55 0 1 .45 1 1v7c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1v-9z" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Resources
        </a>
      </li>
      <li class="shrink-0">
        <a href="/account/profile" class="flex min-h-11 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent text-ink-muted hover:text-ink">
          <svg class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10" cy="6.5" r="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 17c1-3.5 3.8-5.5 6.5-5.5s5.5 2 6.5 5.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Profile
        </a>
      </li>
    </ul>
  </nav>
  `;
}

function themeToggleInlineMarkup(): string {
  return `<button type="button" class="w-8 h-8 flex items-center justify-center border border-ink-faint/30 bg-paper text-ink hover:bg-ink hover:text-paper transition-colors duration-150" aria-label="Toggle dark mode"><svg class="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="M10 4v2M10 14v2M4 10h2M14 10h2M5.5 5.5l1.4 1.4M13.1 13.1l1.4 1.4M5.5 14.5l1.4-1.4M13.1 6.9l1.4-1.4" stroke-linecap="round"/></svg></button>`;
}

function logoutMarkup(): string {
  return `<form action="/account" method="POST"><button class="text-xs text-ink-muted underline">Log out</button></form>`;
}

function paymentSuccessBannerMarkup(): string {
  return `<div role="status" aria-live="polite" class="flex items-center gap-3 border border-amber-300/60 bg-amber-50 px-4 py-2.5"><svg class="h-4 w-4 shrink-0 text-amber-600" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 10l4 4 8-8" stroke-linecap="round" stroke-linejoin="round"/></svg><div><p class="font-sans text-sm text-ink">Payment successful</p><p class="font-sans text-xs text-ink-muted">Your purchase is now active on this account.</p></div></div>`;
}

function discountCodesEmptyState(feedbackHref: string): string {
  return `
  <div class="text-ink-muted">
    No discount codes yet.&nbsp;
    <a href="${feedbackHref}" class="text-accent underline underline-offset-2 hover:text-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">Submit quality feedback</a>&nbsp;to earn discount codes — up to ₱100 off!
  </div>
  `;
}

function discountCodesLoadedState(): string {
  return `
  <section class="space-y-4">
    <h3 className="text-lg font-semibold">My Discount Codes</h3>
    <div class="space-y-2">
      <div class="border rounded-lg p-4 bg-green-50 border-green-200">
        <div class="flex justify-between items-start mb-2">
          <div class="font-mono font-bold text-lg">BSIT-SAVE-100</div>
          <span class="text-xs px-2 py-1 rounded bg-green-200 text-green-800">30 days left</span>
        </div>
        <p class="text-sm text-gray-600 mb-3">Up to ₱100 off — covers a single-subject unlock in full, or ₱100 off the all-subjects semester pass</p>
        <button class="w-full py-2 rounded text-sm font-medium bg-green-600 text-white">Copy Code</button>
      </div>
      <div class="border rounded-lg p-4 bg-gray-100 border-gray-300">
        <div class="flex justify-between items-start mb-2">
          <div class="font-mono font-bold text-lg">GRAD-GIFT-50</div>
          <span class="text-xs px-2 py-1 rounded bg-gray-200 text-gray-800">Expired</span>
        </div>
        <p class="text-sm text-gray-600 mb-3">Up to ₱100 off — covers a single-subject unlock in full, or ₱100 off the all-subjects semester pass</p>
        <button class="w-full py-2 rounded text-sm font-medium bg-gray-300 text-gray-600 cursor-not-allowed" disabled>Expired</button>
      </div>
    </div>
  </section>
  `;
}

function footerMarkup(): string {
  return `
  <footer class="border-t border-ink-faint/20 px-6 py-4 md:px-16">
    <div class="max-w-wide mx-auto flex flex-wrap items-center justify-between gap-2">
      <p class="font-sans text-[11px] text-ink-faint leading-relaxed">Study guide — original explanations. Content covers standard curriculum topics.</p>
      <a href="/privacy" class="font-sans text-[11px] text-ink-faint hover:text-ink-muted transition-colors">Privacy Policy</a>
    </div>
  </footer>
  `;
}

function buildPage(): string {
  const { terms, current, recs, nodes, currentKey, feedbackHref } = generateMockData();
  const profile: Profile = { firstName: "Lawrence", lastName: "Panes", age: 21, gender: null, university: "Test University", schoolType: "Public", major: "BSIT", pathways: [] };

  const heroHtml = renderToStaticMarkup(<HeroCard term={current} topPick={recs[0]} profile={profile} pro={true} />);
  const roadmapHtml = renderToStaticMarkup(<RoadmapTimeline nodes={nodes} />);
  const semesterHtml = renderToStaticMarkup(<SemesterSections terms={terms} currentKey={currentKey} />);
  const thisWeekHtml = renderToStaticMarkup(<ThisWeekPanel recs={recs} />);

  const viewportContent = `${viewportConfig.width}, initial-scale=${viewportConfig.initialScale}, minimum-scale=${viewportConfig.minimumScale}, viewport-fit=${viewportConfig.viewportFit}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="${viewportContent}">
  <title>BSIT Survival Kit — Dashboard Fit Harness</title>
  ${fontPreconnect}
  <link rel="stylesheet" href="./harness.css">
  <style>
    html { background-color: rgb(247, 245, 243); color: rgb(26, 31, 35); -webkit-font-smoothing: antialiased; }
    body { min-height: 100vh; display: flex; flex-direction: column; margin: 0; font-family: 'Inter Tight', system-ui, sans-serif; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
  </style>
</head>
<body>
  <a href="#content" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:bg-navy focus:text-paper focus:px-4 focus:py-2 font-sans text-sm">Skip to content</a>
  <div id="content" class="flex-1">
    <div class="min-h-screen bg-paper lg:flex">
      ${navRailMobileMarkup()}
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-end gap-3 px-4 sm:px-8 py-3 border-b border-taupe/30">
          ${themeToggleInlineMarkup()}
          ${logoutMarkup()}
        </div>
        <main class="px-4 sm:px-8 py-6 mx-auto max-w-[90rem] space-y-8">
          ${paymentSuccessBannerMarkup()}
          ${heroHtml}
          <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div class="space-y-8 min-w-0">
              ${roadmapHtml}
              ${semesterHtml}
            </div>
            ${thisWeekHtml}
          </div>
          <section class="border-t border-taupe/20 pt-6">
            ${discountCodesEmptyState(feedbackHref)}
            ${discountCodesLoadedState()}
          </section>
        </main>
      </div>
    </div>
  </div>
  ${footerMarkup()}
</body>
</html>`;
}

const html = buildPage();
  const outPath = "/tmp/opencode/fitharness/index.html";
  const outDir = "/tmp/opencode/fitharness";
  const fs = require("fs");
  mkdirSync(outDir, { recursive: true });
  copyBuiltCSS(outDir);
  fs.writeFileSync(outPath, html);
  console.log(`Harness written to ${outPath}`);
  console.log(`Open file://${outPath} in a browser or run check-mobile-fit.mjs`);