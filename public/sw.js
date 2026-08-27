// Service worker de Portal Cliente (2026-08-25, ver motoya-portal-cliente-pwa-y-testing.md §1.4).
//
// Regla no negociable: el APP SHELL se cachea (JS/CSS/fuentes/íconos, mismo origen) para que abrir la
// app instalada se sienta instantáneo -- los DATOS del cliente (todo lo que va contra el gateway de
// motoya-api, y todo Firebase) NUNCA se cachean. Mostrar un saldo o un cronograma desactualizado sin
// avisar es peor que mostrar un error de "sin conexión" honesto -- ver PWA-04 en portal-cliente-qa-plan.md.
//
// Sin build-time precache manifest a propósito (primera versión, deliberadamente simple): cachea de
// forma incremental lo que el propio navegador ya pidió, en vez de mantener una lista de archivos a
// mano que se desincroniza en cada build.

const CACHE_NAME = "portal-cliente-shell-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

/** Nunca cachear: cualquier método que no sea GET, y cualquier request que no sea del propio origen del app shell (el gateway de motoya-api y Firebase Auth/Firestore viven en otros orígenes). */
function esCacheableAppShell(request) {
  if (request.method !== "GET") return false;
  const url = new URL(request.url);
  return url.origin === self.location.origin;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (!esCacheableAppShell(request)) {
    // Datos del cliente / Firebase / cualquier cosa cross-origin -- siempre red real, nunca caché.
    return;
  }

  // Stale-while-revalidate: sirve lo cacheado de una (instantáneo) y actualiza la caché en segundo
  // plano -- correcto para JS/CSS/fuentes/íconos del propio build, que cambian solo entre despliegues.
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    )
  );
});
