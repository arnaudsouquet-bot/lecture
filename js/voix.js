// Lecture à voix haute.
// 1. D'abord les enregistrements faits avec une voix naturelle (fiches/audio, créés par outils/voix.py),
//    retrouvés d'après le texte à dire.
// 2. Sinon, les voix françaises installées sur l'appareil (speechSynthesis), en secours.
import { lire } from "./store.js";
import { REGLAGES_DEFAUT } from "./config.js";

const synthese = window.speechSynthesis;
const VITESSE_NORMALE = 0.85; // vitesse réglée par défaut : les enregistrements sont alors joués tels quels

/* ---------- enregistrements ---------- */

const clips = new Map(); // clé du texte → adresse du fichier audio
let voixEnregistree = "";

// même règle que cle() dans outils/voix.py : minuscules, sans emoji, espaces réduits
export const cle = t => String(t).toLowerCase().replace(/’/g, "'").replace(/[\p{So}\p{Sk}️‍]/gu, "").replace(/\s+/g, " ").trim();

export function ajouterEnregistrements(base, index) {
  Object.entries(index.clips || {}).forEach(([c, f]) => clips.set(c, base + f));
  if (index.voix) voixEnregistree = index.voix;
}
export const aUnEnregistrement = texte => clips.has(cle(texte));
export const nomVoixEnregistree = () => voixEnregistree.replace(/^fr-FR-/, "").replace(/-/g, " ");

const audio = new Audio();
audio.preload = "auto";

// iOS n'autorise le son qu'après un geste : on « débloque » le lecteur au premier appui avec un court silence
function silenceWav() {
  const n = 800, buf = new ArrayBuffer(44 + n), v = new DataView(buf);
  const ecrire = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  ecrire(0, "RIFF"); v.setUint32(4, 36 + n, true); ecrire(8, "WAVEfmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
  ecrire(36, "data"); v.setUint32(40, n, true);
  for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
  return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
}
document.addEventListener("pointerdown", () => {
  if (audio.src) return;
  audio.src = silenceWav();
  audio.play().catch(() => {});
}, { once: true, capture: true });

/* ---------- voix de l'appareil (secours) ---------- */

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

/* ---------- parler ---------- */

const vitesse = () => lire("reglages", REGLAGES_DEFAUT).vitesse || VITESSE_NORMALE;
let tour = 0, arreter = null, boutonActif = null;

function effacerSurlignage(mots) { if (mots) mots.forEach(m => m.el.classList.remove("lu")); }

export function taire() {
  tour++;
  if (arreter) arreter();
  audio.pause();
  if (synthese) synthese.cancel();
  if (boutonActif) { boutonActif.classList.remove("parle"); boutonActif = null; }
}

// joue un enregistrement ; le mot surligné avance au fil de l'audio, en proportion de la longueur des mots
function jouerEnregistrement(url, mots) {
  return new Promise(fini => {
    let suivi = 0;
    const poids = (mots || []).map(m => /\p{L}|\d/u.test(m.el.textContent) ? m.el.textContent.length + 1 : 3);
    const total = poids.reduce((a, b) => a + b, 0);
    let local = null;
    const fin = () => {
      cancelAnimationFrame(suivi); effacerSurlignage(mots);
      if (arreter === fin) arreter = null;
      if (local) setTimeout(() => URL.revokeObjectURL(local), 1000);
      fini();
    };
    arreter = fin;
    // fichier récupéré en entier puis joué depuis la mémoire : Safari lit mal l'audio servi par morceaux
    // depuis le cache du service worker (hors ligne)
    fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); }).then(b => {
      if (arreter !== fin) return; // arrêté pendant le chargement
      local = URL.createObjectURL(b);
      audio.onended = fin; audio.onerror = fin;
      audio.src = local;
      audio.defaultPlaybackRate = audio.playbackRate = Math.min(1.6, Math.max(0.5, vitesse() / VITESSE_NORMALE));
      audio.preservesPitch = audio.webkitPreservesPitch = true;
      audio.play().catch(fin);
    }).catch(fin);
    if (!mots || !mots.length) return;
    let courant = -1;
    const maj = () => {
      if (!(audio.duration > 0) || audio.src !== local) return;
      let cible = (audio.currentTime / audio.duration) * total, i = 0;
      while (i < poids.length - 1 && cible > poids[i]) { cible -= poids[i]; i++; }
      if (i !== courant) { if (courant >= 0) mots[courant].el.classList.remove("lu"); mots[i].el.classList.add("lu"); courant = i; }
    };
    // à chaque image pour un surlignage fluide, et à chaque progression de l'audio (qui continue si l'écran n'est pas affiché)
    const suivre = () => { maj(); suivi = requestAnimationFrame(suivre); };
    suivi = requestAnimationFrame(suivre);
    audio.ontimeupdate = maj;
  });
}

// voix de l'appareil ; mots : [{ el, debut }] pour surligner le mot prononcé (quand le navigateur envoie les positions)
function direAvecAppareil(texte, mots) {
  return new Promise(fini => {
    if (!synthese) return fini();
    const u = new SpeechSynthesisUtterance(texte);
    u.lang = "fr-FR";
    u.rate = vitesse();
    const v = voixChoisie(); if (v) u.voice = v;
    const fin = () => { effacerSurlignage(mots); arreter = null; fini(); };
    arreter = fin;
    u.onend = fin; u.onerror = fin;
    if (mots) u.onboundary = e => {
      effacerSurlignage(mots);
      let trouve = null;
      for (const m of mots) { if (m.debut <= e.charIndex) trouve = m; else break; }
      if (trouve) trouve.el.classList.add("lu");
    };
    synthese.speak(u);
  });
}

// dit plusieurs morceaux à la suite : [{ texte, mots }] ; chacun avec son enregistrement s'il existe
export async function direSuite(morceaux, { bouton } = {}) {
  taire();
  const moi = tour;
  if (bouton) { bouton.classList.add("parle"); boutonActif = bouton; }
  for (const m of morceaux) {
    if (moi !== tour) return;
    if (!m.texte || !cle(m.texte)) continue;
    const url = clips.get(cle(m.texte));
    await (url ? jouerEnregistrement(url, m.mots) : direAvecAppareil(m.texte, m.mots));
  }
  if (moi === tour && bouton) { bouton.classList.remove("parle"); boutonActif = null; }
}

export const dire = (texte, { bouton, mots } = {}) => direSuite([{ texte, mots }], { bouton });
