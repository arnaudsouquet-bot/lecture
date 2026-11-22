// Le Dojo : la ceinture qu'on prépare, l'adversaire à battre, le parchemin des 64 calculs, et les duels au sabre.
// [Arnaud 2026-11-22] « le monde des ninjas, avec des combats avec sabres » : chaque calcul juste est un coup de sabre ;
// pas de chronomètre ; l'adversaire vaincu disparaît dans un nuage de fumée.
import { CEINTURES, DOJO, ETOILES_PAR_REPONSE } from "../config.js";
import { etatDojo, objectif, faitsDeTables, reussites, maitrise, noter, finDuel, prochainFait } from "../dojo.js";
import { compter, terminer, dernierResultat, etat } from "../jeux.js";
import { aller } from "../session.js";
import { dire, direSuite } from "../voix.js";
import { PHRASES } from "../phrases.js";
import { parolesNombre as N } from "./jeux-commun.js";
import { $, $$, esc, melanger, confettis } from "../outils.js";

const parler = textes => direSuite(textes.map(texte => ({ texte })));
const nomCeinture = c => c.nom[0];
const majuscule = t => t[0].toUpperCase() + t.slice(1);
const ceintureHTML = (c, petite = false) => `<span class="ceinture ${petite ? "petite" : ""}" style="--c:${c.nom[1]}"></span>`;

/* ---------- le dojo ---------- */

export function dojo(ecran) {
  const e = etatDojo(), o = objectif(), faits = faitsDeTables(o.tables), faitsOk = faits.filter(maitrise).length;
  const ordre = CEINTURES.flatMap(c => c.tables);
  ecran.innerHTML = `
    <div class="entete">
      <button class="hp" id="dire-titre" aria-label="Écouter">🔊</button>
      <h1>🥷 Le Dojo</h1>
      <div class="droite"><span class="points-coin">⭐ ${etat().etoiles}</span><button class="bouton clair petit" id="retour">◀ Accueil</button></div>
    </div>
    <div class="dojo">
      <div class="carte dojo-adversaire">
        <div class="emo-adversaire anim-flotte">${o.adversaire[1]}</div>
        <div>
          <div class="petit-gris">${o.revision ? "Révision de toutes les tables" : `Pour ${esc(nomCeinture(o))} ${ceintureHTML(o, true)}`}</div>
          <div class="nom-adversaire">${esc(majuscule(o.adversaire[0]))}</div>
          <div class="petit-gris">${o.tables.length > 2 ? "Toutes les tables" : `Table${o.tables.length > 1 ? "s" : ""} de ${o.tables.join(" et ")}`} · ${faitsOk} / ${faits.length} calculs maîtrisés</div>
          <div class="jauge-dojo"><div style="width:${(faitsOk / faits.length) * 100}%"></div></div>
          <button class="bouton vert" id="combattre">⚔️ Combattre</button>
        </div>
      </div>
      <div class="carte dojo-ceintures">
        <div class="leg">Mes ceintures</div>
        <div class="ceintures">${CEINTURES.map((c, i) => `<div class="${i < e.ceinture ? "gagnee" : "a-gagner"}">${ceintureHTML(c)}<span>${esc(c.nom[0].replace(/^la ceinture /, ""))}</span></div>`).join("")}</div>
        <div class="leg" style="margin-top:14px">Le parchemin des tables</div>
        <div class="parchemin">${ordre.map(t => `<div class="ligne-table"><b>${t}</b>${[2, 3, 4, 5, 6, 7, 8, 9].map(a => {
          const n = Math.min(reussites(`${a}x${t}`), DOJO.reussitesPourMaitriser);
          return `<span class="fait n${n}" title="${a} × ${t}">${n >= DOJO.reussitesPourMaitriser ? "✓" : a * t}</span>`;
        }).join("")}</div>`).join("")}</div>
        <div class="petit-gris">Un calcul devient doré ✓ quand tu le réussis du premier coup ${DOJO.reussitesPourMaitriser} jours différents.</div>
      </div>
    </div>`;
  $("#retour", ecran).onclick = () => aller("accueil");
  $("#dire-titre", ecran).onclick = () => parler([PHRASES.dojoTitre, o.adversaire[0]]);
  $("#combattre", ecran).onclick = () => aller("duel");
  parler([PHRASES.dojoTitre]);
}

