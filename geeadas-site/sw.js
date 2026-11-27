/* GEEAD ABIDJAN SUD — Service worker : application disponible hors connexion.
   Les données transitent par Firestore, qui gère son propre cache. */
const VERSION = 'geead-as-3.1.0';
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./assets/logo.png", "./assets/favicon.png", "./assets/icon-192.png", "./css/base.css", "./css/layout.css", "./css/components.css", "./css/screens.css", "./js/config.js", "./js/icons.js", "./js/utils.js", "./js/store.js", "./js/demo.js", "./js/ui.js", "./js/charts.js", "./js/shell.js", "./js/wizard.js", "./js/views/accueil.js", "./js/views/membres.js", "./js/views/inscriptions.js", "./js/views/acces.js", "./js/views/cellules.js", "./js/views/suivi.js", "./js/views/croissance.js", "./js/views/communication.js", "./js/views/journal.js", "./js/views/donnees.js", "./js/views/parametres.js", "./js/views/public.js", "./js/actions.js", "./js/auth.js"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Réseau d'abord pour recevoir les mises à jour, cache en secours hors connexion
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
