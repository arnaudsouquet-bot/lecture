// Lecture à voix haute avec les voix françaises installées sur l'iPad (speechSynthesis).
import { lire } from "./store.js";
import { REGLAGES_DEFAUT } from "./config.js";

const synthese = window.speechSynthesis;

export function voixFrancaises() {
  if (!synthese) return [];
  return synthese.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith("fr"));
}

function voixChoisie() {
  const voix = voixFrancaises(), nom = lire("reglages", REGLAGES_DEFAUT).voix;
  return voix.find(v => v.name === nom)
    || voix.find(v => /premium|enhanced|amélioré/i.test(v.name) && v.lang === "fr-FR")
    || voix.find(v => v.lang === "fr-FR")
    || voix[0] || null;
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
