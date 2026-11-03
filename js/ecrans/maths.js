// Mathématique : calcul mental, problèmes des articles, lire les nombres, ranger les nombres, les formes, logique.
// Des étoiles, pas d'argent de poche. Chaque jeu a ses niveaux, qui suivent la réussite.
import { ETOILES_PAR_REPONSE, NIVEAUX_CALCUL, CALCULS_PAR_SERIE, NOMBRES_PAR_NIVEAU, QUESTIONS_PAR_SERIE, FORMES } from "../config.js";
import { lire } from "../store.js";
import { article } from "../articles.js";
import { compter, niveauDe, finDeSerie } from "../jeux.js";
import { dire, direSuite } from "../voix.js";
import { PHRASES } from "../phrases.js";
import { entete, brancherRetour, etoile, finir, rienAJouer, hub, serieDeQuestions, parolesNombre, direNombre } from "./jeux-commun.js";
import { $, $$, esc, etapes, melanger, hasard, enLettres } from "../outils.js";

const articlesLus = () => [...new Set(lire("journal", []).map(j => j.article))].map(article).filter(Boolean);

/* ---------- choix du jeu ---------- */

export function maths(ecran) {
  const niv = niveauDe("calcul"), lus = articlesLus().length;
  hub(ecran, "maths", {
    calcul: `Niveau ${niv} : ${NIVEAUX_CALCUL[niv - 1].titre}`,
    problemes: lus ? `${lus} article${lus > 1 ? "s" : ""} lu${lus > 1 ? "s" : ""}` : "Lis d'abord un article"
  });
}

/* ---------- calcul mental ---------- */

