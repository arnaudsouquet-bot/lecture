// Navigation entre écrans et lecture en cours (gardée pour reprendre après une fermeture de l'app).
import { lire, ecrire, effacer } from "./store.js";
import { $, $$ } from "./outils.js";
import { FONDS, REGLAGES_DEFAUT } from "./config.js";

export const aller = route => { location.hash = route; };

export const session = () => lire("session", null);
export const majSession = champs => ecrire("session", { ...session(), ...champs });
export const finirSession = () => effacer("session");

export function message(texte) {
  const m = document.createElement("div");
  m.className = "message"; m.textContent = texte;
  document.body.append(m);
  setTimeout(() => m.remove(), 2600);
}

/* ---------- réglages de lecture (panneau « Aa ») ---------- */

export const reglages = () => ({ ...REGLAGES_DEFAUT, ...lire("reglages", {}) });
export const prenom = () => (reglages().prenom || "").trim();
// « Bonjour » suivi du prénom, s'il est réglé dans l'espace parent
export const nommer = debut => prenom() ? `${debut} ${prenom()}` : debut;
const ecouteurs = [];
export const quandReglagesChangent = f => ecouteurs.push(f);

export function appliquerReglages() {
  const r = reglages(), b = document.body;
  b.classList.toggle("r-syl-off", !r.syl);
  b.classList.toggle("r-muet-off", !r.muet);
  b.classList.toggle("r-bdpq-off", !r.bdpq);
  b.classList.toggle("r-regle", r.regle);
  b.classList.toggle("r-large", r.large);
  document.documentElement.style.setProperty("--taille", r.taille + "px");
  document.documentElement.style.setProperty("--fond", r.fond);
  $("#taille-val").textContent = r.taille;
  $$(".inter").forEach(i => i.classList.toggle("on", !!r[i.dataset.r]));
  $$(".pastille").forEach(p => p.classList.toggle("on", p.dataset.f === r.fond));
  ecouteurs.forEach(f => f());
}

export function changerReglage(cle, valeur) {
  ecrire("reglages", { ...reglages(), [cle]: valeur });
  appliquerReglages();
}

export function brancherPanneauAa() {
  $("#pastilles").innerHTML = FONDS.map(f => `<button class="pastille" data-f="${f}" style="background:${f}" aria-label="Fond"></button>`).join("");
  $$(".pastille").forEach(p => p.onclick = () => changerReglage("fond", p.dataset.f));
  $$(".inter").forEach(i => i.onclick = () => changerReglage(i.dataset.r, !reglages()[i.dataset.r]));
  $("#taille-moins").onclick = () => changerReglage("taille", Math.max(22, reglages().taille - 2));
  $("#taille-plus").onclick = () => changerReglage("taille", Math.min(40, reglages().taille + 2));
  $("#fermer-aa").onclick = () => $("#voile-aa").classList.remove("visible");
  appliquerReglages();
}
export const ouvrirAa = () => $("#voile-aa").classList.add("visible");
