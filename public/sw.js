/* BSIT Survival Kit service worker.
 *
 * Keeps the lessons a student has opened readable with no signal: on a
 * jeepney, in a dead-zone classroom, or when prepaid data runs out the week
 * before finals. Registered by components/retention/ServiceWorkerRegister.tsx.
 *
 * What it does, and nothing more:
 * - Page navigations to public reading pages (/, /year/..., /search, /faq,
 *   /resources) are NETWORK-FIRST. Online, the student always gets the live
 *   page; a copy of each successful page is kept (newest PAGE_LIMIT). Offline,
 *   the saved copy is served, or a list of the saved lessons.
 * - /_next/static/* (content-hashed, immutable) is cache-first, so a saved
 *   page still has its scripts and styles offline.
 * - Everything else (API calls, sign-in, account, admin, unlock, RSC
 *   payloads, other origins, non-GET) is never touched.
 *
 * Those public pages are prerendered and identical for every visitor (the
 * signed-in bits resolve client-side), so a saved copy holds no personal data.
 *
 * Kill switch: replace this file with one that calls
 * self.registration.unregister() and deletes its caches, and deploy.
 */

var VERSION = "v1";
var PAGE_CACHE = "bsit-pages-" + VERSION;
var STATIC_CACHE = "bsit-static-" + VERSION;
var PAGE_LIMIT = 40;
var STATIC_LIMIT = 300;
var SITE_SUFFIX = / — BSIT Survival Kit$/;

var PAGE_PATHS = [/^\/$/, /^\/year(\/.*)?$/, /^\/search$/, /^\/faq$/, /^\/resources$/, /^\/for-blocks$/];
var LESSON_PATH = /^\/year\/[^/]+\/subjects\/[^/]+\/modules\/[^/]+\/?$/;

/** "page" | "static" | null (leave the request alone). */
function classify(request, origin) {
  if (request.method !== "GET") return null;
  var url = new URL(request.url);
  if (url.origin !== origin) return null;
  if (url.pathname.indexOf("/_next/static/") === 0) return "static";
  if (request.mode !== "navigate") return null;
  if (url.searchParams.has("_rsc")) return null;
  for (var i = 0; i < PAGE_PATHS.length; i++) {
    if (PAGE_PATHS[i].test(url.pathname)) return "page";
  }
  return null;
}

/** Cache key for a page: path only, so ?utm_… links share one copy. */
function pageKey(url) {
  var u = new URL(url);
  return u.origin + u.pathname;
}

function cacheable(response) {
  return !!response && response.status === 200 && response.type === "basic" && !response.redirected;
}

/** Drop the oldest entries beyond `limit` (Cache keys are insertion-ordered). */
function trimCache(cache, limit) {
  return cache.keys().then(function (keys) {
    var extra = keys.length - limit;
    if (extra <= 0) return;
    return Promise.all(keys.slice(0, extra).map(function (k) { return cache.delete(k); }));
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function titleOf(html) {
  var m = /<title>([^<]*)<\/title>/.exec(html);
  if (!m) return "";
  return m[1]
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
    .replace(SITE_SUFFIX, "").trim();
}

/** The "you're offline" page: links to every saved lesson, newest first. */
function offlinePage(lessons) {
  var items = lessons.length
    ? "<ul>" + lessons.map(function (l) {
        return '<li><a href="' + escapeHtml(l.path) + '">' + escapeHtml(l.title || l.path) + "</a></li>";
      }).join("") + "</ul>"
    : "<p>No lessons are saved on this phone yet. Lessons you open while online are kept here for next time.</p>";
  return (
    '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    "<title>Offline — BSIT Survival Kit</title><style>" +
    "body{margin:0;padding:32px 16px;font:16px/1.5 system-ui,sans-serif;background:#F7F5F3;color:#1A1A1A}" +
    "main{max-width:640px;margin:0 auto}h1{font-size:28px;margin:0 0 8px}" +
    "p{color:#555}ul{padding:0;list-style:none}li{border-top:1px solid #ccc}" +
    "a{display:block;padding:14px 0;color:#1A1A1A;text-decoration:none;overflow-wrap:anywhere}" +
    "a:after{content:' →';color:#E0492B}" +
    "@media (prefers-color-scheme:dark){body{background:#141414;color:#F7F5F3}a{color:#F7F5F3}p{color:#aaa}li{border-color:#444}}" +
    "</style></head><body><main><h1>You're offline</h1>" +
    "<p>These lessons are saved on this phone and open without data:</p>" +
    items +
    "</main></body></html>"
  );
}

function savedLessons(cache) {
  return cache.keys().then(function (keys) {
    var lessonKeys = keys.filter(function (k) { return LESSON_PATH.test(new URL(k.url).pathname); }).reverse();
    return Promise.all(lessonKeys.map(function (k) {
      return cache.match(k).then(function (res) { return res ? res.text() : ""; }).then(function (html) {
        return { path: new URL(k.url).pathname, title: titleOf(html) };
      });
    }));
  });
}

function handlePage(request) {
  var key = pageKey(request.url);
  return fetch(request).then(function (response) {
    if (cacheable(response)) {
      var copy = response.clone();
      caches.open(PAGE_CACHE).then(function (cache) {
        // Re-insert so the key order tracks recency for trimCache.
        return cache.delete(key).then(function () { return cache.put(key, copy); })
          .then(function () { return trimCache(cache, PAGE_LIMIT); });
      });
    }
    return response;
  }).catch(function () {
    return caches.open(PAGE_CACHE).then(function (cache) {
      return cache.match(key).then(function (hit) {
        if (hit) return hit;
        return savedLessons(cache).then(function (lessons) {
          return new Response(offlinePage(lessons), {
            status: 503,
            headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
          });
        });
      });
    });
  });
}

function handleStatic(request) {
  return caches.open(STATIC_CACHE).then(function (cache) {
    return cache.match(request).then(function (hit) {
      if (hit) return hit;
      return fetch(request).then(function (response) {
        if (cacheable(response)) {
          cache.put(request, response.clone()).then(function () { return trimCache(cache, STATIC_LIMIT); });
        }
        return response;
      });
    });
  });
}

self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.filter(function (n) {
        return n.indexOf("bsit-") === 0 && n !== PAGE_CACHE && n !== STATIC_CACHE;
      }).map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  var kind = classify(event.request, self.location.origin);
  if (kind === "page") event.respondWith(handlePage(event.request));
  else if (kind === "static") event.respondWith(handleStatic(event.request));
});
