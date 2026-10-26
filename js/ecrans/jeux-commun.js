// Ce que partagent les jeux de Mémoire et de Mathématique : en-tête, étoiles, fin de partie, choix du jeu, séries de questions.
import { JEUX, ETOILES_PAR_REPONSE } from "../config.js";
import { etat, terminer, estDebloque, niveauDe, prochainJeu, jeu } from "../jeux.js";
import { aller } from "../session.js";
import { decorer } from "../dyslexie.js";
import { dire, direSuite } from "../voix.js";
import { PHRASES } from "../phrases.js";
import { $, $$, esc, etapes } from "../outils.js";

const SECTIONS = { memoire: { titre: "🧠 Mémoire", parole: PHRASES.memoireTitre, retour: "◀ Mémoire" },
                   maths: { titre: "🔢 Mathématique", parole: PHRASES.mathsTitre, retour: "◀ Mathématique" } };

// en-tête d'un jeu : titre, éléments à droite, étoiles, bouton retour vers la section
export function entete(id, droite = "") {
  const j = jeu(id), n = niveauDe(id);
  return `
    <div class="entete">
      <h1>${j.emoji} ${esc(j.titre)}</h1>
      <div class="droite">${n ? `<span class="niveau">Niveau ${n}</span>` : ""}${droite}<span class="points-coin" id="etoiles">⭐ ${etat().etoiles}</span>
        <button class="bouton clair petit" id="retour">${SECTIONS[j.section].retour}</button></div>
    </div>`;
}
export function brancherRetour(ecran, id, avant = () => {}) {
  $("#retour", ecran).onclick = () => { avant(); aller(jeu(id).section); };
}

// le compteur d'étoiles de l'en-tête suit les étoiles gagnées pendant la partie
export function etoile(ecran, gagnees) {
  const el = $("#etoiles", ecran);
  if (!el) return;
  el.textContent = `⭐ ${etat().etoiles + gagnees}`;
  el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
}

export async function finir(id, etoiles, niveau = null) {
  await terminer(etoiles, jeu(id).section, niveau);
  aller("bravo");
}

export function rienAJouer(ecran, id) {
  ecran.innerHTML = entete(id) + `<div class="vide-jeu"><div style="font-size:90px">📖</div><div class="lisible">${esc(PHRASES.lisUnArticle)}</div></div>`;
  brancherRetour(ecran, id);
  dire(PHRASES.lisUnArticle);
}

// nombres dits avec les enregistrements de 0 à 100, des centaines et des milliers : 347 → « 300 », « 47 »
export function parolesNombre(n) {
  if (n <= 100) return [String(n)];
  if (n < 1000) { const c = Math.floor(n / 100) * 100, r = n % 100; return [String(c), ...(r ? [String(r)] : [])]; }
  if (n < 10000) { const m = Math.floor(n / 1000) * 1000, r = n % 1000; return [String(m), ...(r ? parolesNombre(r) : [])]; }
  return [String(n)];
}
export const direNombre = (n, options) => direSuite(parolesNombre(n).map(texte => ({ texte })), options);

/* ---------- choix du jeu (Mémoire, Mathématique) ---------- */

export function hub(ecran, section, badges = {}) {
  const s = SECTIONS[section], e = etat(), suivant = prochainJeu(section);
  ecran.classList.add(section === "memoire" ? "hub-memoire" : "hub-maths");
  ecran.innerHTML = `
    <div class="entete">
      <button class="hp" id="dire-titre" aria-label="Écouter">🔊</button>
      <h1>${s.titre}</h1>
      <div class="droite"><span class="points-coin">⭐ ${e.etoiles}</span><button class="bouton clair petit" id="accueil">◀ Accueil</button></div>
    </div>
    ${suivant ? `<div class="prochain">🔒 Encore <b>${suivant.manque} ⭐</b> pour débloquer : <b>${suivant.emoji} ${esc(suivant.titre)}</b>
      <div class="jauge"><div style="width:${Math.min(100, (e.etoiles / suivant.etoiles) * 100)}%"></div></div></div>` : ""}
    <div class="activites">
      ${JEUX.filter(j => j.section === section).map(j => {
        const ouvert = estDebloque(j.id, e.etoiles), n = niveauDe(j.id);
        return `<button class="activite ${ouvert ? "" : "ferme"}" data-jeu="${j.id}">
          <span class="emo">${ouvert ? j.emoji : "🔒"}</span><span class="nom">${esc(j.titre)}</span>
          <span class="desc">${ouvert ? esc(j.desc) : `Encore ${j.etoiles - e.etoiles} ⭐ pour l'ouvrir`}</span>
          ${ouvert ? `<span class="badge">${badges[j.id] || (n ? `Niveau ${n} sur ${j.niveaux}` : "")}</span>` : ""}</button>`;
      }).join("")}
    </div>`;
  $("#dire-titre", ecran).onclick = ev => dire(s.parole, { bouton: ev.currentTarget });
  $("#accueil", ecran).onclick = () => aller("accueil");
  $$("[data-jeu]", ecran).forEach(b => b.onclick = () => {
    const j = jeu(b.dataset.jeu);
    if (estDebloque(j.id)) aller(j.id);
    else dire(PHRASES.jeuVerrouille);
  });
}

