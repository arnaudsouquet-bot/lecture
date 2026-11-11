// Apprendre : chasse aux infinitifs, atelier des partages (divisions), train de l'alphabet.
// [Arnaud 2026-11-11] « quelque chose de dynamique et amusant ». Des étoiles, pas d'argent de poche.
// Chaque jeu a 5 niveaux, qui suivent la réussite ; ce qu'on demande à chaque niveau est une HYPOTHÈSE.
import {
  ETOILES_PAR_REPONSE, QUESTIONS_PAR_SERIE, IMAGES_MEMOIRE, VERBES_ER, VERBES_AUTRES, PAS_VERBES, PIEGES_VERBES,
  CONJUGUES_ER, CONJUGUES, CONJUGUES_DIFFICILES, PHRASES_A_TROU, AMIS, A_PARTAGER, PARTAGES_PAR_NIVEAU,
  PROBLEMES_PARTAGE, LETTRES, LETTRES_JUMELLES
} from "../config.js";
import { compter, niveauDe, finDeSerie } from "../jeux.js";
import { dire, direSuite } from "../voix.js";
import { decorer } from "../dyslexie.js";
import { PHRASES } from "../phrases.js";
import { entete, brancherRetour, etoile, finir, hub, parolesNombre as N } from "./jeux-commun.js";
import { $, $$, esc, etapes, melanger, hasard, confettis } from "../outils.js";

const auHasard = liste => liste[hasard(0, liste.length - 1)];
const parler = (textes, bouton) => direSuite(textes.map(texte => ({ texte })), { bouton });
const sansDoublons = liste => [...new Set(liste)];

/* ---------- choix du jeu ---------- */

export function apprendre(ecran) {
  hub(ecran, "apprendre");
}

/* ---------- ce que partagent les trois jeux ---------- */

// une série de manches ; chaque manche dessine sa zone puis appelle m.fini(duPremierCoup, paroles, montrer)
function partie(ecran, id, manche) {
  const niv = niveauDe(id), n = QUESTIONS_PAR_SERIE;
  let i = 0, etoiles = 0, reussies = 0;
  function suivante() {
    ecran.innerHTML = entete(id, `<div class="points-etapes">${etapes(n, i)}</div>`) + `
      <div id="zone"></div>
      <div class="message-jeu" id="msg" style="margin-top:14px"></div>
      <div class="bas"><button class="bouton fin" id="suiv" style="visibility:hidden">${i < n - 1 ? "Suivant ▶" : "Terminer ⭐"}</button></div>`;
    brancherRetour(ecran, id);
    const msg = $("#msg", ecran);
    let fait = false;
    const m = {
      zone: $("#zone", ecran), niv, k: i,
      message(texte, sorte = "") { msg.className = "message-jeu " + sorte; msg.textContent = texte; },
      // paroles : ce qui est dit à la fin ; montrer : la bonne réponse est affichée en vert
      fini(ok, paroles, montrer = !ok) {
        if (fait) return;
        fait = true;
        if (ok) { reussies++; etoiles += ETOILES_PAR_REPONSE; etoile(ecran, etoiles); m.message(`Bravo ! +${ETOILES_PAR_REPONSE} ⭐`, "ok"); }
        else m.message(montrer ? "La bonne réponse est en vert." : "C'est fait ! 👍", montrer ? "non" : "");
        parler(paroles || [ok ? PHRASES.bravo : PHRASES.bonneReponse]);
        $("#suiv", ecran).style.visibility = "visible";
      }
    };
    manche(m);
    $("#suiv", ecran).onclick = async () => {
      i++;
      if (i < n) return suivante();
      await compter("seriesApprendre");
      finir(id, etoiles, await finDeSerie(id, reussies / n));
    };
  }
  suivante();
}

// consigne en haut de la manche, avec le bouton 🔊
function consigne(ou, texte, paroles = [texte]) {
  ou.insertAdjacentHTML("beforeend", `<div class="carte question lisible"><button class="hp" aria-label="Écouter">🔊</button><span>${esc(texte)}</span></div>`);
  const carte = ou.lastElementChild;
  decorer($("span", carte));
  $(".hp", carte).onclick = ev => parler(paroles, ev.currentTarget);
  parler(paroles);
}

