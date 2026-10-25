// Lecture à voix haute avec les voix françaises installées sur l'iPad (speechSynthesis).
import { lire } from "./store.js";
import { REGLAGES_DEFAUT } from "./config.js";

const synthese = window.speechSynthesis;

// qualité estimée d'une voix d'après son nom : les voix premium / améliorées (iPad) et naturelles (Edge)
// sont bien meilleures que les anciennes voix de bureau de Windows (Hortense, Julie, Paul)
function qualite(v) {
  const n = v.name.toLowerCase();
  let q = 0;
  if (/premium/.test(n)) q = 6;
  else if (/enhanced|amélioré|natural|neural/.test(n)) q = 5;
  else if (/google/.test(n)) q = 3;
  else if (!/microsoft/.test(n)) q = 2; // voix Apple standard (Amélie, Thomas…)
  if (v.lang === "fr-FR") q += 0.5;
  return q;
}

// voix françaises, de la meilleure à la moins bonne
export function voixFrancaises() {
  if (!synthese) return [];
  return synthese.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith("fr")).sort((a, b) => qualite(b) - qualite(a));
}

function voixChoisie() {
  const voix = voixFrancaises(), nom = lire("reglages", REGLAGES_DEFAUT).voix;
  return voix.find(v => v.name === nom) || voix[0] || null;
}
export const nomVoix = () => (voixChoisie() || {}).name || "";

if (synthese) synthese.onvoiceschanged = () => {};

export function taire() { if (synthese) synthese.cancel(); }

// mots : [{ el, debut }] pour surligner le mot prononcé (quand Safari envoie les positions)
export function dire(texte, { bouton, mots } = {}) {
  if (!synthese || !texte) return;
  synthese.cancel();
  const u = new SpeechSynthesisUtterance(texte);
  u.lang = "fr-FR";
  u.rate = lire("reglages", REGLAGES_DEFAUT).vitesse || 0.85;
  const v = voixChoisie(); if (v) u.voice = v;
  if (bouton) bouton.classList.add("parle");
  const fin = () => {
    if (bouton) bouton.classList.remove("parle");
    if (mots) mots.forEach(m => m.el.classList.remove("lu"));
  };
  u.onend = fin; u.onerror = fin;
  if (mots) u.onboundary = e => {
    mots.forEach(m => m.el.classList.remove("lu"));
    let trouve = null;
    for (const m of mots) { if (m.debut <= e.charIndex) trouve = m; else break; }
    if (trouve) trouve.el.classList.add("lu");
  };
  synthese.speak(u);
}
