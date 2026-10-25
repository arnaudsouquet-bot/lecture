// Mathématique : choix du jeu, calcul mental par niveaux, problèmes des articles lus, lire les nombres. Des étoiles.
import { ETOILES_PAR_REPONSE, NIVEAUX_CALCUL, CALCULS_PAR_SERIE, REUSSITES_POUR_MONTER, NOMBRES_MAX, NOMBRES_PAR_SERIE } from "../config.js";
import { lire } from "../store.js";
import { article } from "../articles.js";
import { decorer } from "../dyslexie.js";
import { etat, compter, terminer, niveauCalcul, changerNiveauCalcul } from "../jeux.js";
import { aller } from "../session.js";
import { dire, direSuite } from "../voix.js";
import { PHRASES } from "../phrases.js";
import { $, $$, esc, etapes, melanger, hasard, enLettres } from "../outils.js";

const entete = (titre, droite = "") => `
  <div class="entete">
    <h1>${titre}</h1>
    <div class="droite">${droite}<span class="points-coin" id="etoiles">⭐ ${etat().etoiles}</span>
      <button class="bouton clair petit" id="retour">◀ Mathématique</button></div>
  </div>`;

function etoile(ecran, gagnees) {
  const el = $("#etoiles", ecran);
  el.textContent = `⭐ ${etat().etoiles + gagnees}`;
  el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
}
const finir = async etoiles => { await terminer(etoiles, "maths"); aller("bravo"); };
const articlesLus = () => [...new Set(lire("journal", []).map(j => j.article))].map(article).filter(Boolean);

/* ---------- choix du jeu ---------- */

export function maths(ecran) {
  const niv = niveauCalcul(), lus = articlesLus().length;
  ecran.classList.add("hub-maths");
  ecran.innerHTML = `
    <div class="entete">
      <button class="hp" id="dire-titre" aria-label="Écouter">🔊</button>
      <h1>🔢 Mathématique</h1>
      <div class="droite"><span class="points-coin">⭐ ${etat().etoiles}</span><button class="bouton clair petit" id="accueil">◀ Accueil</button></div>
    </div>
    <div class="activites">
      <button class="activite" data-aller="calcul"><span class="emo">⚡</span><span class="nom">Calcul mental</span>
        <span class="desc">Additions, soustractions, doubles et tables. Le niveau monte quand tu réussis.</span>
        <span class="badge">Niveau ${niv} : ${esc(NIVEAUX_CALCUL[niv - 1].titre)}</span></button>
      <button class="activite" data-aller="problemes"><span class="emo">📰</span><span class="nom">Problèmes de mes articles</span>
        <span class="desc">Des petits problèmes avec les nombres des articles que tu as lus.</span>
        <span class="badge">${lus ? `${lus} article${lus > 1 ? "s" : ""} lu${lus > 1 ? "s" : ""}` : "Lis d'abord un article"}</span></button>
      <button class="activite" data-aller="lire-nombres"><span class="emo">🔢</span><span class="nom">Lire les nombres</span>
        <span class="desc">Écoute ou lis un nombre, et trouve comment il s'écrit.</span>
        <span class="badge">Jusqu'à ${NOMBRES_MAX}</span></button>
    </div>`;
  $("#dire-titre", ecran).onclick = e => dire(PHRASES.mathsTitre, { bouton: e.currentTarget });
  $("#accueil", ecran).onclick = () => aller("accueil");
  $$("[data-aller]", ecran).forEach(b => b.onclick = () => aller(b.dataset.aller));
}

/* ---------- calcul mental ---------- */