// question à choix (deux essais, comme les autres jeux), dessinée dans « ou » (la zone par défaut)
// q : { question, dire, grandHTML, aide, choix, choixHTML, reponse, direChoix(k), lettres, apres, echec, juste() }
function aChoix(m, q, ou = m.zone) {
  consigne(ou, q.question, q.dire || [q.question]);
  ou.insertAdjacentHTML("beforeend", `
    ${q.grandHTML ? `<div class="grand-jeu">${q.grandHTML}</div>` : ""}
    ${q.aide ? `<div class="astuce-jeu">${esc(q.aide)}</div>` : ""}
    <div class="choix" style="margin-top:14px">${q.choix.map((c, k) => `<button data-k="${k}">${q.choixHTML ? q.choixHTML[k] : `<span class="txt">${esc(c)}</span>`}${q.direChoix ? `<span class="dire-choix" aria-label="Écouter">🔊</span>` : ""}</button>`).join("")}</div>`);
  if (!q.lettres && !q.choixHTML) $$(".choix .txt", ou).forEach(el => decorer(el));
  let essais = 0, fini = false;
  $$("[data-k]", ou).forEach(b => b.onclick = ev => {
    const k = +b.dataset.k;
    if (ev.target.closest(".dire-choix")) { parler(q.direChoix(k)); return; }
    if (fini || b.classList.contains("faux")) return;
    essais++;
    if (k === q.reponse) {
      fini = true; b.classList.add("juste");
      if (q.juste) q.juste();
      m.fini(essais === 1, q.apres);
    } else if (essais < 2) {
      b.classList.add("faux"); m.message("Presque ! Essaie encore 💪", "non"); dire(PHRASES.presque);
    } else {
      fini = true; b.classList.add("faux");
      $(`[data-k="${q.reponse}"]`, ou).classList.add("juste");
      if (q.juste) q.juste();
      m.fini(false, q.echec);
    }
  });
}

// trois ou quatre nombres proches, sans négatif ni doublon
function nombresAutour(juste, combien = 4) {
  const faux = sansDoublons([juste + 1, juste - 1, juste + 2, juste - 2, juste * 2]).filter(x => x >= 0 && x !== juste);
  return melanger([juste, ...melanger(faux).slice(0, combien - 1)]);
}

/* ---------- chasse aux infinitifs ---------- */
// niveau 1 : bulles et « lequel est un verbe ? » ; 2 : pièges en -er / -ir et « il mange → manger » ;
// 3 : verbes en -ir, -re, -oir ; 4 : être, avoir, aller, faire… ; 5 : -er, -é ou -e dans une phrase

const infinitifsDe = liste => sansDoublons(liste.map(x => x[1]));
const radical = mot => mot.replace(/(er|é|e)$/, "");

// des bulles flottent ; on éclate seulement les verbes à l'infinitif
function bulles(m, verbes, autres) {
  const mots = melanger([...verbes.map(([mot, emo]) => ({ mot, emo, verbe: true })), ...autres.map(([mot, emo]) => ({ mot, emo, verbe: false }))]);
  consigne(m.zone, PHRASES.bullesConsigne, [PHRASES.bullesConsigne, PHRASES.astuceJeVais]);
  m.zone.insertAdjacentHTML("beforeend", `
    <div class="astuce-jeu">${esc(PHRASES.astuceJeVais)}</div>
    <div class="bulles-jeu">${mots.map((x, k) => `<button class="bulle-mot" data-k="${k}" style="animation-delay:-${(k * 0.9) % 3}s;animation-duration:${2.6 + (k % 3) * 0.5}s">
      <span class="emo">${x.emo}</span><span class="txt">${esc(x.mot)}</span></button>`).join("")}</div>`);
  $$(".bulle-mot .txt", m.zone).forEach(el => decorer(el));
  let restants = verbes.length, erreurs = 0;
  $$(".bulle-mot", m.zone).forEach(b => b.onclick = () => {
    if (b.classList.contains("eclate")) return;
    const x = mots[+b.dataset.k];
    if (x.verbe) {
      b.classList.add("eclate"); restants--;
      if (restants) dire(x.mot);
      else { confettis(m.zone, 40); m.fini(erreurs === 0, [x.mot, PHRASES.bravo], false); }
    } else {
      erreurs++;
      b.classList.remove("faux"); void b.offsetWidth; b.classList.add("faux");
      setTimeout(() => b.classList.remove("faux"), 600);
      m.message(`« ${x.mot} » n'est pas un verbe 🙂`, "non");
      parler([x.mot, PHRASES.pasUnVerbe]);
    }
  });
}

