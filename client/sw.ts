/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import { precacheAndRoute } from 'workbox-precaching';

// Required by vite-plugin-pwa injectManifest build
precacheAndRoute(self.__WB_MANIFEST);

// Emergency: activate immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Emergency: delete ALL caches, claim clients, unregister, reload windows
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.map((n) => caches.delete(n))))
      .then(() => self.clientsClaim())
      .then(() => self.registration.unregister())
      .then(() =>
        self.clients.matchAll({ type: 'window' }).then((clients) => {
          clients.forEach((client) => client.navigate(client.url));
        })
      )
  );
});
