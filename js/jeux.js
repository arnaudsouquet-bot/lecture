// Mémoire et Mathématique : étoiles, badges, niveau de chaque jeu et jeux débloqués (gardés sur l'iPad, clé « jeux »).
// [Arnaud 2026-10-26] le niveau suit la réussite ; les étoiles débloquent de nouveaux jeux.
import { lire, ecrire } from "./store.js";
import { BADGES, JEUX, REGLES_NIVEAU } from "./config.js";
import { serie } from "./progres.js";

const DEFAUT = { etoiles: 0, badges: [], compteurs: {}, niveaux: {}, echecs: {}, toutDebloque: false };

export function etat() {
  const e = { ...DEFAUT, ...lire("jeux", {}) };
  // anciennes versions : niveauCalcul et niveauRetiens (3 à 7 images)
  if (e.niveauCalcul && !e.niveaux.calcul) e.niveaux = { ...e.niveaux, calcul: e.niveauCalcul };
  if (e.niveauRetiens && !e.niveaux.retiens) e.niveaux = { ...e.niveaux, retiens: Math.max(1, e.niveauRetiens - 2) };
  return e;
}
const enregistrer = champs => ecrire("jeux", { ...etat(), ...champs });

export function compter(cle, n = 1) {
  const e = etat();
  return enregistrer({ compteurs: { ...e.compteurs, [cle]: (e.compteurs[cle] || 0) + n } });
}

export const jeu = id => JEUX.find(j => j.id === id);

/* ---------- niveaux ---------- */

export function niveauDe(id) {
  const j = jeu(id);
  if (!j || !j.niveaux) return 0;
  return Math.min(j.niveaux, Math.max(1, etat().niveaux[id] || 1));
}

export function changerNiveau(id, n) {
  const e = etat(), j = jeu(id);
  return enregistrer({ niveaux: { ...e.niveaux, [id]: Math.min(j.niveaux, Math.max(1, n)) }, echecs: { ...e.echecs, [id]: 0 } });
}

// après une série : réussite entre 0 et 1 → le niveau monte, reste ou redescend doucement
export async function finDeSerie(id, reussite) {
  const j = jeu(id), r = { ...REGLES_NIVEAU, ...(j.regles || {}) }, e = etat();
  const avant = niveauDe(id);
  let apres = avant, echecs = e.echecs[id] || 0;
  if (reussite >= r.monte) { apres = Math.min(j.niveaux, avant + 1); echecs = 0; }
  else if (reussite < r.descend) {
    echecs++;
    if (echecs >= r.echecsPourDescendre) { apres = Math.max(1, avant - 1); echecs = 0; }
  } else echecs = 0;
  await enregistrer({ niveaux: { ...e.niveaux, [id]: apres }, echecs: { ...e.echecs, [id]: echecs } });
  return { jeu: id, avant, apres, max: j.niveaux };
}

/* ---------- jeux débloqués par les étoiles ---------- */

export const estDebloque = (id, etoiles = etat().etoiles) => etat().toutDebloque || jeu(id).etoiles <= etoiles;
export const toutDebloquer = oui => enregistrer({ toutDebloque: oui });

// prochain jeu à débloquer dans une section (ou partout), et combien d'étoiles il manque
export function prochainJeu(section) {
  const e = etat();
  if (e.toutDebloque) return null;
  const j = JEUX.filter(x => (!section || x.section === section) && x.etoiles > e.etoiles).sort((a, b) => a.etoiles - b.etoiles)[0];
  return j ? { ...j, manque: j.etoiles - e.etoiles } : null;
}

/* ---------- badges ---------- */

function merite(id, e) {
  const c = e.compteurs;
  switch (id) {
    case "lecteur": return lire("journal", []).length >= 1;
    case "calculateur": return (c.seriesCalcul || 0) >= 10;
    case "elephant": return (c.pairesGagnees || 0) >= 5;
    case "hibou": return (c.motsRevises || 0) >= 50;
    case "fusee": return (e.niveaux.calcul || 1) >= 6;
    case "champion": return serie() >= 7;
    default: return false;
  }
}
export const badgesGagnes = () => BADGES.filter(b => etat().badges.includes(b.id));

/* ---------- fin d'un jeu ---------- */

// résultat de la dernière activité, affiché sur l'écran « bravo »
let resultat = null;
export const dernierResultat = () => resultat;

// ajoute les étoiles, vérifie badges et jeux débloqués, et prépare l'écran « bravo » ; niveau : retour de finDeSerie
export async function terminer(etoiles, retour, niveau = null) {
  const e = etat();
  const total = e.etoiles + etoiles;
  const nouveaux = BADGES.filter(b => !e.badges.includes(b.id) && merite(b.id, { ...e, etoiles: total }));
  const debloques = e.toutDebloque ? [] : JEUX.filter(j => j.etoiles > e.etoiles && j.etoiles <= total);
  await enregistrer({ etoiles: total, badges: [...e.badges, ...nouveaux.map(b => b.id)] });
  resultat = { etoiles, nouveaux, debloques, retour, niveau };
}
