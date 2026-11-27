// Comcord — service worker
// Aumentar a versão (comcord-v2, v3…) quando for preciso forçar a limpeza de cache nos telemóveis.
const CACHE = 'comcord-v1';
const FILES = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// Dados do Supabase: sempre da rede (nunca em cache).
// Ficheiros da app: rede primeiro (para receber logo as atualizações), cache se estiver sem rede.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
