// Points, argent de poche, journal de lecture et répétition espacée des mots.
import { lire, ecrire } from "./store.js";
import { PLAFOND_EUROS, EUROS_PAR_POINT, UN_SEUL_ARTICLE_PAYE_PAR_JOUR, INTERVALLES_JOURS, REVISIONS_PAR_JOUR } from "./config.js";
import { jour, lundi, plusJours } from "./outils.js";

/* ---------- argent de poche ---------- */

// euros gagnés pendant la semaine qui commence au lundi donné, plafonnés
export function cagnotteSemaine(debut = lundi()) {
  const fin = plusJours(debut, 7);
  const points = lire("journal", []).filter(j => j.paye && j.date >= debut && j.date < fin).reduce((n, j) => n + j.points, 0);
  return Math.min(PLAFOND_EUROS, Math.round(points * EUROS_PAR_POINT * 100) / 100);
}
export function verseSemaine(debut = lundi()) {
  return lire("versements", []).filter(v => v.semaine === debut).reduce((n, v) => n + v.montant, 0);
}
export const resteAVerser = (debut = lundi()) => Math.max(0, Math.round((cagnotteSemaine(debut) - verseSemaine(debut)) * 100) / 100);

export function marquerPaye(debut = lundi()) {
  const montant = resteAVerser(debut);
  if (!montant) return;
  return ecrire("versements", [...lire("versements", []), { semaine: debut, date: jour(), montant }]);
}

// l'article qu'il termine aujourd'hui rapporte-t-il de l'argent ?
export const articlePayeAujourdhui = () => !UN_SEUL_ARTICLE_PAYE_PAR_JOUR || !lire("journal", []).some(j => j.date === jour() && j.paye);

/* ---------- journal ---------- */

export function noterLecture(entree) {
  return ecrire("journal", [...lire("journal", []), entree]);
}
export const luAujourdhui = () => lire("journal", []).some(j => j.date === jour());
export function serie() {
  const jours = new Set(lire("journal", []).map(j => j.date));
  let j = jours.has(jour()) ? jour() : plusJours(jour(), -1), n = 0;
  while (jours.has(j)) { n++; j = plusJours(j, -1); }
  return n;
}

/* ---------- répétition espacée (boîtes de Leitner) ---------- */

// boîte 1 à 5 ; au-delà de la boîte 5 réussie, le mot est su
export function apprendre(mots, articleId) {
  const p = { ...lire("progression", {}) };
  mots.forEach(m => {
    if (p[m.mot]) return;
    p[m.mot] = { ...m, article: articleId, boite: 1, appris: jour(), prochaine: plusJours(jour(), INTERVALLES_JOURS[0]) };
  });
  return ecrire("progression", p);
}
export function reviser(mot, reussi) {
  const p = { ...lire("progression", {}) }, e = p[mot];
  if (!e) return;
  e.boite = reussi ? e.boite + 1 : 1;
  e.prochaine = e.boite > INTERVALLES_JOURS.length ? null : plusJours(jour(), INTERVALLES_JOURS[e.boite - 1]);
  return ecrire("progression", p);
}
export function motsAReviser(sauf = []) {
  return Object.values(lire("progression", {}))
    .filter(e => e.prochaine && e.prochaine <= jour() && !sauf.includes(e.mot))
    .sort((a, b) => a.prochaine.localeCompare(b.prochaine))
    .slice(0, REVISIONS_PAR_JOUR);
}
export const motsAppris = () => Object.values(lire("progression", {}));
