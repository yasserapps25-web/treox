// Pages : réseau d'abord (toujours la dernière version), cache en secours hors connexion.
// Images : cache d'abord.
const CACHE = 'treox-catalogue-v5';
const CORE = ['./', './index.html', './manifest.webmanifest', './img/treox-logo-blanc.svg', './img/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  const save = res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
  if (isPage) {
    e.respondWith(fetch(req).then(save).catch(() => caches.match(req).then(r => r || caches.match('./'))));
  } else {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(save)));
  }
});
