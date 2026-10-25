// Service worker : garde l'app et les articles sur l'iPad pour qu'elle marche sans Internet.
// Changer VERSION à chaque mise à jour de l'app : l'iPad la télécharge au lancement suivant (avec Internet).
const VERSION = "lecture-v7";
// les enregistrements audio ont des noms uniques (calculés d'après leur contenu) : leur cache survit aux mises à jour
const AUDIO = "lecture-audio";

const FICHIERS = [
  "./", "index.html", "manifest.webmanifest", "css/app.css",
  "js/app.js", "js/config.js", "js/store.js", "js/outils.js", "js/voix.js", "js/dyslexie.js",
  "js/articles.js", "js/progres.js", "js/session.js", "js/export.js", "js/prompt.js",
  "js/phrases.js", "js/enregistrements.js",
  "js/ecrans/accueil.js", "js/ecrans/envies.js", "js/ecrans/questionnaire.js", "js/ecrans/lecture.js",
  "js/ecrans/mots.js", "js/ecrans/quiz.js", "js/ecrans/recompense.js", "js/ecrans/parent.js",
  "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png",
  "fiches/index.json"
];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // « reload » : toujours la version du serveur, jamais une copie du cache du navigateur
    const recharger = urls => cache.addAll(urls.map(u => new Request(u, { cache: "reload" })));
    await recharger(FICHIERS);
    // les articles listés dans fiches/index.json
    const index = await (await cache.match("fiches/index.json")).json();
    await recharger(index.fiches.map(f => "fiches/" + f));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const cle of await caches.keys()) if (cle !== VERSION && cle !== AUDIO) await caches.delete(cle);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  const audio = url.pathname.includes("/fiches/audio/");

  // listes d'enregistrements : d'abord le réseau (pour voir les nouveaux), le cache si hors ligne
  if (audio && url.pathname.endsWith("/index.json")) {
    e.respondWith((async () => {
      const cache = await caches.open(VERSION);
      try {
        const reponse = await fetch(e.request, { cache: "no-cache" });
        if (reponse.ok) cache.put(e.request, reponse.clone());
        return reponse;
      } catch (err) {
        return (await cache.match(e.request, { ignoreSearch: true })) || Response.error();
      }
    })());
    return;
  }

  // le reste : d'abord le cache (hors ligne), sinon le réseau ; les nouveaux fichiers sont gardés au passage
  e.respondWith((async () => {
    const cache = await caches.open(audio ? AUDIO : VERSION);
    const trouve = await cache.match(e.request, { ignoreSearch: true });
    if (trouve) return trouve;
    try {
      const reponse = await fetch(e.request);
      if (reponse.ok && reponse.status === 200) cache.put(e.request, reponse.clone());
      return reponse;
    } catch (err) {
      if (e.request.mode === "navigate") return (await caches.open(VERSION)).match("index.html");
      throw err;
    }
  })());
});
