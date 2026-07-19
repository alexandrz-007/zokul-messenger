/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

// Required by vite-plugin-pwa injectManifest build (manifest is injected at build time).
// Referenced only so the build does not fail; no workbox runtime is imported.
// console.log keeps the self.__WB_MANIFEST literal from being tree-shaken.
console.log("WB_MANIFEST", self.__WB_MANIFEST);

// Network-only: every request goes straight to the network.
// Prevents the workbox precache handler from rejecting API/navigation requests
// with "no-response" after caches are deleted during activation.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

// Emergency: activate immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Emergency: delete ALL caches, claim clients, then unregister.
// Do not auto-navigate clients here: the PWA registration script runs on every
// page load, and Safari can get stuck in a register/unregister/reload loop.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.map((n) => caches.delete(n))))
      .then(() => self.clientsClaim())
      .then(() => self.registration.unregister())
  );
});
