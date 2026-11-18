/* ═══════════════════════════════════════════════════════════════════
   JOBLIVE — LE SERVICE WORKER (le moule Resafix) : la maison vit
   hors ligne. Stratégie sobre, jamais surprenante :
   · NAVIGATIONS : réseau d'abord (la vérité du jour — la timeline
     doit être FRAÎCHE), repli cache, repli accueil.
   · STATIQUES (_next, icônes, photos) : cache d'abord, revalidation
     discrète en fond — l'app ouvre vite, toujours.
   Jamais de cache des /api (la preuve voyage en direct).
   ═══════════════════════════════════════════════════════════════════ */
const NOM = 'joblive-v1';
const PRÉCACHE = ['/', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(NOM).then((c) => c.addAll(PRÉCACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((clés) => Promise.all(clés.filter((k) => k !== NOM).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api')) return;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((r) => {
          const copie = r.clone();
          caches.open(NOM).then((c) => c.put(e.request, copie));
          return r;
        })
        .catch(() => caches.match(e.request).then((c) => c ?? caches.match('/'))),
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((c) => {
      const reval = fetch(e.request)
        .then((r) => {
          if (r.ok) caches.open(NOM).then((ca) => ca.put(e.request, r.clone()));
          return r;
        })
        .catch(() => c);
      return c ?? reval;
    }),
  );
});
