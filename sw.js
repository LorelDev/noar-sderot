/* נוער שדרות · Service Worker — התקנה כאפליקציה + עבודה ברשת חלשה */
const CACHE = 'noar-v7';
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=7',
  './app.js?v=7',
  './store.js?v=7',
  './firebase-config.js?v=7',
  './manifest.json',
  './icon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* רשת קודם, נפילה לקאש — עדכונים מגיעים מיד והאפליקציה שורדת אופליין */
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return res;
      })
      .catch(() =>
        caches.match(e.request).then((m) => m || caches.match('./index.html'))
      )
  );
});