const pommes = n => "🍎".repeat(n);
const auHasard = liste => liste[hasard(0, liste.length - 1)];
// un calcul du niveau : texte affiché, morceaux à dire (enregistrés), résultat, aide.
// « trou » : le « ? » du texte est la case à remplir (le nombre qui manque)
function calculDuNiveau(niv) {
  const n = NIVEAUX_CALCUL[niv - 1], N = parolesNombre;
  const dit = (a, mot, b) => [...N(a), mot, ...N(b), PHRASES.egaleCombien];
  const decompose = (a, signe, b) => `${a} ${signe} ${b} = ${a} ${signe} ${b - (b % 10)} ${signe} ${b % 10}`;
  const op = n.op === "+-" ? auHasard(["+", "-"]) : n.op;
  if (op === "+") {
    let a, b;
    if (n.max <= 20) { a = hasard(3, n.max - 2); b = hasard(2, n.max - a); }
    else if (n.max <= 100) do { a = hasard(11, 79); b = hasard(11, n.max - a); } while (a % 10 + b % 10 < 10); // avec retenue
    else { a = hasard(120, 700); b = hasard(110, n.max - a); }
    return { texte: `${a} + ${b}`, parole: dit(a, PHRASES.plus, b), res: a + b, aide: a + b <= 20 ? `${pommes(a)} + ${pommes(b)}` : decompose(a, "+", b) };
  }
  if (op === "-") {
    let a, b;
    if (n.max <= 20) { a = hasard(8, n.max); b = hasard(2, a - 1); }
    else if (n.max <= 100) do { a = hasard(31, 99); b = hasard(12, a - 5); } while (a % 10 >= b % 10); // avec retenue
    else { a = hasard(300, n.max); b = hasard(110, a - 50); }
    const aide = a <= 20 ? `${pommes(a - b)}<span class="barre">${pommes(b)}</span>` : decompose(a, "−", b);
    return { texte: `${a} − ${b}`, parole: dit(a, PHRASES.moins, b), res: a - b, aide };
  }
  if (op === "double") {
    if (Math.random() < 0.5) { const a = hasard(11, n.max); return { texte: `${a} + ${a}`, parole: dit(a, PHRASES.plus, a), res: 2 * a, aide: `${a} + ${a} = ${a - (a % 10)} + ${a - (a % 10)} + ${a % 10} + ${a % 10}` }; }
    const m = 2 * hasard(6, n.max), gros = m - (m % 20), reste = m % 20;
    return { texte: `la moitié de ${m}`, parole: [PHRASES.moitieDe, ...N(m), PHRASES.egaleCombien], res: m / 2,
      aide: gros ? `${m} = ${gros} + ${reste} → moitié de ${gros} = ${gros / 2}, puis moitié de ${reste}` : `${pommes(m)} → 2 parts égales` };
  }
  const t = auHasard(n.tables || [2]);
  if (op === "x") { const b = hasard(2, 10); return { texte: `${b} × ${t}`, parole: dit(b, PHRASES.fois, t), res: b * t, aide: `${b} × ${t} = ${Array(b).fill(t).join(" + ")}` }; }
  if (op === ":") {
    const q = hasard(2, 10), a = t * q;
    return { texte: `${a} : ${t}`, parole: dit(a, PHRASES.divisePar, t), res: q, aide: `Pense à la table de ${t} : ${t} × ? = ${a}` };
  }
  if (op === "?") {
    const sorte = hasard(0, 2);
    if (sorte === 0) { const q = hasard(2, 10); return { texte: `? × ${t} = ${t * q}`, trou: true, res: q, aide: `${t * q} : ${t} = ?`,
      parole: [PHRASES.quelNombre, PHRASES.fois, ...N(t), PHRASES.egale, ...N(t * q)] }; }
    if (sorte === 1) { const a = hasard(12, 60), b = hasard(12, n.max - a); return { texte: `? + ${b} = ${a + b}`, trou: true, res: a, aide: `${a + b} − ${b} = ?`,
      parole: [PHRASES.quelNombre, PHRASES.plus, ...N(b), PHRASES.egale, ...N(a + b)] }; }
    const a = hasard(30, 99), b = hasard(11, a - 5);
    return { texte: `${a} − ? = ${a - b}`, trou: true, res: b, aide: `${a} − ${a - b} = ?`,
      parole: [...N(a), PHRASES.moins, PHRASES.quelNombre, PHRASES.egale, ...N(a - b)] };
  }
  if (op === "x2") {
    if (Math.random() < 0.25) { const a = hasard(3, 99), fois = a < 10 ? 100 : 10; return { texte: `${a} × ${fois}`, parole: dit(a, PHRASES.fois, fois), res: a * fois, aide: `× ${fois} : on ajoute ${fois === 10 ? "un zéro" : "deux zéros"}` }; }
    const a = hasard(12, 49);
    return { texte: `${a} × ${t}`, parole: dit(a, PHRASES.fois, t), res: a * t, aide: `${a} × ${t} = ${a - (a % 10)} × ${t} + ${a % 10} × ${t}` };
  }
  // deux étapes, de gauche à droite (la multiplication vient toujours en premier)
  const sorte = hasard(0, 2), b = hasard(2, 9);
  if (sorte === 0) { const c = hasard(2, 30); return { texte: `${t} × ${b} + ${c}`, res: t * b + c, aide: `D'abord ${t} × ${b}, puis + ${c}`,
    parole: [...N(t), PHRASES.fois, ...N(b), PHRASES.plus, ...N(c), PHRASES.egaleCombien] }; }
  if (sorte === 1) { const c = hasard(1, t * b - 1); return { texte: `${t} × ${b} − ${c}`, res: t * b - c, aide: `D'abord ${t} × ${b}, puis − ${c}`,
    parole: [...N(t), PHRASES.fois, ...N(b), PHRASES.moins, ...N(c), PHRASES.egaleCombien] }; }
  const a = hasard(20, 80), d = hasard(11, 50), c = hasard(11, a + d - 5);
  return { texte: `${a} + ${d} − ${c}`, res: a + d - c, aide: `D'abord ${a} + ${d}, puis − ${c}`,
    parole: [...N(a), PHRASES.plus, ...N(d), PHRASES.moins, ...N(c), PHRASES.egaleCombien] };
}

