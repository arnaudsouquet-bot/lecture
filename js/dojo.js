// Le Dojo : mémoire de chaque calcul des tables (de 2 × 2 à 9 × 9) et ceintures, gardées sur l'iPad (clé « dojo »).
// [Arnaud 2026-11-22] un calcul est maîtrisé après 3 réussites du premier coup, sur des jours différents ;
// les adversaires attaquent surtout avec les calculs ratés.
import { lire, ecrire } from "./store.js";
import { CEINTURES, DOJO } from "./config.js";
import { jour, hasard } from "./outils.js";

const DEFAUT = { faits: {}, ceinture: 0, victoires: 0 };
export const etatDojo = () => ({ ...DEFAUT, ...lire("dojo", {}) });

// un calcul « a × t » de la table de t ; a va de 2 à 9
export const cleFait = (a, t) => `${a}x${t}`;
export const faitsDeTables = tables => tables.flatMap(t => [2, 3, 4, 5, 6, 7, 8, 9].map(a => cleFait(a, t)));
export const lireFait = k => { const [a, t] = k.split("x").map(Number); return { a, t, k }; };
export const reussites = k => (etatDojo().faits[k] || {}).n || 0;
export const maitrise = k => reussites(k) >= DOJO.reussitesPourMaitriser;

// la ceinture qu'on prépare (après la noire : révision de toutes les tables, contre le dragon)
export function objectif() {
  const c = etatDojo().ceinture;
  return c < CEINTURES.length ? CEINTURES[c] : { ...CEINTURES[CEINTURES.length - 1], tables: CEINTURES.flatMap(x => x.tables), revision: true };
}
export const tablesApprises = () => CEINTURES.slice(0, etatDojo().ceinture).flatMap(c => c.tables);

// juste du premier coup : une réussite de plus (une seule par jour) ; raté : une de moins
export function noter(k, juste) {
  const e = etatDojo(), f = { n: 0, jours: [], ...e.faits[k] }, j = jour();
  if (juste && !f.jours.includes(j)) { f.n++; f.jours = [...f.jours, j].slice(-DOJO.reussitesPourMaitriser); delete f.rate; }
  if (!juste) { f.n = Math.max(0, f.n - 1); f.rate = j; }
  return ecrire("dojo", { ...e, faits: { ...e.faits, [k]: f } });
}

// après un duel gagné : ceintures gagnées (toutes les tables de la ceinture maîtrisées)
export async function finDuel() {
  const e = etatDojo();
  let c = e.ceinture;
  while (c < CEINTURES.length && faitsDeTables(CEINTURES[c].tables).every(maitrise)) c++;
  await ecrire("dojo", { ...e, ceinture: c, victoires: e.victoires + 1 });
  return CEINTURES.slice(e.ceinture, c);
}

// le prochain calcul : surtout ceux de la ceinture en cours qui ne sont pas maîtrisés (les ratés d'abord),
// parfois une révision des tables déjà apprises
export function prochainFait(deja = []) {
  const e = etatDojo(), o = objectif();
  const revision = tablesApprises().filter(t => !o.tables.includes(t));
  const source = revision.length && Math.random() < DOJO.partRevision ? faitsDeTables(revision) : faitsDeTables(o.tables);
  const poids = k => {
    const f = e.faits[k] || {};
    return (deja.includes(k) ? 0.2 : 1) * (DOJO.reussitesPourMaitriser + 1 - Math.min(f.n || 0, DOJO.reussitesPourMaitriser)) * (f.rate ? 2 : 1);
  };
  const total = source.reduce((s, k) => s + poids(k), 0);
  let x = Math.random() * total;
  for (const k of source) { x -= poids(k); if (x <= 0) return lireFait(k); }
  return lireFait(source[hasard(0, source.length - 1)]);
}