const pommes = n => "🍎".repeat(n);
// un calcul du niveau : texte affiché, morceaux à dire (enregistrés : nombres 0 à 100 et mots du calcul), résultat, aide
function calculDuNiveau(niv) {
  const n = NIVEAUX_CALCUL[niv - 1];
  const dit = (a, mot, b) => [String(a), mot, String(b), PHRASES.egaleCombien];
  if (n.op === "+") {
    const a = n.max > 20 ? hasard(10, n.max - 15) : hasard(1, n.max - 1), b = n.max > 20 ? hasard(5, n.max - a) : hasard(1, n.max - a);
    const aide = a + b <= 20 ? `${pommes(a)} + ${pommes(b)}` : `${a} + ${b} = ${a} + ${b - (b % 10)} + ${b % 10}`;
    return { texte: `${a} + ${b}`, parole: dit(a, PHRASES.plus, b), res: a + b, aide };
  }
  if (n.op === "-") {
    const a = hasard(2, n.max), b = hasard(1, a - 1);
    const aide = a <= 20 ? `${pommes(a - b)}<span class="barre">${pommes(b)}</span>` : `${a} − ${b} = ${a} − ${b - (b % 10)} − ${b % 10}`;
    return { texte: `${a} − ${b}`, parole: dit(a, PHRASES.moins, b), res: a - b, aide };
  }
  if (n.op === "double") {
    if (Math.random() < 0.5) { const a = hasard(2, 15); return { texte: `${a} + ${a}`, parole: dit(a, PHRASES.plus, a), res: 2 * a, aide: a <= 10 ? `${pommes(a)} + ${pommes(a)}` : `${a} + ${a} = ${a - (a % 10)} + ${a - (a % 10)} + ${a % 10} + ${a % 10}` }; }
    const m = 2 * hasard(1, 10);
    return { texte: `la moitié de ${m}`, parole: [PHRASES.moitieDe, String(m), PHRASES.egaleCombien], res: m / 2, aide: `${pommes(m)} → 2 parts égales` };
  }
  const t = n.tables[hasard(0, n.tables.length - 1)], b = hasard(1, 10);
  return { texte: `${b} × ${t}`, parole: dit(b, PHRASES.fois, t), res: b * t, aide: `${b} × ${t} = ${Array(b).fill(t).join(" + ")}` };
}

export function calcul(ecran) {
  const niv = niveauCalcul(), niveau = NIVEAUX_CALCUL[niv - 1];
  let i = 0, premierCoup = 0, etoiles = 0, c = null, saisie = "", essais = 0, bloque = false;
  ecran.innerHTML = entete("⚡ Calcul mental", `<span class="niveau">Niveau ${niv}</span><div class="points-etapes" id="avance"></div>`) + `
    <div class="calcul">
      <div>
        <div class="sous-titre">${esc(niveau.titre)} · ${CALCULS_PAR_SERIE} calculs</div>
        <div class="operation" id="operation"></div>
        <div class="aide-visuelle" id="aide"></div>
        <div class="message-jeu" id="msg"></div>
        <div style="text-align:center;margin-top:8px"><button class="hp" id="dire-calc" aria-label="Écouter">🔊</button>
          <button class="bouton clair petit" id="montrer-aide">💡 Aide</button></div>
      </div>
      <div class="pave" id="pave">${["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✔"].map(t => `<button class="${t === "✔" ? "ok" : ""}" data-t="${t}">${t}</button>`).join("")}</div>
    </div>`;
  $("#retour", ecran).onclick = () => aller("maths");

  const afficher = () => {
    const op = $("#operation", ecran);
    op.classList.toggle("long", c.texte.length > 9);
    op.innerHTML = `${esc(c.texte)} = <span class="rep">${saisie || "&nbsp;"}</span>`;
  };
  const dejaVus = new Set();
  function suivant() {
    // pas deux fois le même calcul dans une série
    for (let essai = 0; essai < 20; essai++) { c = calculDuNiveau(niv); if (!dejaVus.has(c.texte)) break; }
    dejaVus.add(c.texte);
    saisie = ""; essais = 0; bloque = false;
    $("#aide", ecran).innerHTML = ""; $("#msg", ecran).textContent = ""; $("#msg", ecran).className = "message-jeu";
    $("#avance", ecran).innerHTML = etapes(CALCULS_PAR_SERIE, i);
    afficher();
    direSuite(c.parole.map(texte => ({ texte })));
  }
  async function valider() {
    if (!saisie || bloque) return;
    const msg = $("#msg", ecran);
    essais++;
    if (+saisie === c.res) {
      bloque = true;
      if (essais === 1) premierCoup++;
      etoiles += ETOILES_PAR_REPONSE; etoile(ecran, etoiles);
      msg.className = "message-jeu ok"; msg.textContent = `Bravo ! +${ETOILES_PAR_REPONSE} ⭐`;
      dire(PHRASES.bravo);
      setTimeout(prochain, 1100);
    } else if (essais < 2) {
      msg.className = "message-jeu non"; msg.textContent = "Presque ! Essaie encore 💪";
      dire(PHRASES.presque); saisie = ""; afficher();
    } else {
      bloque = true;
      msg.className = "message-jeu non"; msg.textContent = `La bonne réponse est ${c.res}.`;
      saisie = String(c.res); afficher();
      direSuite([{ texte: PHRASES.bonneReponse }, { texte: String(c.res) }]);
      setTimeout(prochain, 2600);
    }
  }
  async function prochain() {
    i++;
    if (i < CALCULS_PAR_SERIE) return suivant();
    await compter("seriesCalcul");
    if (premierCoup >= REUSSITES_POUR_MONTER && niv < NIVEAUX_CALCUL.length) {
      await changerNiveauCalcul(niv + 1);
      dire(PHRASES.niveauSuivant);
    }
    finir(etoiles);
  }
  $$("#pave button", ecran).forEach(b => b.onclick = () => {
    if (bloque) return;
    const t = b.dataset.t;
    if (t === "✔") return valider();
    if (t === "⌫") saisie = saisie.slice(0, -1);
    else if (saisie.length < 3) saisie += t;
    afficher();
  });
  $("#montrer-aide", ecran).onclick = () => { $("#aide", ecran).innerHTML = c.aide; };
  $("#dire-calc", ecran).onclick = e => direSuite(c.parole.map(texte => ({ texte })), { bouton: e.currentTarget });
  suivant();
}