// « Lequel est un verbe à l'infinitif ? »
function quelVerbe(m, verbe, autres) {
  const choix = melanger([verbe, ...autres]);
  aChoix(m, {
    question: PHRASES.quelEstVerbe, aide: PHRASES.astuceJeVais, choix: choix.map(x => x[0]),
    choixHTML: choix.map(([mot, emo]) => `<span class="emo-petit">${emo}</span> <span class="txt">${esc(mot)}</span>`),
    reponse: choix.indexOf(verbe), direChoix: k => [choix[k][0]], apres: [PHRASES.bravo, verbe[0]], echec: [PHRASES.bonneReponse, verbe[0]]
  });
  $$(".choix .txt", m.zone).forEach(el => decorer(el));
}

// « il mange » → manger
function infinitifDe(m, [forme, inf], faux) {
  const choix = melanger([inf, ...melanger(faux.filter(x => x !== inf)).slice(0, m.niv >= 3 ? 3 : 2)]);
  aChoix(m, {
    question: PHRASES.quelInfinitif, dire: [PHRASES.quelInfinitif, forme],
    grandHTML: `<div class="verbe-conj lisible">${esc(forme)}</div>`,
    choix, reponse: choix.indexOf(inf), direChoix: k => [choix[k]], apres: [PHRASES.bravo, forme, inf], echec: [PHRASES.bonneReponse, inf]
  });
  decorer($(".verbe-conj", m.zone));
}

// « Je vais ____ une pomme. » : manger, mangé ou mange ?
function phraseATrou(m, [phrase, mot]) {
  const r = radical(mot), choix = melanger([r + "er", r + "é", r + "e"]);
  const trou = phrase.split(" ").map(x => x.replace(/[.,!?]$/, "") === mot ? x.replace(mot, "____") : x).join(" ");
  aChoix(m, {
    question: PHRASES.phraseTrou, dire: [PHRASES.phraseTrou, phrase], aide: PHRASES.astuceMordre,
    grandHTML: `<div class="phrase-trou lisible">${esc(trou)}</div>`,
    choix, reponse: choix.indexOf(mot), apres: [PHRASES.bravo, phrase], echec: [PHRASES.bonneReponse, phrase],
    juste: () => { $(".phrase-trou", m.zone).textContent = phrase; decorer($(".phrase-trou", m.zone)); }
  });
  decorer($(".phrase-trou", m.zone));
}

export function infinitifs(ecran) {
  const tous = [...VERBES_ER, ...VERBES_AUTRES];
  const difficiles = infinitifsDe(CONJUGUES_DIFFICILES), reguliers = [...infinitifsDe(CONJUGUES), ...infinitifsDe(CONJUGUES_ER)];
  const prendre = (liste, n) => melanger(liste).slice(0, n);
  partie(ecran, "infinitifs", m => {
    const { niv, k } = m;
    if (niv === 1) return k % 2 ? quelVerbe(m, auHasard(VERBES_ER), prendre(PAS_VERBES, 2)) : bulles(m, prendre(VERBES_ER, 3), prendre(PAS_VERBES, 5));
    if (niv === 2) {
      if (k % 2 === 0) return bulles(m, prendre(VERBES_ER, 4), [...prendre(PAS_VERBES, 2), ...prendre(PIEGES_VERBES, 2)]);
      const c = auHasard(CONJUGUES_ER);
      return infinitifDe(m, c, [radical(c[1]) + "é", ...infinitifsDe(CONJUGUES_ER)]);
    }
    if (niv === 3) return k % 2 ? infinitifDe(m, auHasard(CONJUGUES), reguliers) : bulles(m, prendre(tous, 4), [...prendre(PAS_VERBES, 1), ...prendre(PIEGES_VERBES, 3)]);
    if (niv === 4) return k % 3 === 2 ? bulles(m, prendre(VERBES_AUTRES, 4), [...prendre(PAS_VERBES, 1), ...prendre(PIEGES_VERBES, 3)]) : infinitifDe(m, auHasard(CONJUGUES_DIFFICILES), difficiles);
    return k % 2 ? infinitifDe(m, auHasard([...CONJUGUES_DIFFICILES, ...CONJUGUES]), [...difficiles, ...reguliers]) : phraseATrou(m, auHasard(PHRASES_A_TROU));
  });
}

