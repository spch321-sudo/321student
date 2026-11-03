/* 321student  Service Worker —— 自動更新版（321 系共用）
   ‧ 每次發佈 VER 都不同 → 瀏覽器偵測到 sw.js 位元組改變就安裝新 SW（註冊時 updateViaCache:'none'）
   ‧ install：skipWaiting；預載用 cache:'reload' 繞過 HTTP 快取（GitHub Pages 會快取 10 分鐘）
   ‧ activate：只清自己前綴（PFX）的舊快取——同一個 github.io 網域的各 App 共用 Cache Storage，不能刪別人的；
     clients.claim 後通知所有頁面（頁面自己判斷空閒才重整）
   ‧ fetch：HTML／JS／JSON／CSS 網路優先（no-cache），離線才用快取；圖片等快取優先；影音與 Range 請求不攔截 */
var PFX = 'st321-';
var VER = '1.0.3-vp1023-gx1103-co1-xz1103-au1103';
var V = PFX + VER;
var SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png", "./lessons.json", "./coread.js", "./peerjs.min.js", "./xz2.js"];
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(V).then(function (c) {
    return Promise.all(SHELL.map(function (u) {
      return fetch(new Request(u, { cache: 'reload' })).then(function (r) { if (r && r.ok) return c.put(u, r); })['catch'](function () { });
    }));
  }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf(PFX) === 0 && k !== V; }).map(function (k) { return caches['delete'](k); }));
  }).then(function () { return self.clients.claim(); }).then(function () {
    return self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  }).then(function (cs) {
    cs.forEach(function (c) { try { if (c.url.indexOf(self.registration.scope) === 0) c.postMessage({ t: 'sw-updated', v: VER }); } catch (x) { } });
  }));
});
self.addEventListener('message', function (e) { if (e.data === 'skip' || e.data === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return;
  var u = new URL(r.url); if (u.origin !== self.location.origin) return;
  var p = u.pathname;
  if (/\.(mp3|m4a|aac|wav|ogg|opus|mp4|mov|webm)$/i.test(p) || r.headers.get('range')) return;
  if (/version\.json$/.test(p)) {
    e.respondWith(fetch(p + '?t=' + Date.now(), { cache: 'no-store' })['catch'](function () { return new Response('{}', { headers: { 'Content-Type': 'application/json' } }); }));
    return;
  }
  var nav = r.mode === 'navigate' || /\.html$/.test(p) || /\/$/.test(p);
  var key = u.origin + p + (/\/$/.test(p) ? 'index.html' : '');
  if (nav || /\.(json|js|css)$/.test(p)) {
    e.respondWith(fetch(r.url, { cache: 'no-cache', credentials: 'same-origin' }).then(function (resp) {
      if (resp && resp.ok) { var cp = resp.clone(); caches.open(V).then(function (c) { c.put(key, cp); }); }
      return resp;
    })['catch'](function () {
      return caches.match(key).then(function (h) {
        return h || caches.match(r, { ignoreSearch: true }).then(function (h2) { return h2 || (nav ? caches.match(u.origin + p.replace(/[^\/]*$/, '') + 'index.html') : undefined); });
      });
    }));
    return;
  }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(function (h) {
    return h || fetch(r).then(function (resp) { if (resp && resp.ok) { var cp = resp.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); } return resp; });
  }));
});