export function calcul(ecran) {
  const niv = niveauDe("calcul"), niveau = NIVEAUX_CALCUL[niv - 1];
  let i = 0, premierCoup = 0, etoiles = 0, c = null, saisie = "", essais = 0, bloque = false;
  ecran.innerHTML = entete("calcul", `<div class="points-etapes" id="avance"></div>`) + `
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
  brancherRetour(ecran, "calcul");

  const afficher = () => {
    const op = $("#operation", ecran);
    op.classList.toggle("long", c.texte.length > 9);
    const rep = `<span class="rep">${saisie || "&nbsp;"}</span>`;
    op.innerHTML = c.trou ? esc(c.texte).replace("?", rep) : `${esc(c.texte)} = ${rep}`;
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
  function valider() {
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
      direSuite([PHRASES.bonneReponse, ...parolesNombre(c.res)].map(texte => ({ texte })));
      setTimeout(prochain, 2600);
    }
  }
  async function prochain() {
    i++;
    if (i < CALCULS_PAR_SERIE) return suivant();
    await compter("seriesCalcul");
    const resultat = await finDeSerie("calcul", premierCoup / CALCULS_PAR_SERIE);
    finir("calcul", etoiles, resultat);
  }
  $$("#pave button", ecran).forEach(b => b.onclick = () => {
    if (bloque) return;
    const t = b.dataset.t;
    if (t === "✔") return valider();
    if (t === "⌫") saisie = saisie.slice(0, -1);
    else if (saisie.length < 4) saisie += t;
    afficher();
  });
  $("#montrer-aide", ecran).onclick = () => { $("#aide", ecran).innerHTML = c.aide; };
  $("#dire-calc", ecran).onclick = e => direSuite(c.parole.map(texte => ({ texte })), { bouton: e.currentTarget });
  suivant();
}

/* ---------- problèmes des articles lus (pas de niveau) ---------- */

export function problemes(ecran) {
  const liste = melanger(articlesLus().flatMap(a => a.questions.filter(q => q.type === "calcul").map(q => ({ a, q })))).slice(0, 5);
  if (!liste.length) return rienAJouer(ecran, "problemes");
  // mêmes textes que le Défi des nombres de l'article : ils ont déjà leur enregistrement
  serieDeQuestions(ecran, "problemes", liste.map(({ a, q }) => ({
    source: `${a.emoji || "📄"} D'après « ${esc(a.titre)} »`,
    question: q.question, aide: q.aide, choix: q.choix, reponse: q.reponse,
    dire: [`${q.question} ${q.choix.join(" ? ")} ?`],
    direChoix: k => [q.choix[k]],
    reussite: `${PHRASES.bravo} ${q.explication || ""}`,
    echec: [`La bonne réponse est : ${q.choix[q.reponse]}. ${q.explication || ""}`]
  })), etoiles => finir("problemes", etoiles));
}

/* ---------- lire les nombres ---------- */

// nombre du niveau et ses pièges : chiffres inversés (68 / 86), zéro glissé (608), chiffre en trop ou en moins
function nombreAvecPieges(max) {
  const min = max <= 20 ? 11 : Math.max(12, max / 10 + 1);
  let n, s;
  do { n = hasard(min, max - 1); s = String(n); } while (new Set(s).size < s.length || s.includes("0") && max <= 100);
  const pieges = new Set();
  for (let i = 0; i < s.length - 1; i++) pieges.add(+(s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2)));
  pieges.add(+(s[0] + "0" + s.slice(1)));
  if (s.length > 2) pieges.add(+(s.slice(0, -1)));
  pieges.add(n + (max <= 100 ? 10 : max / 10));
  pieges.delete(n);
  return { n, pieges: melanger([...pieges].filter(x => x > 0)).slice(0, 2) };
}

export function lireNombres(ecran) {
  const max = NOMBRES_PAR_NIVEAU[niveauDe("lire-nombres") - 1];
  const questions = Array.from({ length: QUESTIONS_PAR_SERIE }, (_, k) => {
    const { n, pieges } = nombreAvecPieges(max), sorte = k % 3;
    if (sorte === 0) { // lettres → chiffres
      const choix = melanger([n, ...pieges]);
      return { question: PHRASES.nombreQuel, grand: { texte: enLettres(n) }, choixChiffres: true,
        choix: choix.map(String), reponse: choix.indexOf(n), dire: [PHRASES.nombreQuel, ...parolesNombre(n)],
        direChoix: k2 => parolesNombre(choix[k2]), echec: [PHRASES.bonneReponse, ...parolesNombre(n)] };
    }
    if (sorte === 1) { // chiffres → lettres
      const choix = melanger([n, ...pieges]).filter(x => x < 10000);
      return { question: PHRASES.nombreEcrit, grand: { texte: String(n), chiffres: true },
        choix: choix.map(enLettres), reponse: choix.indexOf(n), dire: [PHRASES.nombreEcrit, ...parolesNombre(n)],
        direChoix: k2 => parolesNombre(choix[k2]), echec: [PHRASES.bonneReponse, ...parolesNombre(n)] };
    }
    const choix = melanger([n, pieges[0]]), grand = Math.max(...choix);
    return { question: PHRASES.plusGrand, choixChiffres: true, choix: choix.map(String), reponse: choix.indexOf(grand),
      dire: [PHRASES.plusGrand, ...parolesNombre(choix[0]), PHRASES.ou, ...parolesNombre(choix[1])],
      direChoix: k2 => parolesNombre(choix[k2]), echec: [PHRASES.bonneReponse, ...parolesNombre(grand)] };
  });
  serieDeQuestions(ecran, "lire-nombres", questions, async (etoiles, reussite) => {
    finir("lire-nombres", etoiles, await finDeSerie("lire-nombres", reussite));
  });
}

