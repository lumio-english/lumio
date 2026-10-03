// Lumio English — minimal service worker.
// Purpose: make the site installable as an app from Chrome ("Install app" /
// "Add to Home screen" opens it full-screen with the Lumio icon). It does NOT
// cache pages: every request goes straight to the network, so students and
// teachers always see the latest version. Only the app shell icons are
// cached for the splash screen. Bump CACHE when the icons change.
const CACHE = "lumio-shell-v1";
const SHELL = ["assets/logo/favicon-192.png", "assets/logo/favicon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request).then(r => r || Response.error())));
});
