// Articles (fiches JSON) : celles livrées dans fiches/, et celles importées par un parent.
// L'IA propose, le parent valide : l'enfant ne voit que les articles validés sur cet iPad.
import { lire, ecrire } from "./store.js";
import { THEMES, ANIMATIONS, ANCIENS_THEMES } from "./config.js";
import { esc, jour } from "./outils.js";

let livres = [];

export async function chargerArticlesLivres() {
  try {
    const index = await (await fetch("fiches/index.json")).json();
    const fiches = await Promise.all(index.fiches.map(async f => {
      try { return { ...(await (await fetch("fiches/" + f)).json()), source: "livré" }; }
      catch (e) { console.error("Fiche illisible", f, e); return null; }
    }));
    livres = fiches.filter(Boolean);
  } catch (e) { console.error("fiches/index.json illisible", e); }
}

export function tousLesArticles() {
  const importes = lire("importes", []).map(a => ({ ...a, theme: ANCIENS_THEMES[a.theme] || a.theme, source: "importé" }));
  const ids = new Set(importes.map(a => a.id));
  return [...livres.filter(a => !ids.has(a.id)), ...importes];
}
export const article = id => tousLesArticles().find(a => a.id === id);

// [Arnaud 2026-10-25] les articles livrés avec l'app sont lisibles d'office (un parent peut en retirer un) ;
// ceux importés depuis Claude restent à valider
const estLivre = id => livres.some(a => a.id === id) && !lire("importes", []).some(a => a.id === id);
export function estValide(id) {
  const s = lire("statuts", {})[id];
  return s ? s.statut === "valide" : estLivre(id);
}
export function valider(id, oui) {
  return ecrire("statuts", { ...lire("statuts", {}), [id]: { statut: oui ? "valide" : "retire", le: jour() } });
}

export const dejaLu = id => lire("journal", []).some(j => j.article === id);

// articles que l'enfant peut lire : validés, et pas encore lus d'abord
export function articlesDisponibles(theme) {
  return tousLesArticles().filter(a => estValide(a.id) && (!theme || a.theme === theme))
    .sort((a, b) => dejaLu(a.id) - dejaLu(b.id));
}

// [[mot]] ou [[mot|forme]] = mot du jour ; {{68|soixante-huit}} = nombre et sa lecture
export function pageHTML(texte) {
  return esc(texte)
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, mot, forme) => `<span class="motdujour" data-mot="${mot}">${forme || mot}</span>`)
    .replace(/\{\{([^|]+)\|([^}]+)\}\}/g, (_, n, l) => `<span class="nb" data-lettres="${l}">${n}</span>`);
}
export const texteBrut = t => t.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, m, f) => f || m).replace(/\{\{([^|]+)\|[^}]+\}\}/g, "$1");

// la phrase de l'article où le mot apparaît, et sa page
export function phraseDuTexte(a, mot) {
  for (let i = 0; i < a.pages.length; i++) {
    const t = a.pages[i].texte;
    if (!t.includes(`[[${mot}]]`) && !t.includes(`[[${mot}|`)) continue;
    const brut = t.replace(/\{\{([^|]+)\|[^}]+\}\}/g, "$1");
    const phrase = brut.split(/(?<=[.!?])\s+/).find(p => p.includes(`[[${mot}`)) || brut;
    return {
      page: i + 1,
      texte: texteBrut(phrase),
      html: esc(phrase).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, m, f) => `<mark>${f || m}</mark>`)
    };
  }
  return null;
}

export const nombreDeMots = a => a.pages.reduce((n, p) => n + texteBrut(p.titre + " " + p.texte).split(/\s+/).filter(Boolean).length, 0);

// vérifie le format d'un article ; renvoie la liste des problèmes (vide si tout va bien)
export function verifier(a) {
  const pb = [];
  if (!a || typeof a !== "object") return ["Ce n'est pas un objet JSON."];
  if (!a.id || !/^[a-z0-9_-]+$/i.test(a.id)) pb.push("« id » manquant ou invalide (lettres, chiffres, - et _).");
  if (!a.titre) pb.push("« titre » manquant.");
  if (!THEMES.some(t => t.cle === (ANCIENS_THEMES[a.theme] || a.theme))) pb.push(`« theme » doit être l'un de : ${THEMES.map(t => t.cle).join(", ")}.`);
  if (!Array.isArray(a.pages) || a.pages.length < 3) pb.push("« pages » doit contenir au moins 3 pages.");
  else a.pages.forEach((p, i) => {
    if (!p.texte) pb.push(`Page ${i + 1} : « texte » manquant.`);
    if (p.anim && !ANIMATIONS.includes(p.anim)) pb.push(`Page ${i + 1} : « anim » inconnue (${p.anim}).`);
  });
  if (!Array.isArray(a.mots) || a.mots.length !== 3) pb.push("« mots » doit contenir exactement 3 mots.");
  else a.mots.forEach(m => {
    if (!m.mot || !Array.isArray(m.syllabes) || !m.definition) pb.push(`Mot « ${m.mot || "?"} » : il faut mot, syllabes et definition.`);
    else if (m.syllabes.join("") !== m.mot) pb.push(`Mot « ${m.mot} » : les syllabes ne redonnent pas le mot.`);
    else if (Array.isArray(a.pages) && !a.pages.some(p => (p.texte || "").includes(`[[${m.mot}`)))
      pb.push(`Mot « ${m.mot} » : il doit apparaître dans le texte, marqué [[${m.mot}]].`);
  });
  if (!Array.isArray(a.questions) || !a.questions.length) pb.push("« questions » manquantes.");
  else a.questions.forEach((q, i) => {
    if (!["calcul", "comprehension", "mot"].includes(q.type)) pb.push(`Question ${i + 1} : « type » doit être calcul, comprehension ou mot.`);
    if (!q.question || !Array.isArray(q.choix) || q.choix.length < 2) pb.push(`Question ${i + 1} : question ou choix manquants.`);
    else if (!Number.isInteger(q.reponse) || q.reponse < 0 || q.reponse >= q.choix.length) pb.push(`Question ${i + 1} : « reponse » doit être le numéro du bon choix (0 = le premier).`);
  });
  return pb;
}
