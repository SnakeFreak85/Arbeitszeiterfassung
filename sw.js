const CACHE='zeitwerk-v18';
const FILES=['./','./index.html','./style.css','./app.js?v=18','./domain.js?v=18','./export.js?v=18','./domain.js','./clock.js?v=18','./qr.js?v=18','./vendor/jsQR.js','./vendor/qrcode.js','./i18n.js','./manifest.webmanifest','./icon.svg','./cloud.js?v=18','./firebase-config.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r}).catch(()=>caches.match(e.request)))});
