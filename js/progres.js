// Points, argent de poche, journal de lecture et répétition espacée des mots.
import { lire, ecrire } from "./store.js";
import { PLAFOND_EUROS, EUROS_PAR_POINT, BONUS_MISE_A_JOUR, UN_SEUL_ARTICLE_PAYE_PAR_JOUR, INTERVALLES_JOURS, REVISIONS_PAR_JOUR } from "./config.js";
import { jour, lundi, plusJours } from "./outils.js";

/* ---------- argent de poche ---------- */

// euros gagnés pendant la semaine qui commence au lundi donné : points plafonnés, plus les cadeaux de la semaine
export function cagnotteSemaine(debut = lundi()) {
  const fin = plusJours(debut, 7);
  const points = lire("journal", []).filter(j => j.paye && j.date >= debut && j.date < fin).reduce((n, j) => n + j.points, 0);
  return Math.round((Math.min(PLAFOND_EUROS, points * EUROS_PAR_POINT) + bonusSemaine(debut)) * 100) / 100;
}
// [Arnaud 2026-11-03] « la cagnotte reste avec le même montant » : elle garde tout ce qui n'a pas encore été versé,
// d'une semaine à l'autre ; le plafond de 5 € reste par semaine
const semainesGagnees = () => [...new Set([...lire("journal", []).filter(j => j.paye).map(j => lundi(j.date)), ...lire("bonus", []).map(b => b.semaine)])];
export function cagnotte() {
  const gagne = semainesGagnees().reduce((n, s) => n + cagnotteSemaine(s), 0), verse = lire("versements", []).reduce((n, v) => n + v.montant, 0);
  return Math.max(0, Math.round((gagne - verse) * 100) / 100);
}
export const bonusSemaine = (debut = lundi()) => lire("bonus", []).filter(b => b.semaine === debut).reduce((n, b) => n + b.montant, 0);

// cadeau de la mise à jour, offert une seule fois (la cagnotte déjà gagnée reste telle quelle)
export function offrirBonusMiseAJour() {
  const bonus = lire("bonus", []);
  if (bonus.some(b => b.id === BONUS_MISE_A_JOUR.id)) return;
  return ecrire("bonus", [...bonus, { ...BONUS_MISE_A_JOUR, semaine: lundi(), date: jour() }]);
}
// le parent verse tout ce qui est dans la cagnotte
export function marquerPaye() {
  const montant = cagnotte();
  if (!montant) return;
  return ecrire("versements", [...lire("versements", []), { semaine: lundi(), date: jour(), montant }]);
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
export function motsAReviser(sauf = [], limite = REVISIONS_PAR_JOUR) {
  return Object.values(lire("progression", {}))
    .filter(e => e.prochaine && e.prochaine <= jour() && !sauf.includes(e.mot))
    .sort((a, b) => a.prochaine.localeCompare(b.prochaine))
    .slice(0, limite);
}
export const motsAppris = () => Object.values(lire("progression", {}));
