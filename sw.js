/* 鐘尗涓村簥搴旂敤鍦烘櫙閫夊搧 路 Service Worker */
const CACHE = 'hld-vet-app-v6';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.url.includes('/chat/completions') || req.url.includes('api.deepseek') || req.url.includes('api.openai')) {
    return;
  }
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html') || req.url.endsWith('/');
  // 椤甸潰 HTML锛氱綉缁滀紭鍏堬紝淇濊瘉浜у搧搴撴洿鏂拌兘绔嬪埢鐢熸晥
  if (isHTML) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }
  // 鍏跺畠闈欐€佽祫婧愶細缂撳瓨浼樺厛锛屽悗鍙版洿鏂?
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
          }
          return res;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});