/* ---------- questions à choix (problèmes des articles, lire les nombres) ---------- */

// questions : [{ question, dire, choix, choixHTML, direChoix(k), reponse, aide, source, grand, reussite, echec }]
function serieDeQuestions(ecran, titre, questions) {
  let i = 0, etoiles = 0;
  function question() {
    const q = questions[i];
    let essais = 0, fini = false;
    ecran.innerHTML = entete(titre, `<div class="points-etapes">${etapes(questions.length, i)}</div>`) + `
      ${q.source ? `<div class="source">${q.source}</div>` : ""}
      <div class="carte question lisible"><button class="hp" id="dire-q" aria-label="Écouter">🔊</button><span>${esc(q.question)}</span></div>
      ${q.grand ? `<div class="nombre-ecrit lisible ${q.grand.chiffres ? "chiffres" : ""}" id="grand">${esc(q.grand.texte)}</div>` : ""}
      ${q.aide ? `<div class="aide sans-deco">${esc(q.aide)}</div>` : ""}
      <div class="choix" style="margin-top:18px">${q.choix.map((c, k) => `<button data-k="${k}"><span class="txt">${esc(c)}</span><span class="dire-choix" aria-label="Écouter">🔊</span></button>`).join("")}</div>
      <div class="message-jeu" id="msg" style="margin-top:18px"></div>
      <div class="bas"><button class="bouton fin" id="suiv" style="visibility:hidden">${i < questions.length - 1 ? "Suivant ▶" : "Terminer ⭐"}</button></div>`;
    $("#retour", ecran).onclick = () => aller("maths");
    if (q.grand && !q.grand.chiffres) decorer($("#grand", ecran));
    decorer($(".question > span", ecran));
    if (!q.choixChiffres) $$(".choix .txt", ecran).forEach(el => decorer(el));
    $("#dire-q", ecran).onclick = e => direSuite(q.dire.map(texte => ({ texte })), { bouton: e.currentTarget });
    direSuite(q.dire.map(texte => ({ texte })));
    $$("[data-k]", ecran).forEach(b => b.onclick = e => {
      const k = +b.dataset.k;
      if (e.target.closest(".dire-choix")) { dire(q.direChoix(k)); return; }
      if (fini || b.classList.contains("faux")) return;
      essais++;
      const msg = $("#msg", ecran);
      if (k === q.reponse) {
        fini = true; b.classList.add("juste");
        etoiles += ETOILES_PAR_REPONSE; etoile(ecran, etoiles);
        msg.className = "message-jeu ok"; msg.textContent = `Bravo ! +${ETOILES_PAR_REPONSE} ⭐`;
        dire(q.reussite);
      } else if (essais < 2) {
        b.classList.add("faux");
        msg.className = "message-jeu non"; msg.textContent = "Presque ! Essaie encore 💪";
        dire(PHRASES.presque);
      } else {
        fini = true; b.classList.add("faux");
        $(`[data-k="${q.reponse}"]`, ecran).classList.add("juste");
        msg.className = "message-jeu non"; msg.textContent = "La bonne réponse est en vert.";
        direSuite(q.echec.map(texte => ({ texte })));
      }
      if (fini) $("#suiv", ecran).style.visibility = "visible";
    });
    $("#suiv", ecran).onclick = () => { i++; if (i < questions.length) question(); else finir(etoiles); };
  }
  question();
}