/* ---------- ranger les nombres : ranger des étiquettes, compléter une suite ---------- */

const PAS_PAR_NIVEAU = [[1, 2], [2, 5, 10], [10, 25, 50, 100], [100, 250, 500, 1000]];

export function ranger(ecran) {
  const niv = niveauDe("ranger"), max = NOMBRES_PAR_NIVEAU[niv - 1];
  let i = 0, parfaites = 0, etoiles = 0;

  function etiquettes() {
    const decroissant = niv >= 3 && i % 4 === 2, combien = niv === 1 ? 4 : 5;
    const nombres = new Set();
    while (nombres.size < combien) nombres.add(hasard(0, max));
    const ordre = [...nombres].sort((a, b) => (decroissant ? b - a : a - b));
    let attendu = 0, erreurs = 0;
    const consigne = decroissant ? PHRASES.rangerDecroissant : PHRASES.rangerCroissant;
    ecran.innerHTML = entete("ranger", `<div class="points-etapes">${etapes(QUESTIONS_PAR_SERIE, i)}</div>`) + `
      <div class="carte question lisible"><button class="hp" id="dire-q" aria-label="Écouter">🔊</button><span>${esc(consigne)}</span></div>
      <div class="rangee" id="rangee">${ordre.map(() => `<div class="case-nb vide">?</div>`).join("")}</div>
      <div class="etiquettes" id="etiquettes">${melanger(ordre).map(x => `<button class="etiquette-nb" data-n="${x}">${x}</button>`).join("")}</div>
      <div class="message-jeu" id="msg"></div>
      <div class="bas"><button class="bouton fin" id="suiv" style="visibility:hidden">${i < QUESTIONS_PAR_SERIE - 1 ? "Suivant ▶" : "Terminer ⭐"}</button></div>`;
    brancherRetour(ecran, "ranger");
    $("#dire-q", ecran).onclick = ev => dire(consigne, { bouton: ev.currentTarget });
    dire(consigne);
    $$(".etiquette-nb", ecran).forEach(b => b.onclick = () => {
      if (attendu >= ordre.length || b.disabled) return;
      const x = +b.dataset.n;
      if (x === ordre[attendu]) {
        const c = $$(".case-nb", ecran)[attendu];
        c.className = "case-nb juste"; c.textContent = x;
        b.disabled = true; attendu++;
        direNombre(x);
        if (attendu === ordre.length) fin(erreurs === 0);
      } else {
        erreurs++;
        b.classList.remove("faux"); void b.offsetWidth; b.classList.add("faux");
        dire(PHRASES.essaieEncore);
      }
    });
  }

  function suite() {
    const pas = melanger(PAS_PAR_NIVEAU[niv - 1])[0], decroissant = niv >= 3 && i % 4 === 3;
    const depart = decroissant ? hasard(5 * pas, Math.max(5 * pas, max)) : hasard(0, Math.max(0, max - 5 * pas));
    const termes = Array.from({ length: 5 }, (_, k) => depart + (decroissant ? -k : k) * pas);
    const juste = termes[4], faux = [juste + (decroissant ? -pas : pas), juste + (juste > 1 ? -1 : 1) * (pas > 1 ? 1 : 2)].filter(x => x >= 0 && x !== juste);
    const choix = melanger([juste, ...faux.slice(0, 2)]);
    serieUne({
      question: PHRASES.suiteQuestion, choixChiffres: true,
      grandHTML: `<div class="suite-nb">${termes.slice(0, 4).map(x => `<span>${x}</span>`).join("")}<span class="trou">?</span></div>`,
      choix: choix.map(String), reponse: choix.indexOf(juste), dire: [PHRASES.suiteQuestion],
      direChoix: k => parolesNombre(choix[k]), echec: [PHRASES.bonneReponse, ...parolesNombre(juste)]
    });
  }

  // une seule question à choix, dans la série « ranger »
  function serieUne(q) {
    let essais = 0, fini = false;
    ecran.innerHTML = entete("ranger", `<div class="points-etapes">${etapes(QUESTIONS_PAR_SERIE, i)}</div>`) + `
      <div class="carte question lisible"><button class="hp" id="dire-q" aria-label="Écouter">🔊</button><span>${esc(q.question)}</span></div>
      <div class="grand-jeu">${q.grandHTML}</div>
      <div class="choix">${q.choix.map((c, k) => `<button data-k="${k}"><span class="txt">${esc(c)}</span><span class="dire-choix" aria-label="Écouter">🔊</span></button>`).join("")}</div>
      <div class="message-jeu" id="msg"></div>
      <div class="bas"><button class="bouton fin" id="suiv" style="visibility:hidden">${i < QUESTIONS_PAR_SERIE - 1 ? "Suivant ▶" : "Terminer ⭐"}</button></div>`;
    brancherRetour(ecran, "ranger");
    $("#dire-q", ecran).onclick = ev => dire(q.question, { bouton: ev.currentTarget });
    dire(q.question);
    $$("[data-k]", ecran).forEach(b => b.onclick = ev => {
      const k = +b.dataset.k;
      if (ev.target.closest(".dire-choix")) { direSuite(q.direChoix(k).map(texte => ({ texte }))); return; }
      if (fini || b.classList.contains("faux")) return;
      essais++;
      if (k === q.reponse) { fini = true; b.classList.add("juste"); fin(essais === 1); }
      else if (essais < 2) { b.classList.add("faux"); $("#msg", ecran).className = "message-jeu non"; $("#msg", ecran).textContent = "Presque ! Essaie encore 💪"; dire(PHRASES.presque); }
      else { fini = true; b.classList.add("faux"); $(`[data-k="${q.reponse}"]`, ecran).classList.add("juste"); fin(false, q.echec); }
    });
  }

  function fin(parfait, echec) {
    const msg = $("#msg", ecran);
    if (parfait) { parfaites++; etoiles += ETOILES_PAR_REPONSE; etoile(ecran, etoiles); msg.className = "message-jeu ok"; msg.textContent = `Bravo ! +${ETOILES_PAR_REPONSE} ⭐`; dire(PHRASES.bravo); }
    else { msg.className = "message-jeu"; msg.textContent = echec ? "La bonne réponse est en vert." : "C'est rangé !"; if (echec) direSuite(echec.map(texte => ({ texte }))); }
    $("#suiv", ecran).style.visibility = "visible";
    $("#suiv", ecran).onclick = async () => {
      i++;
      if (i < QUESTIONS_PAR_SERIE) return (i % 2 ? suite : etiquettes)();
      finir("ranger", etoiles, await finDeSerie("ranger", parfaites / QUESTIONS_PAR_SERIE));
    };
  }

  etiquettes();
}

