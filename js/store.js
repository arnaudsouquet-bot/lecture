// Données de lecture : IndexedDB (base « lecture », un magasin clé → valeur).
// Tout est chargé en mémoire au démarrage ; chaque écriture part aussi dans IndexedDB.

const BASE = "lecture", MAGASIN = "kv";
export const CLES = ["reglages", "statuts", "importes", "journal", "progression", "versements", "envies", "session"];

let db = null;
const memoire = {};

function ouvrir() {
  return new Promise((ok, ko) => {
    const r = indexedDB.open(BASE, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(MAGASIN);
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ko(r.error);
  });
}

function requete(mode, action) {
  return new Promise((ok, ko) => {
    const t = db.transaction(MAGASIN, mode), r = action(t.objectStore(MAGASIN));
    t.oncomplete = () => ok(r && r.result);
    t.onerror = () => ko(t.error);
  });
}

export async function charger() {
  db = await ouvrir();
  const cles = await requete("readonly", s => s.getAllKeys());
  const valeurs = await requete("readonly", s => s.getAll());
  cles.forEach((c, i) => { memoire[c] = valeurs[i]; });
  // demande à iOS de ne pas effacer ces données
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}

export function lire(cle, defaut) {
  return cle in memoire ? memoire[cle] : structuredClone(defaut);
}

export function ecrire(cle, valeur) {
  memoire[cle] = valeur;
  return requete("readwrite", s => s.put(valeur, cle)).catch(e => console.error("Écriture impossible", cle, e));
}

export function effacer(cle) {
  delete memoire[cle];
  return requete("readwrite", s => s.delete(cle));
}

export function tout() {
  const r = {};
  CLES.forEach(c => { if (c in memoire) r[c] = memoire[c]; });
  return r;
}

export async function remplacerTout(donnees) {
  await requete("readwrite", s => s.clear());
  Object.keys(memoire).forEach(c => delete memoire[c]);
  for (const c of CLES) if (c in donnees) await ecrire(c, donnees[c]);
}
