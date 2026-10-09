/**
 * Service worker of the Skriptorium (step 5.21, ADR-048). It keeps exactly one file on the
 * device: a static notice for opening the app without a connection. Pages always come from the
 * network; only when that fails does the notice appear. Nothing else is touched – no interface
 * files, no answers of the interface, no texts.
 */
// Count up with every change of offline.html, so devices fetch the new page; the fingerprint
// below ties the two together (checked by serviceWorker.test.ts).
// offline.html: sha256 82486755e65b
const CACHE = "skriptorium-offline-1";
const OFFLINE = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(new Request(OFFLINE, { cache: "reload" })))
      .then(() => self.skipWaiting()),
  );
});

// Remove the stores of earlier versions, then serve open pages at once.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") {
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(OFFLINE).then((notice) => notice ?? Response.error()),
    ),
  );
});