/* ---------- les formes ---------- */

const COULEURS = ["#5b8def", "#ef6b5b", "#4cb782", "#f2b33d", "#a77de0", "#ef8fc0"];
const polygone = (n, r = 42, tourne = -Math.PI / 2) =>
  Array.from({ length: n }, (_, k) => { const a = tourne + (2 * Math.PI * k) / n; return `${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`; }).join(" ");
function formeSVG(nom, taille = 110, couleur = COULEURS[hasard(0, COULEURS.length - 1)]) {
  const style = `fill="${couleur}" stroke="#2b2b33" stroke-width="3"`;
  const corps = {
    cercle: `<circle cx="50" cy="50" r="40" ${style}/>`,
    ovale: `<ellipse cx="50" cy="50" rx="44" ry="27" ${style}/>`,
    "carré": `<rect x="15" y="15" width="70" height="70" ${style}/>`,
    rectangle: `<rect x="6" y="27" width="88" height="46" ${style}/>`,
    triangle: `<polygon points="${polygone(3, 46, -Math.PI / 2).replace(/(\d+\.\d),(\d+\.\d)/g, (m, x, y) => `${x},${(+y + 8).toFixed(1)}`)}" ${style}/>`,
    losange: `<polygon points="50,6 86,50 50,94 14,50" ${style}/>`,
    pentagone: `<polygon points="${polygone(5)}" ${style}/>`,
    hexagone: `<polygon points="${polygone(6, 42, 0)}" ${style}/>`
  }[nom];
  return `<svg viewBox="0 0 100 100" width="${taille}" height="${taille}" aria-label="${nom}">${corps}</svg>`;
}
const cotes = nom => +FORMES.find(f => f[0] === nom)[1];

