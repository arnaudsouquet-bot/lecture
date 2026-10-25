// Enregistrements audio (voix naturelle) : listes chargées au démarrage, fichiers gardés sur l'iPad pour le hors ligne.
import { ajouterEnregistrements } from "./voix.js";

const fichiers = {}; // dossier (« commun » ou id d'article) → adresses des fichiers audio

export async function chargerEnregistrements(dossiers) {
  await Promise.all(["commun", ...dossiers].map(async d => {
    const base = `fiches/audio/${d}/`;
    try {
      const r = await fetch(base + "index.json");
      if (!r.ok) return;
      const index = await r.json();
      ajouterEnregistrements(base, index);
      fichiers[d] = [...new Set(Object.values(index.clips))].map(f => base + f);
    } catch { /* pas d'enregistrement pour ce dossier : la voix de l'appareil prendra le relais */ }
  }));
}

export const estEnregistre = id => !!fichiers[id];

// télécharge les fichiers manquants : le service worker les garde (cache « lecture-audio »)
export async function mettreHorsLigne(dossiers) {
  if (!("caches" in window)) return;
  const urls = ["commun", ...dossiers].flatMap(d => fichiers[d] || []);
  const manquants = [];
  for (const u of urls) if (!(await caches.match(new URL(u, location.href).href))) manquants.push(u);
  let i = 0;
  const travailleur = async () => {
    while (i < manquants.length) {
      const u = manquants[i++];
      try { await fetch(u); } catch { /* hors ligne : on réessaiera au prochain lancement */ }
    }
  };
  await Promise.all([1, 2, 3, 4].map(travailleur));
}

// combien de fichiers de cet article sont déjà sur l'iPad
export async function etatHorsLigne(id) {
  const urls = fichiers[id] || [];
  if (!urls.length || !("caches" in window)) return null;
  let n = 0;
  for (const u of urls) if (await caches.match(new URL(u, location.href).href)) n++;
  return { n, total: urls.length };
}
