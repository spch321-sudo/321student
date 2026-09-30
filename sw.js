var V = 'st321-1.0.1';
var FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './lessons.json'];
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(FILES); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V && k.indexOf('st321-') === 0; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var u = new URL(req.url);
  if (u.origin !== location.origin) return;
  if (req.mode === 'navigate' || /index\.html$|\/$/.test(u.pathname)) {
    e.respondWith(fetch(req, { cache: 'no-store' }).then(function (r) {
      var c = r.clone(); caches.open(V).then(function (ca) { ca.put('./index.html', c); }); return r;
    }).catch(function () { return caches.match('./index.html'); }));
    return;
  }
  if (/lessons\.json$/.test(u.pathname)) {
    e.respondWith(fetch(req).then(function (r) { var c = r.clone(); caches.open(V).then(function (ca) { ca.put('./lessons.json', c); }); return r; }).catch(function () { return caches.match('./lessons.json'); }));
    return;
  }
  e.respondWith(caches.match(req).then(function (r) { return r || fetch(req); }));
});
