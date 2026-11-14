// Offline-Speicher für die Web-App (iPad).
// Speichert NUR die Programmdateien. Schülerdaten liegen im Gerätespeicher und werden nie übertragen.
// Bei einer neuen Version des Tools: Zahl in CACHE erhöhen (z. B. ranking-v2), dann lädt das iPad sie beim nächsten Start.
const CACHE = "ranking-v9";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png", "./emg_logo.gif"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Erst aus dem Offline-Speicher antworten (schnell, ohne Internet), im Hintergrund nach Updates schauen.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});