export function formes(ecran) {
  const niv = niveauDe("formes");
  const simples = ["cercle", "carré", "triangle", "rectangle"], toutes = FORMES.map(f => f[0]);
  const polygones = toutes.filter(n => cotes(n) > 0);
  const questions = Array.from({ length: QUESTIONS_PAR_SERIE }, (_, k) => {
    const sorte = niv === 1 ? 0 : niv === 2 ? k % 2 : niv === 3 ? [1, 2, 3][k % 3] : [4, 1, 3, 4][k % 4];
    if (sorte === 0) { // touche la forme
      const liste = niv === 1 ? simples : toutes;
      const choix = melanger(liste).slice(0, 3), cible = choix[hasard(0, 2)];
      return { question: `${PHRASES.formeTouche} ${cible}`, dire: [PHRASES.formeTouche, cible],
        choix, choixHTML: choix.map(n => formeSVG(n)), reponse: choix.indexOf(cible), echec: [PHRASES.bonneReponse] };
    }
    if (sorte === 1 || sorte === 2) { // côtés ou coins d'une forme
      const nom = melanger(polygones)[0], n = cotes(nom), q = sorte === 1 ? PHRASES.formeCotes : PHRASES.formeCoins;
      const choix = melanger([n, n + 1, n === 3 ? 4 : n - 1].filter((x, i, a) => a.indexOf(x) === i));
      return { question: q, dire: [q], grandHTML: formeSVG(nom, 170), choixChiffres: true, choix: choix.map(String),
        reponse: choix.indexOf(n), direChoix: x => [String(choix[x])], echec: [PHRASES.bonneReponse, String(n)] };
    }
    if (sorte === 3) { // quelle forme a n côtés ?
      const choix = melanger(polygones.filter((x, i, a) => a.findIndex(y => cotes(y) === cotes(x)) === i)).slice(0, 3);
      const cible = choix[hasard(0, choix.length - 1)], n = cotes(cible);
      return { question: `${PHRASES.formeQuelle} ${n} ${PHRASES.cotesFin}`, dire: [PHRASES.formeQuelle, String(n), PHRASES.cotesFin],
        choix, choixHTML: choix.map(x => formeSVG(x)), reponse: choix.indexOf(cible), echec: [PHRASES.bonneReponse] };
    }
    // compter les formes comme le modèle dans un dessin
    const modele = melanger(toutes)[0], combien = hasard(2, 6), autres = hasard(4, 7);
    const dessin = melanger([...Array(combien).fill(modele), ...Array.from({ length: autres }, () => melanger(toutes.filter(x => x !== modele))[0])]);
    const choix = melanger([combien, combien + 1, combien - 1]);
    return { question: PHRASES.formeCompte, dire: [PHRASES.formeCompte], choixChiffres: true,
      grandHTML: `<div class="modele">${formeSVG(modele, 90)}</div><div class="dessin">${dessin.map(x => formeSVG(x, 76)).join("")}</div>`,
      choix: choix.map(String), reponse: choix.indexOf(combien), direChoix: x => [String(choix[x])], echec: [PHRASES.bonneReponse, String(combien)] };
  });
  serieDeQuestions(ecran, "formes", questions, async (etoiles, reussite) => finir("formes", etoiles, await finDeSerie("formes", reussite)));
}

/* ---------- logique : motifs, intrus, suites de nombres, grilles, pyramides ---------- */

const MOTIFS = [["🍎", "🍌", "🍇", "🍓"], ["🔴", "🔵", "🟢", "🟡"], ["⭐", "🌙", "☀️", "☁️"], ["🐶", "🐱", "🐰", "🦊"]];
const FAMILLES = [["🍎", "🍌", "🍇", "🍓", "🍐", "🍊"], ["🐶", "🐱", "🐰", "🦊", "🐻", "🐸"],
  ["🚗", "🚌", "🚲", "🚂", "✈️", "🚀"], ["☀️", "🌧️", "❄️", "⛈️", "🌈", "🌪️"], ["⚽", "🏀", "🎾", "🏈", "🏐", "🎱"]];
// [Arnaud 2026-11-03] trop facile : chaque niveau mélange plusieurs sortes de questions, de plus en plus dures (HYPOTHÈSE)
const LOGIQUE_PAR_NIVEAU = [
  ["motif", "intrus", "motif", "nombres"],
  ["nombres", "motif", "intrus", "grandit"],
  ["nombres", "grille", "nombres", "grandit"],
  ["deuxRegles", "grille", "pyramide", "nombres"],
  ["deuxRegles", "pyramide", "grille", "deuxRegles"],
  ["difficile", "pyramide", "grille", "deuxRegles"]
];