/* ---------- le duel ---------- */

// quatre réponses proches : un paquet de plus ou de moins, un de plus ou de moins
function produitsAutour(a, t) {
  const p = a * t, faux = [...new Set([p + t, p - t, p + a, p - a, p + 1, p - 1])].filter(x => x > 0 && x !== p);
  return melanger([p, ...melanger(faux).slice(0, 3)]);
}

export function duel(ecran) {
  const o = objectif(), pvMax = DOJO.pvAdversaire, vus = [], aRevoir = [];
  let pv = pvMax, serie = 0, etoiles = 0, justes = 0, n = 0;
  ecran.innerHTML = `
    <div class="entete">
      <h1>⚔️ Duel</h1>
      <div class="droite"><span class="points-coin" id="etoiles">⭐ ${etat().etoiles}</span><button class="bouton clair petit" id="retour">◀ Le Dojo</button></div>
    </div>
    <div class="arene">
      <div class="combattant heros"><div class="emo-combat" id="heros">🥷</div><div class="nom-combat">Toi</div><div class="combo" id="combo"></div></div>
      <div class="calcul-duel" id="calcul"></div>
      <div class="combattant adversaire"><div class="emo-combat" id="adv">${o.adversaire[1]}</div><div class="nom-combat">${esc(majuscule(o.adversaire[0]))}</div>
        <div class="pv" id="pv"></div></div>
    </div>
    <div id="reponse"></div>
    <div class="message-jeu" id="msg"></div>`;
  $("#retour", ecran).onclick = () => aller("dojo");
  const msg = $("#msg", ecran), adv = $("#adv", ecran), heros = $("#heros", ecran);
  const majPv = () => { $("#pv", ecran).innerHTML = Array.from({ length: pvMax }, (_, i) => `<span class="${i < pv ? "plein" : ""}"></span>`).join(""); };
  const majCombo = () => { $("#combo", ecran).textContent = serie ? "🔥".repeat(Math.min(serie, DOJO.combo)) : ""; };
  const rejouer = (el, classe) => { el.classList.remove(classe); void el.offsetWidth; el.classList.add(classe); };
  majPv();
  dire(PHRASES.enGarde);

  function question() {
    // un calcul raté revient deux questions plus tard
    const f = aRevoir.length && aRevoir[0].dans <= 0 ? aRevoir.shift().fait : prochainFait(vus);
    aRevoir.forEach(x => x.dans--);
    vus.push(f.k);
    n++;
    msg.className = "message-jeu"; msg.textContent = "";
    $("#calcul", ecran).innerHTML = `<span>${f.a} × ${f.t}</span>`;
    const zone = $("#reponse", ecran), auClavier = reussites(f.k) >= 1;
    parler([...N(f.a), PHRASES.fois, ...N(f.t)]);
    if (auClavier) {
      zone.innerHTML = `<div class="pave"><div class="saisie" id="saisie">&nbsp;</div>
        ${[1, 2, 3, 4, 5, "⌫", 6, 7, 8, 9, 0, "✔"].map(x => `<button data-t="${x}" class="${x === "✔" ? "ok" : ""}">${x}</button>`).join("")}</div>`;
      let tape = "";
      const saisie = $("#saisie", zone);
      $$("[data-t]", zone).forEach(b => b.onclick = () => {
        const x = b.dataset.t;
        if (x === "⌫") tape = tape.slice(0, -1);
        else if (x === "✔") { if (tape) repondre(f, +tape); return; }
        else if (tape.length < 2) tape += x;
        saisie.innerHTML = tape || "&nbsp;";
      });
    } else {
      const choix = produitsAutour(f.a, f.t);
      zone.innerHTML = `<div class="choix choix-duel">${choix.map(c => `<button data-c="${c}">${c}</button>`).join("")}</div>`;
      $$("[data-c]", zone).forEach(b => b.onclick = () => repondre(f, +b.dataset.c, b));
    }
  }

  async function repondre(f, r, bouton) {
    const zone = $("#reponse", ecran);
    $$("button", zone).forEach(b => { b.disabled = true; });
    const juste = r === f.a * f.t;
    await noter(f.k, juste);
    if (juste) {
      if (bouton) bouton.classList.add("juste");
      justes++; serie++; etoiles += ETOILES_PAR_REPONSE;
      $("#etoiles", ecran).textContent = `⭐ ${etat().etoiles + etoiles}`;
      const special = serie % DOJO.combo === 0;
      pv = Math.max(0, pv - (special ? 2 : 1));
      rejouer(heros, "attaque");
      rejouer(adv, special ? "touche-fort" : "touche");
      adv.insertAdjacentHTML("afterend", `<span class="coup">${special ? "🌀" : "⚔️"}</span>`);
      setTimeout(() => $(".coup", ecran)?.remove(), 700);
      msg.className = "message-jeu ok"; msg.textContent = special ? "Coup spécial ! 🌀" : `${f.a} × ${f.t} = ${f.a * f.t} ⚔️`;
      if (special) dire(PHRASES.coupSpecial);
      majPv(); majCombo();
      setTimeout(() => (pv ? question() : victoire()), special ? 1300 : 900);
    } else {
      if (bouton) { bouton.classList.add("faux"); $(`[data-c="${f.a * f.t}"]`, zone)?.classList.add("juste"); }
      serie = 0; majCombo();
      aRevoir.push({ fait: f, dans: 2 });
      rejouer(adv, "pare");
      msg.className = "message-jeu non"; msg.textContent = `Paré ! 🛡️ ${f.a} × ${f.t} = ${f.a * f.t}`;
      parler([PHRASES.pare, ...N(f.a), PHRASES.fois, ...N(f.t), PHRASES.egale, ...N(f.a * f.t)]);
      zone.insertAdjacentHTML("beforeend", `<div style="text-align:center;margin-top:14px"><button class="bouton" id="compris">Compris ! ▶</button></div>`);
      $("#compris", zone).onclick = question;
    }
  }

  async function victoire() {
    adv.classList.add("fumee");
    adv.insertAdjacentHTML("afterend", `<span class="nuage">💨</span>`);
    const nouvelles = await finDuel();
    await compter("duels");
    await terminer(etoiles, "dojo");
    const r = dernierResultat();
    setTimeout(() => {
      ecran.innerHTML = `
        <div class="bravo">
          <h1>Victoire ! 🥷</h1>
          <div class="gros">⭐ +${etoiles} étoile${etoiles > 1 ? "s" : ""}</div>
          <div class="petit-gris" style="font-size:22px">${esc(majuscule(o.adversaire[0]))} disparaît dans un nuage de fumée. ${justes} coups de sabre en ${n} calculs.</div>
          ${nouvelles.map(c => `<div class="carte annonce monte">${ceintureHTML(c)}<div><b>Tu gagnes ${esc(nomCeinture(c))} !</b></div></div>`).join("")}
          ${r.nouveaux.map(b => `<div class="carte annonce"><span class="emo anim-rebond">${b.emoji}</span><div><b>Nouveau badge : ${esc(b.titre)}</b></div></div>`).join("")}
          ${nouvelles.length ? "" : `<div class="petit-gris" style="font-size:20px">${esc(PHRASES.revenir)}</div>`}
          <div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center">
            <button class="bouton clair" id="accueil">🏠 Accueil</button>
            <button class="bouton clair" id="dojo">🥷 Le Dojo</button>
            <button class="bouton vert" id="encore">⚔️ Un autre duel</button>
          </div>
        </div>`;
      confettis(ecran, nouvelles.length ? 140 : 60);
      parler([PHRASES.victoire, ...nouvelles.flatMap(c => [PHRASES.tuGagnes, nomCeinture(c)]), ...(nouvelles.length ? [] : [PHRASES.revenir])]);
      $("#accueil", ecran).onclick = () => aller("accueil");
      $("#dojo", ecran).onclick = () => aller("dojo");
      $("#encore", ecran).onclick = () => duel(ecran); // on est déjà sur #duel : aller("duel") ne changerait rien
    }, 1200);
  }

  question();
}