/* ---------- atelier des partages ---------- */
// niveaux 1 et 2 : on partage soi-même, objet par objet ; 3 : divisions des tables (on peut voir les paquets) ;
// 4 : partages avec un reste ; 5 : petits problèmes et divisions avec reste

// l'objet s'envole jusqu'à sa nouvelle place
function voler(el, cible) {
  const a = el.getBoundingClientRect();
  cible.append(el);
  const b = el.getBoundingClientRect();
  if (el.animate) el.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(1.4)` }, { transform: "none" }],
    { duration: 450, easing: "cubic-bezier(.3,1.4,.5,1)" });
}
const ecriture = (total, d, q, r) => `${total} : ${d} = ${q}${r ? ` reste ${r}` : ""}`;
const direDivision = (total, d, q, r) => [...N(total), PHRASES.divisePar, ...N(d), PHRASES.egale, ...N(q), ...(r ? [PHRASES.reste, ...N(r)] : [])];
// choix « 3 reste 2 » : la bonne réponse et des erreurs proches
function choixReste(q, r, d) {
  const faux = [[q + 1, r], [q, r + 1 < d ? r + 1 : r - 1], [q - 1, r + d], [r, q]].filter(([a, b]) => a >= 0 && b >= 0 && !(a === q && b === r));
  const tous = melanger([[q, r], ...melanger(faux).slice(0, 3)]);
  return { choix: tous.map(([a, b]) => `${a} reste ${b}`), reponse: tous.findIndex(([a, b]) => a === q && b === r) };
}

function distribuer(m, d, q, r = 0) {
  const amis = melanger(AMIS).slice(0, d), objet = auHasard(A_PARTAGER), total = d * q + r;
  consigne(m.zone, PHRASES.partageConsigne);
  m.zone.insertAdjacentHTML("beforeend", `
    <div class="partage-titre"><b>${total}</b> ${objet} pour <b>${d}</b> amis</div>
    <div class="assiettes">${amis.map(a => `<div class="assiette"><div class="ami">${a}</div><div class="dans"></div><span class="compte">0</span></div>`).join("")}
      ${r ? `<div class="assiette reste-boite" style="display:none"><div class="ami">🧺</div><div class="dans"></div><span class="compte">reste</span></div>` : ""}</div>
    <div class="tas">${Array.from({ length: total }, () => `<button class="objet-partage">${objet}</button>`).join("")}</div>
    <div style="text-align:center;margin-top:12px"><button class="bouton clair petit" id="tour">🔄 Un pour chacun</button></div>
    <div id="suite-partage"></div>`);
  const assiettes = $$(".assiette:not(.reste-boite)", m.zone), boite = $(".reste-boite", m.zone);
  let donnes = 0, resteDit = false;
  function donner(el) {
    if (donnes < d * q) {
      const a = assiettes[donnes % d], c = $(".compte", a);
      voler(el, $(".dans", a));
      c.textContent = +c.textContent + 1;
      c.classList.remove("pop"); void c.offsetWidth; c.classList.add("pop");
    } else {
      boite.style.display = "";
      voler(el, $(".dans", boite));
      if (!resteDit) { resteDit = true; m.message(PHRASES.partageReste); dire(PHRASES.partageReste); }
    }
    donnes++;
    if (donnes === total) question();
  }
  $$(".tas .objet-partage", m.zone).forEach(el => el.onclick = () => { if (el.closest(".tas")) donner(el); });
  // un tour : un objet pour chaque ami (ou le reste), l'un après l'autre
  $("#tour", m.zone).onclick = () => {
    const tas = $$(".tas .objet-partage", m.zone), n = donnes < d * q ? Math.min(d, tas.length) : tas.length;
    tas.slice(0, n).forEach((el, k) => setTimeout(() => { if (el.closest(".tas")) donner(el); }, k * 160));
  };
  function question() {
    $("#tour", m.zone).parentElement.remove();
    $(".tas", m.zone).remove();
    const ou = $("#suite-partage", m.zone), fin = () => ou.insertAdjacentHTML("beforeend", `<div class="ecriture-division">${ecriture(total, d, q, r)}</div>`);
    const paroles = direDivision(total, d, q, r);
    if (r) aChoix(m, { question: PHRASES.partageChacunReste, ...choixReste(q, r, d), apres: [PHRASES.bravo, ...paroles], echec: paroles, juste: fin }, ou);
    else {
      const choix = nombresAutour(q, 3);
      aChoix(m, { question: PHRASES.partageChacun, choix: choix.map(String), reponse: choix.indexOf(q), lettres: true, apres: [PHRASES.bravo, ...paroles], echec: paroles, juste: fin }, ou);
    }
    ou.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

// « 24 : 6 = ? », avec un bouton pour voir les paquets
function division(m, d, q, r = 0) {
  const total = d * q + r, objet = auHasard(A_PARTAGER);
  const paquets = `<div class="paquets" style="display:none">${Array.from({ length: q }, () => `<span>${objet.repeat(d)}</span>`).join("")}${r ? `<span class="reste">${objet.repeat(r)}</span>` : ""}</div>`;
  const base = { question: r ? PHRASES.divisionReste : PHRASES.divisionCombien, dire: [...N(total), PHRASES.divisePar, ...N(d), PHRASES.egaleCombien],
    grandHTML: `<div class="operation-petite">${total} : ${d} = ?</div>`, lettres: true,
    apres: [PHRASES.bravo, ...direDivision(total, d, q, r)], echec: direDivision(total, d, q, r) };
  if (r) aChoix(m, { ...base, ...choixReste(q, r, d) });
  else { const choix = nombresAutour(q); aChoix(m, { ...base, choix: choix.map(String), reponse: choix.indexOf(q) }); }
  m.zone.insertAdjacentHTML("beforeend", `<div style="text-align:center;margin-top:14px"><button class="bouton clair petit" id="voir">🔍 Voir les paquets de ${d}</button></div>${paquets}`);
  $("#voir", m.zone).onclick = ev => { ev.currentTarget.remove(); $(".paquets", m.zone).style.display = ""; };
}

// « Il y a 28 roues. Une voiture a 4 roues. Combien de voitures ? »
function probleme(m) {
  const [texte, emo] = auHasard(PROBLEMES_PARTAGE), d = +texte.match(/\d+/)[0], q = hasard(2, 9), total = d * q, choix = nombresAutour(q);
  aChoix(m, {
    question: `${PHRASES.ilYA} ${total} ${texte}`, dire: [PHRASES.ilYA, ...N(total), texte],
    grandHTML: `<div class="operation-petite">${emo} ${total} : ${d} = ?</div>`, lettres: true,
    choix: choix.map(String), reponse: choix.indexOf(q), apres: [PHRASES.bravo, ...direDivision(total, d, q)], echec: direDivision(total, d, q)
  });
}

export function partages(ecran) {
  partie(ecran, "partages", m => {
    const { niv, k } = m, p = PARTAGES_PAR_NIVEAU[niv - 1];
    const d = hasard(...p.amis), q = hasard(...p.parts), r = p.reste ? hasard(1, d - 1) : 0;
    if (niv <= 2) return distribuer(m, d, q);
    if (niv === 3) return k % 3 === 0 ? distribuer(m, Math.min(d, 5), Math.min(q, 6)) : division(m, d, q);
    if (niv === 4) return k % 2 === 0 ? distribuer(m, d, q, r) : division(m, d, q, r);
    return k % 2 === 0 ? probleme(m) : division(m, d, q, r);
  });
}

/* ---------- train de l'alphabet ---------- */
// niveau 1 : écouter une lettre ; 2 : lettres qui se ressemblent (b d p q…) ; 3 : avant, après, le wagon qui manque ;
// 4 : ranger des lettres ; 5 : ranger des mots dans l'ordre de l'alphabet

const nomLettre = l => LETTRES.find(x => x[1] === l.toUpperCase())[0];
const lettre = (i, min) => (min ? LETTRES[i][1].toLowerCase() : LETTRES[i][1]);
const initiale = mot => mot.normalize("NFD")[0].toLowerCase();
const train = wagons => `<div class="train"><span class="loco">🚂</span>${wagons}</div>`;
const partir = m => { const t = $(".train", m.zone); if (t) setTimeout(() => t.classList.add("part"), 500); };

// « Écoute bien et touche la lettre : bé »
function ecouteLettre(m, min) {
  let choix;
  if (min) choix = melanger(auHasard(LETTRES_JUMELLES));
  else choix = melanger(LETTRES).slice(0, 4).map(x => x[1]);
  const juste = auHasard(choix);
  aChoix(m, {
    question: PHRASES.lettreTouche, dire: [PHRASES.lettreTouche, nomLettre(juste)], lettres: true,
    choix, choixHTML: choix.map(l => `<span class="lettre-choix">${l}</span>`), reponse: choix.indexOf(juste),
    apres: [PHRASES.bravo, nomLettre(juste)], echec: [PHRASES.bonneReponse, nomLettre(juste)]
  });
}

// le wagon qui manque : L M ? O P
function wagonQuiManque(m, min) {
  const s = hasard(0, LETTRES.length - 5), trou = hasard(1, 3), juste = lettre(s + trou, min);
  const voisins = [s + trou - 1, s + trou + 1, s + trou + 2, s + trou - 2].filter(i => i >= 0 && i < LETTRES.length);
  const choix = melanger([juste, ...melanger(sansDoublons(voisins.map(i => lettre(i, min)))).filter(l => l !== juste).slice(0, 3)]);
  aChoix(m, {
    question: PHRASES.lettreManque, lettres: true,
    grandHTML: train(Array.from({ length: 5 }, (_, k) => k === trou ? `<span class="wagon trou">?</span>` : `<span class="wagon">${lettre(s + k, min)}</span>`).join("")),
    choix, choixHTML: choix.map(l => `<span class="lettre-choix">${l}</span>`), reponse: choix.indexOf(juste),
    apres: [nomLettre(juste), PHRASES.tchou], echec: [PHRASES.bonneReponse, nomLettre(juste)],
    juste: () => { const w = $(".wagon.trou", m.zone); w.className = "wagon juste"; w.textContent = juste; partir(m); }
  });
}

// « Quelle lettre vient juste après M ? »
function avantApres(m, min) {
  const apres = Math.random() < 0.6, i = apres ? hasard(0, LETTRES.length - 2) : hasard(1, LETTRES.length - 1);
  const l = lettre(i, min), j = apres ? i + 1 : i - 1, juste = lettre(j, min);
  const pieges = [apres ? i - 1 : i + 1, j + (apres ? 1 : -1), i].filter(x => x >= 0 && x < LETTRES.length && x !== j);
  const choix = melanger([juste, ...sansDoublons(pieges.map(x => lettre(x, min)))].slice(0, 4));
  const question = `${apres ? PHRASES.lettreApres : PHRASES.lettreAvant} ${l} ?`;
  aChoix(m, {
    question, dire: [apres ? PHRASES.lettreApres : PHRASES.lettreAvant, nomLettre(l)], lettres: true,
    grandHTML: train(apres ? `<span class="wagon">${l}</span><span class="wagon trou">?</span>` : `<span class="wagon trou">?</span><span class="wagon">${l}</span>`),
    choix, choixHTML: choix.map(x => `<span class="lettre-choix">${x}</span>`), reponse: choix.indexOf(juste),
    apres: [nomLettre(juste), PHRASES.tchou], echec: [PHRASES.bonneReponse, nomLettre(juste)],
    juste: () => { const w = $(".wagon.trou", m.zone); w.className = "wagon juste"; w.textContent = juste; partir(m); }
  });
}

// ranger des lettres ou des mots dans les wagons, dans l'ordre de l'alphabet
function rangerTrain(m, elements, paroleConsigne) {
  // elements : [{ texte (affiché), html, cle (pour l'ordre), dit (dit à voix haute) }]
  const ordre = [...elements].sort((a, b) => a.cle.localeCompare(b.cle, "fr"));
  const mots = elements.some(e => e.texte.length > 1);
  consigne(m.zone, paroleConsigne);
  m.zone.insertAdjacentHTML("beforeend", `
    <div class="grand-jeu">${train(ordre.map(() => `<span class="wagon trou ${mots ? "mot" : ""}">?</span>`).join(""))}</div>
    <div class="etiquettes">${melanger(ordre).map(e => `<button class="etiquette-nb ${mots ? "mot" : ""}" data-cle="${esc(e.cle)}">${e.html}</button>`).join("")}</div>`);
  let attendu = 0, erreurs = 0;
  $$(".etiquettes .etiquette-nb", m.zone).forEach(b => b.onclick = () => {
    if (b.disabled || attendu >= ordre.length) return;
    const e = ordre[attendu];
    if (b.dataset.cle === e.cle) {
      const w = $$(".wagon", m.zone)[attendu];
      w.className = `wagon juste ${mots ? "mot" : ""}`; w.innerHTML = e.html;
      b.disabled = true; attendu++;
      if (attendu < ordre.length) dire(e.dit);
      else { partir(m); m.fini(erreurs === 0, [e.dit, PHRASES.tchou], false); }
    } else {
      erreurs++;
      b.classList.remove("faux"); void b.offsetWidth; b.classList.add("faux");
      setTimeout(() => b.classList.remove("faux"), 600);
      dire(PHRASES.essaieEncore);
    }
  });
}

function rangerLettres(m, combien, min) {
  const indices = melanger([...LETTRES.keys()]).slice(0, combien);
  rangerTrain(m, indices.map(i => { const l = lettre(i, min); return { texte: l, html: l, cle: String.fromCharCode(97 + i), dit: LETTRES[i][0] }; }), PHRASES.rangerLettres);
}

function rangerMots(m, combien) {
  // des mots enregistrés, qui commencent tous par une lettre différente ; la première lettre est en couleur
  const vus = new Set(), mots = melanger([...PAS_VERBES, ...PIEGES_VERBES, ...IMAGES_MEMOIRE]).filter(([mot]) => !vus.has(initiale(mot)) && vus.add(initiale(mot))).slice(0, combien);
  rangerTrain(m, mots.map(([mot, emo]) => ({ texte: mot, cle: mot.normalize("NFD").toLowerCase(), dit: mot,
    html: `<span class="emo-petit">${emo}</span> <b class="initiale">${esc(mot[0])}</b>${esc(mot.slice(1))}` })), PHRASES.rangerMots);
}

export function alphabet(ecran) {
  partie(ecran, "alphabet", m => {
    const { niv, k } = m;
    if (niv === 1) return k % 3 === 2 ? wagonQuiManque(m, false) : ecouteLettre(m, false);
    if (niv === 2) return k % 2 ? wagonQuiManque(m, false) : ecouteLettre(m, true);
    if (niv === 3) return k % 2 ? wagonQuiManque(m, true) : avantApres(m, false);
    if (niv === 4) return k % 2 ? avantApres(m, true) : rangerLettres(m, 4, false);
    return k % 2 ? rangerLettres(m, 5, true) : rangerMots(m, 4);
  });
}
