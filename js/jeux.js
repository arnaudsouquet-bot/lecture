// Mémoire et Mathématique : étoiles, badges et niveaux (gardés sur l'iPad, clé « jeux »).
import { lire, ecrire } from "./store.js";
import { BADGES, NIVEAU_CALCUL_DEPART, NIVEAUX_CALCUL, RETIENS_DEPART } from "./config.js";
import { serie } from "./progres.js";

const DEFAUT = { etoiles: 0, badges: [], compteurs: {}, niveauCalcul: NIVEAU_CALCUL_DEPART, niveauRetiens: RETIENS_DEPART, retiens: { reussites: 0, echecs: 0 } };

export const etat = () => ({ ...DEFAUT, ...lire("jeux", {}) });
const enregistrer = champs => ecrire("jeux", { ...etat(), ...champs });

export function compter(cle, n = 1) {
  const e = etat();
  return enregistrer({ compteurs: { ...e.compteurs, [cle]: (e.compteurs[cle] || 0) + n } });
}

export const niveauCalcul = () => Math.min(NIVEAUX_CALCUL.length, Math.max(1, etat().niveauCalcul));
export const changerNiveauCalcul = n => enregistrer({ niveauCalcul: Math.min(NIVEAUX_CALCUL.length, Math.max(1, n)) });
export const changerRetiens = (niveauRetiens, retiens) => enregistrer({ niveauRetiens, retiens });

// badges gagnés d'après les compteurs, le journal de lecture et la série de jours
function merite(id, e) {
  const c = e.compteurs;
  switch (id) {
    case "lecteur": return lire("journal", []).length >= 1;
    case "calculateur": return (c.seriesCalcul || 0) >= 10;
    case "elephant": return (c.pairesGagnees || 0) >= 5;
    case "hibou": return (c.motsRevises || 0) >= 50;
    case "fusee": return e.niveauCalcul >= 6;
    case "champion": return serie() >= 7;
    default: return false;
  }
}

// résultat de la dernière activité, affiché sur l'écran « bravo »
let resultat = null;
export const dernierResultat = () => resultat;

// ajoute les étoiles gagnées, vérifie les badges, et prépare l'écran « bravo »
export async function terminer(etoiles, retour) {
  const e = etat();
  const total = e.etoiles + etoiles;
  const nouveaux = BADGES.filter(b => !e.badges.includes(b.id) && merite(b.id, { ...e, etoiles: total }));
  await enregistrer({ etoiles: total, badges: [...e.badges, ...nouveaux.map(b => b.id)] });
  resultat = { etoiles, nouveaux, retour };
}

export const badgesGagnes = () => BADGES.filter(b => etat().badges.includes(b.id));