// suite de nombres du niveau (le dernier terme est la réponse)
function suiteDuNiveau(niv, sorte) {
  if (sorte === "nombres") {
    const r = auHasard(niv === 1 ? [2, 3, 5, 10] : niv === 2 ? [3, 4, 5, -2, -10, "x2"] : [4, 6, 7, 9, 11, -3, -5, -9, "x2", "x3"]);
    if (r === "x2" || r === "x3") { const f = r === "x2" ? 2 : 3, d = hasard(1, f === 2 ? 5 : 2); return Array.from({ length: 5 }, (_, i) => d * f ** i); }
    const d = r < 0 ? hasard(-r * 5 + 1, 99) : hasard(1, niv === 1 ? 20 : 60);
    return Array.from({ length: 5 }, (_, i) => d + i * r);
  }
  if (sorte === "deuxRegles") {
    const d = hasard(1, 20), k = hasard(0, 2);
    if (k === 0) { const a = hasard(3, 6), b = hasard(1, a - 1); return Array.from({ length: 6 }, (_, i) => d + Math.ceil(i / 2) * a - Math.floor(i / 2) * b); } // +a, −b, +a…
    if (k === 1) return Array.from({ length: 6 }, (_, i) => d + (i * (i + 1)) / 2); // +1, +2, +3…
    const pas = hasard(2, 3); return Array.from({ length: 6 }, (_, i) => d + pas * (i * (i + 1)) / 2); // +2, +4, +6… ou +3, +6, +9…
  }
  // les plus dures : ×2 puis +1, les carrés, de 7 à 12 en descendant, ×2 et ×3 qui alternent
  const k = hasard(0, 3);
  if (k === 0) { let x = hasard(1, 3); return Array.from({ length: 5 }, () => { const v = x; x = 2 * x + 1; return v; }); }
  if (k === 1) { const d = hasard(1, 3); return Array.from({ length: 5 }, (_, i) => (d + i) ** 2); }
  if (k === 2) { const pas = auHasard([7, 8, 9, 11, 12]), d = hasard(90, 150); return Array.from({ length: 6 }, (_, i) => d - i * pas); }
  let x = hasard(1, 2); return Array.from({ length: 6 }, (_, i) => { const v = x; x *= i % 2 ? 3 : 2; return v; });
}

// pièges proches de la bonne réponse : ±1, un pas de trop, +10
function nombresProches(juste, dernier, combien) {
  const ecart = juste - dernier;
  const faux = [juste + 1, juste - 1, juste + ecart, juste + 10, juste - 2, juste + 2].filter((x, i, a) => x > 0 && x !== juste && a.indexOf(x) === i);
  return melanger([juste, ...melanger(faux).slice(0, combien - 1)]);
}

// carré latin : chaque image une seule fois par ligne et par colonne
function grilleLatine(n) {
  const images = melanger(melanger(MOTIFS)[0]).slice(0, n), lignes = melanger([...Array(n).keys()]), colonnes = melanger([...Array(n).keys()]);
  return lignes.map(l => colonnes.map(c => images[(l + c) % n]));
}