/* ---------- problèmes des articles lus ---------- */

export function problemes(ecran) {
  const liste = melanger(articlesLus().flatMap(a => a.questions.filter(q => q.type === "calcul").map(q => ({ a, q })))).slice(0, 5);
  if (!liste.length) {
    ecran.innerHTML = entete("📰 Problèmes de mes articles") + `<div class="vide-jeu"><div style="font-size:90px">📖</div><div class="lisible">${esc(PHRASES.lisUnArticle)}</div></div>`;
    $("#retour", ecran).onclick = () => aller("maths");
    dire(PHRASES.lisUnArticle);
    return;
  }
  // mêmes textes que le Défi des nombres de l'article : ils ont déjà leur enregistrement
  serieDeQuestions(ecran, "📰 Problèmes de mes articles", liste.map(({ a, q }) => ({
    source: `${a.emoji || "📄"} D'après « ${esc(a.titre)} »`,
    question: q.question, aide: q.aide, choix: q.choix, reponse: q.reponse,
    dire: [`${q.question} ${q.choix.join(" ? ")} ?`],
    direChoix: k => q.choix[k],
    reussite: `${PHRASES.bravo} ${q.explication || ""}`,
    echec: [`La bonne réponse est : ${q.choix[q.reponse]}. ${q.explication || ""}`]
  })));
}

/* ---------- lire les nombres ---------- */

// nombre à deux chiffres différents, et ses pièges : chiffres inversés (68 / 86), zéro glissé (608)
function nombreAvecPieges() {
  let n;
  do n = hasard(12, Math.min(98, NOMBRES_MAX)); while (n % 10 === 0 || Math.floor(n / 10) === n % 10);
  const d = Math.floor(n / 10), u = n % 10, inverse = u * 10 + d;
  return { n, pieges: [inverse, d * 100 + u] };
}

export function lireNombres(ecran) {
  const questions = Array.from({ length: NOMBRES_PAR_SERIE }, (_, k) => {
    const { n, pieges } = nombreAvecPieges(), sorte = k % 3;
    if (sorte === 0) { // lettres → chiffres
      const choix = melanger([n, ...pieges]);
      return { question: PHRASES.nombreQuel, grand: { texte: enLettres(n) }, choixChiffres: true,
        choix: choix.map(String), reponse: choix.indexOf(n), dire: [PHRASES.nombreQuel, String(n)],
        direChoix: k2 => String(choix[k2]), reussite: PHRASES.bravo, echec: [PHRASES.bonneReponse, String(n)] };
    }
    if (sorte === 1) { // chiffres → lettres
      const choix = melanger([n, pieges[0], n + 10 <= 99 ? n + 10 : n - 10]);
      return { question: PHRASES.nombreEcrit, grand: { texte: String(n), chiffres: true },
        choix: choix.map(enLettres), reponse: choix.indexOf(n), dire: [PHRASES.nombreEcrit, String(n)],
        direChoix: k2 => String(choix[k2]), reussite: PHRASES.bravo, echec: [PHRASES.bonneReponse, String(n)] };
    }
    const choix = melanger([n, pieges[0]]), grand = Math.max(...choix); // le plus grand
    return { question: PHRASES.plusGrand, choixChiffres: true, choix: choix.map(String), reponse: choix.indexOf(grand),
      dire: [PHRASES.plusGrand, String(choix[0]), PHRASES.ou, String(choix[1])],
      direChoix: k2 => String(choix[k2]), reussite: PHRASES.bravo, echec: [PHRASES.bonneReponse, String(grand)] };
  });
  serieDeQuestions(ecran, "🔢 Lire les nombres", questions);
}
