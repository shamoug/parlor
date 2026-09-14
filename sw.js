/* The Parlor · service worker
 * Network-first for pages (always fresh when online), cache fallback offline.
 * Bump VERSION when publishing changes to static files. */
const VERSION = "parlor-v2";
const CORE = [
  "./", "index.html", "manifest.webmanifest", "assets/icon.svg", "styles/parlor.css",
  "src/logic.js", "data/words.js", "src/core.js", "src/sayit.js", "src/shell.js",
  "src/games/wordlock.js", "src/games/garden.js", "src/games/detective.js", "src/games/pairup.js",
  "src/games/beats.js", "src/games/finishline.js", "src/games/hundred.js", "src/games/sailing.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !isFont) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && (res.ok || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match("index.html")))
  );
});
