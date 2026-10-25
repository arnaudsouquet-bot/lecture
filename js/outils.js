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
