const CACHE_NAME = 'magistory-cache-v1';
const FFMPEG_URL = 'https://unpkg.com/@ffmpeg/ffmpeg@0.11.0/dist/ffmpeg.min.js';

// Saat service worker di-install, buka cache dan tambahkan file FFmpeg
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache and caching FFmpeg');
      return cache.add(FFMPEG_URL);
    })
  );
});

// Intercept network requests
self.addEventListener('fetch', (event) => {
  // Jika request adalah untuk file FFmpeg
  if (event.request.url === FFMPEG_URL) {
    event.respondWith(
      // Coba cari di cache dulu
      caches.match(event.request).then((response) => {
        // Jika ada di cache, kembalikan dari cache. Jika tidak, ambil dari network.
        return response || fetch(event.request);
      })
    );
  }
});