/* ---------- séries de questions à choix ---------- */

// questions : [{ question, dire: [textes], choix: [textes affichés], choixHTML?, reponse, aide?, source?, grand?, choixChiffres?,
//               direChoix(k): textes, reussite: texte, echec: [textes] }]
// fin(etoiles, reussite 0..1) est appelée à la fin de la série
export function serieDeQuestions(ecran, id, questions, fin) {
  let i = 0, etoiles = 0, premierCoup = 0;
  function question() {
    const q = questions[i];
    let essais = 0, fini = false;
    ecran.innerHTML = entete(id, `<div class="points-etapes">${etapes(questions.length, i)}</div>`) + `
      ${q.source ? `<div class="source">${q.source}</div>` : ""}
      <div class="carte question lisible"><button class="hp" id="dire-q" aria-label="Écouter">🔊</button><span>${esc(q.question)}</span></div>
      ${q.grandHTML ? `<div class="grand-jeu">${q.grandHTML}</div>` : ""}
      ${q.grand ? `<div class="nombre-ecrit lisible ${q.grand.chiffres ? "chiffres" : ""}" id="grand">${esc(q.grand.texte)}</div>` : ""}
      ${q.aide ? `<div class="aide sans-deco">${esc(q.aide)}</div>` : ""}
      <div class="choix" style="margin-top:18px">${q.choix.map((c, k) => `<button data-k="${k}">${q.choixHTML ? q.choixHTML[k] : `<span class="txt">${esc(c)}</span>`}${q.direChoix ? `<span class="dire-choix" aria-label="Écouter">🔊</span>` : ""}</button>`).join("")}</div>
      <div class="message-jeu" id="msg" style="margin-top:18px"></div>
      <div class="bas"><button class="bouton fin" id="suiv" style="visibility:hidden">${i < questions.length - 1 ? "Suivant ▶" : "Terminer ⭐"}</button></div>`;
    brancherRetour(ecran, id);
    if (q.grand && !q.grand.chiffres) decorer($("#grand", ecran));
    decorer($(".question > span", ecran));
    if (!q.choixChiffres && !q.choixHTML) $$(".choix .txt", ecran).forEach(el => decorer(el));
    const parler = bouton => direSuite(q.dire.map(texte => ({ texte })), { bouton });
    $("#dire-q", ecran).onclick = ev => parler(ev.currentTarget);
    parler();
    $$("[data-k]", ecran).forEach(b => b.onclick = ev => {
      const k = +b.dataset.k;
      if (ev.target.closest(".dire-choix")) { direSuite(q.direChoix(k).map(texte => ({ texte }))); return; }
      if (fini || b.classList.contains("faux")) return;
      essais++;
      const msg = $("#msg", ecran);
      if (k === q.reponse) {
        fini = true; b.classList.add("juste");
        if (essais === 1) premierCoup++;
        etoiles += ETOILES_PAR_REPONSE; etoile(ecran, etoiles);
        msg.className = "message-jeu ok"; msg.textContent = `Bravo ! +${ETOILES_PAR_REPONSE} ⭐`;
        dire(q.reussite || PHRASES.bravo);
      } else if (essais < 2) {
        b.classList.add("faux");
        msg.className = "message-jeu non"; msg.textContent = "Presque ! Essaie encore 💪";
        dire(PHRASES.presque);
      } else {
        fini = true; b.classList.add("faux");
        $(`[data-k="${q.reponse}"]`, ecran).classList.add("juste");
        msg.className = "message-jeu non"; msg.textContent = "La bonne réponse est en vert.";
        direSuite((q.echec || [PHRASES.bonneReponse]).map(texte => ({ texte })));
      }
      if (fini) $("#suiv", ecran).style.visibility = "visible";
    });
    $("#suiv", ecran).onclick = () => { i++; if (i < questions.length) question(); else fin(etoiles, premierCoup / questions.length); };
  }
  question();
}
