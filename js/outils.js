// Petites aides communes : dates, échappement, animations.

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];

export function esc(t) {
  return String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export const euros = v => v.toFixed(2).replace(".", ",") + " €";

// dates locales au format AAAA-MM-JJ
export function jour(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function plusJours(j, n) {
  const d = new Date(j + "T12:00:00"); d.setDate(d.getDate() + n); return jour(d);
}
// lundi de la semaine du jour donné
export function lundi(j = jour()) {
  const d = new Date(j + "T12:00:00"), decalage = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - decalage); return jour(d);
}
export const dateLongue = (d = new Date()) => d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
export const dateCourte = j => { const [, m, d] = j.split("-"); return `${d}/${m}`; };

export function compter(el, de, a, duree, format) {
  const t0 = performance.now();
  const pas = t => {
    const p = Math.min(1, (t - t0) / duree), v = de + (a - de) * (1 - Math.pow(1 - p, 3));
    el.textContent = format(v);
    if (p < 1) requestAnimationFrame(pas);
  };
  requestAnimationFrame(pas);
}

export function confettis(conteneur, nombre = 90) {
  const couleurs = ["#f4b400", "#2f6db5", "#b8492f", "#2e8b57", "#6a4fb3"];
  for (let k = 0; k < nombre; k++) {
    const d = document.createElement("div");
    d.className = "confetti";
    d.style.left = Math.random() * 100 + "%";
    d.style.background = couleurs[k % couleurs.length];
    d.style.animationDuration = 2 + Math.random() * 2 + "s";
    d.style.animationDelay = Math.random() * 0.8 + "s";
    conteneur.append(d);
    setTimeout(() => d.remove(), 5000);
  }
}

export const syllabesHTML = s => s.map((x, i) => `<span class="${i % 2 ? "syl-b" : "syl-a"}">${esc(x)}</span>`).join("");

export const etapes = (n, ici) => Array.from({ length: n }, (_, i) => `<span class="${i < ici ? "fait" : i === ici ? "ici" : ""}"></span>`).join("");

export function pluriel(n, mot, motPluriel = mot + "s") { return `${n} ${n > 1 ? motPluriel : mot}`; }

export const hasard = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
export function melanger(liste) {
  const l = [...liste];
  for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
  return l;
}

// nombre en lettres, de 0 à 1000 (orthographe traditionnelle : vingt et un, quatre-vingts)
const UNITES = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix",
  "onze", "douze", "treize", "quatorze", "quinze", "seize"];
const DIZAINES = { 2: "vingt", 3: "trente", 4: "quarante", 5: "cinquante", 6: "soixante" };
function sous100(n) {
  if (n < 17) return UNITES[n];
  if (n < 20) return "dix-" + UNITES[n - 10];
  const d = Math.floor(n / 10), u = n % 10;
  if (d < 7) return DIZAINES[d] + (u === 0 ? "" : u === 1 ? " et un" : "-" + UNITES[u]);
  if (d === 7) return n === 71 ? "soixante et onze" : "soixante-" + sous100(n - 60);
  if (d === 8) return n === 80 ? "quatre-vingts" : "quatre-vingt-" + UNITES[u];
  return "quatre-vingt-" + sous100(n - 80);
}
export function enLettres(n) {
  if (n < 100) return sous100(n);
  if (n === 1000) return "mille";
  const c = Math.floor(n / 100), r = n % 100;
  return (c === 1 ? "cent" : UNITES[c] + " cent" + (r === 0 ? "s" : "")) + (r ? " " + sous100(r) : "");
}