export function logique(ecran) {
  const niv = niveauDe("logique"), sortes = LOGIQUE_PAR_NIVEAU[niv - 1], nbChoix = niv >= 3 ? 4 : 3;
  const questions = Array.from({ length: QUESTIONS_PAR_SERIE }, (_, k) => {
    const sorte = sortes[k % sortes.length];
    if (sorte === "intrus") {
      const [f1, f2] = melanger(FAMILLES), intrus = melanger(f2)[0];
      const choix = melanger([...melanger(f1).slice(0, nbChoix - 1), intrus]);
      return { question: PHRASES.logiqueIntrus, dire: [PHRASES.logiqueIntrus], choix, choixHTML: choix.map(e => `<span class="emo-choix">${e}</span>`),
        reponse: choix.indexOf(intrus), echec: [PHRASES.bonneReponse] };
    }
    if (sorte === "nombres" || sorte === "deuxRegles" || sorte === "difficile") {
      const termes = suiteDuNiveau(niv, sorte), vus = termes.slice(0, -1), juste = termes[termes.length - 1];
      const choix = nombresProches(juste, vus[vus.length - 1], nbChoix);
      return { question: PHRASES.suiteQuestion, dire: [PHRASES.suiteQuestion], choixChiffres: true,
        grandHTML: `<div class="suite-nb">${vus.map(x => `<span>${x}</span>`).join("")}<span class="trou">?</span></div>`,
        choix: choix.map(String), reponse: choix.indexOf(juste), direChoix: x => parolesNombre(choix[x]), echec: [PHRASES.bonneReponse, ...parolesNombre(juste)] };
    }
    if (sorte === "grandit") { // la figure grandit de 2 (puis de 3) à chaque fois
      const e = melanger(["🔵", "⭐", "🍎", "🟩"])[0], depart = hasard(1, 2), pas = niv >= 3 ? 3 : 2;
      const termes = [0, 1, 2].map(i => e.repeat(depart + i * pas)), juste = depart + 3 * pas;
      const choix = melanger([juste, juste + 1, juste - 1, juste - pas].slice(0, nbChoix));
      return { question: PHRASES.logiqueSuite, dire: [PHRASES.logiqueSuite], choixHTML: choix.map(n => `<span class="emo-petit">${e.repeat(n)}</span>`),
        choix: choix.map(String), grandHTML: `<div class="suite-emo">${termes.map(t => `<span class="emo-petit">${t}</span>`).join("")}<span class="trou">?</span></div>`,
        reponse: choix.indexOf(juste), echec: [PHRASES.bonneReponse] };
    }
    if (sorte === "grille") { // une case vide dans un carré latin (3 × 3, puis 4 × 4)
      const n = niv >= 5 ? 4 : 3, g = grilleLatine(n), l = hasard(0, n - 1), c = hasard(0, n - 1), juste = g[l][c];
      const choix = melanger([...g[0]]).slice(0, nbChoix);
      if (!choix.includes(juste)) choix[0] = juste;
      const cases = g.map((ligne, i) => ligne.map((x, j) => i === l && j === c ? `<span class="trou">?</span>` : `<span>${x}</span>`).join("")).join("");
      return { question: PHRASES.logiqueGrille, dire: [PHRASES.logiqueGrille], choix, choixHTML: choix.map(e => `<span class="emo-choix">${e}</span>`),
        grandHTML: `<div class="grille-logique" style="grid-template-columns:repeat(${n}, 1fr)">${cases}</div>`,
        reponse: choix.indexOf(juste), echec: [PHRASES.bonneReponse] };
    }
    if (sorte === "pyramide") { // chaque brique = la somme des deux du dessous ; au niveau 6, c'est une brique du bas qui manque
      const max = niv >= 6 ? 40 : 20, bas = [hasard(2, max), hasard(2, max), hasard(2, max)];
      const milieu = [bas[0] + bas[1], bas[1] + bas[2]], rangs = [[milieu[0] + milieu[1]], milieu, bas];
      const [r, c] = niv >= 6 ? [2, hasard(0, 2)] : auHasard([[0, 0], [1, 0], [1, 1]]), juste = rangs[r][c];
      const choix = nombresProches(juste, juste - hasard(2, 9), nbChoix);
      const html = rangs.map((rang, i) => `<div class="rang">${rang.map((x, j) => i === r && j === c ? `<span class="trou">?</span>` : `<span>${x}</span>`).join("")}</div>`).join("");
      return { question: PHRASES.logiquePyramide, dire: [PHRASES.logiquePyramide], choixChiffres: true, grandHTML: `<div class="pyramide">${html}</div>`,
        choix: choix.map(String), reponse: choix.indexOf(juste), direChoix: x => parolesNombre(choix[x]), echec: [PHRASES.bonneReponse, ...parolesNombre(juste)] };
    }
    // motifs qui se répètent : ABC, AAB, ABB, ABBC au niveau 1 ; ensuite ABCD, AABBC, ABCC, ABAC
    const m = melanger(melanger(MOTIFS)[0]);
    const formes = niv === 1 ? [[0, 1, 2], [0, 0, 1], [0, 1, 1], [0, 1, 1, 2]] : [[0, 1, 2, 3], [0, 0, 1, 1, 2], [0, 1, 2, 2], [0, 1, 0, 2]];
    const motif = auHasard(formes).map(x => m[x]), longueur = motif.length * 2 + hasard(0, motif.length - 1);
    const termes = Array.from({ length: longueur + 1 }, (_, i) => motif[i % motif.length]);
    const juste = termes[longueur], choix = melanger([juste, ...melanger(m.filter(x => x !== juste)).slice(0, nbChoix - 1)]);
    return { question: PHRASES.logiqueSuite, dire: [PHRASES.logiqueSuite], choix, choixHTML: choix.map(e => `<span class="emo-choix">${e}</span>`),
      grandHTML: `<div class="suite-emo">${termes.slice(0, longueur).map(t => `<span>${t}</span>`).join("")}<span class="trou">?</span></div>`,
      reponse: choix.indexOf(juste), echec: [PHRASES.bonneReponse] };
  });
  serieDeQuestions(ecran, "logique", questions, async (etoiles, reussite) => finir("logique", etoiles, await finDeSerie("logique", reussite)));
}
