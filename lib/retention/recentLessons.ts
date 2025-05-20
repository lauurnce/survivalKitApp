// "Pick up where you left off" for readers without an account.
//
// Most readers arrive on one lesson from a group-chat link, read it, and
// never come back: in the 60 days to 2026-10-30, 84% of devices were seen on
// a single day. The ones who do come back usually land on / or /year, which
// knew nothing about what they had read. Accounts are optional, so this is
// kept on the device, in localStorage, and never sent anywhere.
//
// The reader page already writes `bsit_last_module` (components/
// LastModuleTracker.tsx) for the home page's old "Continue reading" card.
// That single entry is read as a fallback, so devices that visited before
// this shipped still get their lesson back.

export const RECENT_LESSONS_KEY = "bsit_recent_lessons";
export const LEGACY_LAST_MODULE_KEY = "bsit_last_module";
export const MAX_RECENT_LESSONS = 6;

const SITE_SUFFIX = / — BSIT Survival Kit$/;

export interface RecentLesson {
  yearId: string;
  subjectId: string;
  moduleId: string;
  moduleTitle: string;
  subjectTitle: string;
  /** Epoch ms of the latest visit. */
  visitedAt: number;
}

export interface LessonRoute {
  yearId: string;
  subjectId: string;
  moduleId: string;
}

const LESSON_PATH = /^\/year\/([^/]+)\/subjects\/([^/]+)\/modules\/([^/]+)\/?$/;

/** The ids in a lesson URL, or null for any other page. */
export function parseLessonPath(pathname: string): LessonRoute | null {
  const m = LESSON_PATH.exec(pathname);
  if (!m) return null;
  const [, yearId, subjectId, moduleId] = m.map((part) => decodeURIComponent(part));
  return { yearId, subjectId, moduleId };
}

export function lessonHref(l: LessonRoute): string {
  return `/year/${l.yearId}/subjects/${l.subjectId}/modules/${l.moduleId}`;
}

/**
 * Module and subject titles from the reader's <title>, which its
 * generateMetadata renders as "Module · Subject — BSIT Survival Kit".
 */
export function titlesFromDocumentTitle(title: string): { moduleTitle: string; subjectTitle: string } | null {
  const bare = title.replace(SITE_SUFFIX, "").trim();
  if (!bare || bare === "BSIT Survival Kit") return null;
  const cut = bare.lastIndexOf(" · ");
  if (cut <= 0) return { moduleTitle: bare, subjectTitle: "" };
  return { moduleTitle: bare.slice(0, cut).trim(), subjectTitle: bare.slice(cut + 3).trim() };
}

function isString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0 && v.length <= 300;
}

function sanitize(raw: unknown): RecentLesson | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!isString(r.yearId) || !isString(r.subjectId) || !isString(r.moduleId) || !isString(r.moduleTitle)) return null;
  return {
    yearId: r.yearId,
    subjectId: r.subjectId,
    moduleId: r.moduleId,
    moduleTitle: r.moduleTitle,
    subjectTitle: typeof r.subjectTitle === "string" ? r.subjectTitle.slice(0, 300) : "",
    visitedAt: typeof r.visitedAt === "number" && Number.isFinite(r.visitedAt) ? r.visitedAt : 0,
  };
}

/** Parse stored JSON defensively: anything malformed is dropped, never thrown. */
export function parseRecentLessons(json: string | null): RecentLesson[] {
  if (!json) return [];
  try {
    const data: unknown = JSON.parse(json);
    if (!Array.isArray(data)) return [];
    return data.map(sanitize).filter((l): l is RecentLesson => l !== null).slice(0, MAX_RECENT_LESSONS);
  } catch {
    return [];
  }
}

/** Most recent first, one entry per module, capped. */
export function addRecentLesson(list: RecentLesson[], lesson: RecentLesson): RecentLesson[] {
  return [lesson, ...list.filter((l) => l.moduleId !== lesson.moduleId)].slice(0, MAX_RECENT_LESSONS);
}

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function readRecentLessons(): RecentLesson[] {
  const store = storage();
  if (!store) return [];
  try {
    const list = parseRecentLessons(store.getItem(RECENT_LESSONS_KEY));
    if (list.length > 0) return list;
    const legacy = sanitize(JSON.parse(store.getItem(LEGACY_LAST_MODULE_KEY) ?? "null"));
    return legacy ? [legacy] : [];
  } catch {
    return [];
  }
}

export function recordRecentLesson(lesson: RecentLesson): void {
  const store = storage();
  if (!store) return;
  try {
    const next = addRecentLesson(parseRecentLessons(store.getItem(RECENT_LESSONS_KEY)), lesson);
    store.setItem(RECENT_LESSONS_KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked (private mode): the feature just stays off.
  }
}

/** "today", "yesterday", "3 days ago", "2 weeks ago". */
export function visitedAgo(visitedAt: number, now: number): string {
  if (!visitedAt) return "";
  const day = 24 * 60 * 60 * 1000;
  const startOf = (t: number) => {
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const days = Math.round((startOf(now) - startOf(visitedAt)) / day);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
}
