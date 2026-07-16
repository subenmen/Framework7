// KUBEY Astroloji Service Worker - v5.4.0
const CACHE_NAME = 'astro-v5.4.0';

const PRECACHE = [
    './astrology.html',
    './astrology.css?v=5.4.0',
    './astrology.js?v=5.4.0',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Ağ öncelikli: online iken hep taze içerik, offline iken cache
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    const url = new URL(e.request.url);
    // OpenAI vb. API çağrılarına karışma
    if (url.origin !== self.location.origin && !url.hostname.includes('fonts.g')) return;

    e.respondWith(
        fetch(e.request)
            .then(res => {
                if (res && res.ok) {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
                }
                return res;
            })
            .catch(() =>
                caches.match(e.request).then(m => m || caches.match('./astrology.html'))
            )
    );
});
