// Mémoire : réviser mes mots, jeu de paires, retiens et retrouve, écoute et retrouve, qu'est-ce qui a changé ?,
// paires mot et définition, Simon des couleurs. Des étoiles, pas d'argent de poche. Chaque jeu a ses niveaux.
import { ETOILES_PAR_REPONSE, IMAGES_MEMOIRE, PAIRES_PAR_NIVEAU, DEFINITIONS_PAR_NIVEAU, RETIENS_PAR_NIVEAU,
  ECOUTE_PAR_NIVEAU, MANCHES, OBJETS, CHANGE_PAR_NIVEAU, SIMON_COULEURS, SIMON_VITESSE } from "../config.js";
import { motsAReviser, motsAppris, reviser } from "../progres.js";
import { article, articlesDisponibles, phraseDuTexte } from "../articles.js";
import { compter, niveauDe, finDeSerie } from "../jeux.js";
import { dire, direSuite, taire } from "../voix.js";
import { PHRASES } from "../phrases.js";
import { entete, brancherRetour, etoile, finir, rienAJouer, hub } from "./jeux-commun.js";
import { $, $$, esc, etapes, syllabesHTML, melanger, pluriel } from "../outils.js";

// mots pour les jeux : ceux du carnet d'abord, puis ceux des articles que l'enfant peut lire
function motsDisponibles() {
  const vus = new Map(motsAppris().filter(m => m.emoji).map(m => [m.mot, m]));
  articlesDisponibles().forEach(a => a.mots.forEach(m => { if (!vus.has(m.mot) && m.emoji) vus.set(m.mot, { ...m, article: a.id }); }));
  return [...vus.values()];
}

/* ---------- choix du jeu ---------- */

export function memoire(ecran) {
  const aRevoir = motsAReviser([], Infinity).length;
  hub(ecran, "memoire", { reviser: aRevoir ? `${pluriel(aRevoir, "mot")} à revoir` : "Rien à revoir aujourd'hui" });
}

/* ---------- réviser mes mots (répétition espacée, pas de niveau) ---------- */

export function reviserMots(ecran) {
  let cartes = motsAReviser([], 10).map(m => ({ ...m, du: true })), i = 0, etoiles = 0;

  function vide() {
    const carnet = motsAppris();
    ecran.innerHTML = entete("reviser") + `
      <div class="vide-jeu">
        <div style="font-size:90px">${carnet.length ? "🎉" : "📖"}</div>
        <div class="lisible">${carnet.length ? esc(PHRASES.rienAReviser) : esc(PHRASES.lisUnArticle)}</div>
        ${carnet.length ? `<button class="bouton" id="quand-meme">Revoir 3 mots quand même</button>` : ""}
      </div>`;
    brancherRetour(ecran, "reviser");
    dire(carnet.length ? PHRASES.rienAReviser : PHRASES.lisUnArticle);
    const q = $("#quand-meme", ecran);
    if (q) q.onclick = () => { cartes = melanger(carnet).slice(0, 3).map(m => ({ ...m, du: false })); i = 0; carte(); };
  }

  function carte() {
    const m = cartes[i], a = article(m.article), ctx = a ? phraseDuTexte(a, m.mot) : null;
    ecran.innerHTML = entete("reviser", `<div class="points-etapes">${etapes(cartes.length, i)}</div>`) + `
      <div class="carte mot-carte">
        <div class="mot-image"><span class="anim-rebond" style="display:inline-block">${m.emoji || "📘"}</span></div>
        <div class="lisible">
          <div class="mot-grand"><button class="hp" id="dire-mot" aria-label="Écouter le mot">🔊</button><span>${syllabesHTML(m.syllabes)}</span></div>
          <div class="cache-def" id="cache">👆 Que veut dire ce mot ? Réfléchis, puis touche ici pour vérifier.</div>
          ${a ? `<p class="petit-gris" style="font-size:17px">Appris dans « ${esc(a.titre)} »${m.du ? ` · boîte ${m.boite} sur 5` : ""}</p>` : ""}
        </div>
      </div>
      <div class="bas"><span class="fin">
        <button class="bouton clair petit" data-rep="0">🔁 Pas encore</button>
        <button class="bouton vert petit" data-rep="1">✅ Je savais</button></span></div>`;
    brancherRetour(ecran, "reviser");
    $("#dire-mot", ecran).onclick = e => dire(`${m.mot}. ${m.syllabes.join(", ")}. ${m.mot}.`, { bouton: e.currentTarget });
    $("#cache", ecran).onclick = e => {
      const c = e.currentTarget;
      if (c.classList.contains("ouvert")) return;
      c.classList.add("ouvert");
      c.innerHTML = esc(m.definition) + (ctx ? `<span class="ctx">📖 « ${ctx.html} »</span>` : "");
      dire(m.definition);
    };
    $$("[data-rep]", ecran).forEach(b => b.onclick = async () => {
      const ok = b.dataset.rep === "1";
      if (m.du) await reviser(m.mot, ok);
      await compter("motsRevises");
      etoiles += ETOILES_PAR_REPONSE; etoile(ecran, etoiles);
      dire(ok ? PHRASES.bravo : PHRASES.pasGrave);
      i++;
      if (i < cartes.length) setTimeout(carte, 700); else setTimeout(() => finir("reviser", etoiles), 900);
    });
  }

  if (cartes.length) carte(); else vide();
}

/* ---------- jeux de paires : mot ↔ image, mot ↔ définition ---------- */

function jeuDePaires(ecran, id, nombre, faceB) {
  const mots = melanger(motsDisponibles()).slice(0, nombre);
  if (mots.length < 3) return rienAJouer(ecran, id);
  const cartes = melanger(mots.flatMap((m, k) => [{ k, mot: true }, { k, mot: false }]));
  let ouvertes = [], trouvees = 0, tentatives = 0, etoiles = 0;
  const colonnes = 4;
  ecran.innerHTML = entete(id, `<span class="puce" id="reste">${mots.length} paires à trouver</span>`) + `
    <div class="plateau ${id === "definitions" ? "plateau-definitions" : ""}" style="grid-template-columns:repeat(${colonnes}, 1fr)">
      ${cartes.map((c, n) => `<div class="carte-jeu" data-n="${n}"><div class="in"><div class="face dos">?</div>
        <div class="face devant ${c.mot ? "lisible" : faceB.classe}">${c.mot ? syllabesHTML(mots[c.k].syllabes) : faceB.html(mots[c.k])}</div></div></div>`).join("")}
    </div>`;
  brancherRetour(ecran, id);
  dire(id === "definitions" ? PHRASES.definitionsConsigne : PHRASES.pairesConsigne);
  $$(".carte-jeu", ecran).forEach(el => el.onclick = () => {
    const c = cartes[+el.dataset.n];
    if (ouvertes.length === 2 || el.classList.contains("retournee") || el.classList.contains("trouvee")) return;
    el.classList.add("retournee");
    if (c.mot) dire(mots[c.k].mot); else if (faceB.dire) dire(faceB.dire(mots[c.k]));
    ouvertes.push(el);
    if (ouvertes.length < 2) return;
    tentatives++;
    const [a, b] = ouvertes.map(x => cartes[+x.dataset.n]);
    setTimeout(async () => {
      if (a.k === b.k) {
        ouvertes.forEach(x => x.classList.add("trouvee"));
        trouvees++; etoiles += ETOILES_PAR_REPONSE; etoile(ecran, etoiles);
        $("#reste", ecran).textContent = trouvees < mots.length ? `${mots.length - trouvees} paires à trouver` : "Toutes trouvées ! 🎉";
        if (trouvees === mots.length) {
          dire(PHRASES.bravo);
          if (id === "paires") await compter("pairesGagnees");
          const niveau = await finDeSerie(id, mots.length / tentatives);
          setTimeout(() => finir(id, etoiles, niveau), 1200);
        }
      } else ouvertes.forEach(x => x.classList.remove("retournee"));
      ouvertes = [];
    }, id === "definitions" ? 1800 : 1000);
  });
}

export const paires = ecran => jeuDePaires(ecran, "paires", PAIRES_PAR_NIVEAU[niveauDe("paires") - 1],
  { classe: "emo", html: m => m.emoji });
export const definitions = ecran => jeuDePaires(ecran, "definitions", DEFINITIONS_PAR_NIVEAU[niveauDe("definitions") - 1],
  { classe: "definition lisible", html: m => esc(m.definition), dire: m => m.definition });

/* ---------- retiens et retrouve / écoute et retrouve ---------- */

// voir : la suite est montrée (et dite) ; sinon elle est seulement dite (mémoire auditive)
function suiteARetrouver(ecran, id, longueur, voir) {
  let manche = 0, parfaites = 0, etoiles = 0, minuteur = null;

  function jouer() {
    const suite = melanger(IMAGES_MEMOIRE).slice(0, longueur);
    const duree = voir ? 4000 + (longueur - 3) * 1000 : 0;
    let attendu = 0, erreurs = 0;
    ecran.innerHTML = entete(id, `<span class="puce">manche ${manche + 1}/${MANCHES}</span>`) + `
      <div class="carte" style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:14px">
        <div class="consigne"><button class="hp" id="reecouter" aria-label="Réécouter">🔊</button><span id="consigne" class="lisible">${esc(voir ? PHRASES.retiensRegarde : PHRASES.ecouteConsigne)}</span></div>
        ${voir ? `<div class="chrono" id="chrono"><div id="barre"></div></div>` : ""}
        <div class="sequence" id="sequence">${voir ? suite.map(([, emo]) => `<div class="case">${emo}</div>`).join("") : `<div class="oreille anim-rebond">👂</div>`}</div>
        <div class="choix-emo" id="choix"></div>
        <div class="message-jeu" id="msg"></div>
      </div>`;
    brancherRetour(ecran, id, () => clearTimeout(minuteur));
    const direSuiteImages = () => direSuite([{ texte: voir ? PHRASES.retiensRegarde : PHRASES.ecouteConsigne }, ...suite.map(([nom]) => ({ texte: nom }))]);
    $("#reecouter", ecran).onclick = () => (voir && attendu === 0 && !$("#choix", ecran).children.length ? direSuiteImages() : dire($("#consigne", ecran).textContent));

    const demander = () => {
      if (voir) $("#chrono", ecran).style.visibility = "hidden";
      $("#consigne", ecran).textContent = PHRASES.retiensRetrouve;
      $("#sequence", ecran).innerHTML = suite.map(() => `<div class="case vide">?</div>`).join("");
      const autres = melanger(IMAGES_MEMOIRE.filter(x => !suite.includes(x))).slice(0, Math.min(3, IMAGES_MEMOIRE.length - longueur));
      $("#choix", ecran).innerHTML = melanger([...suite, ...autres]).map(([nom, emo]) => `<button data-nom="${esc(nom)}" aria-label="${esc(nom)}">${emo}</button>`).join("");
      if (!voir) $("#reecouter", ecran).onclick = () => direSuite(suite.map(([nom]) => ({ texte: nom })));
      $$("#choix button", ecran).forEach(b => b.onclick = () => {
        if (attendu >= suite.length || erreurs >= 3) return;
        if (b.dataset.nom === suite[attendu][0]) {
          const c = $$("#sequence .case", ecran)[attendu];
          c.className = "case juste"; c.textContent = suite[attendu][1];
          dire(suite[attendu][0]);
          attendu++;
          if (attendu === suite.length) fin(true);
        } else {
          erreurs++;
          b.classList.remove("faux"); void b.offsetWidth; b.classList.add("faux");
          if (erreurs >= 3) fin(false); else dire(PHRASES.essaieEncore);
        }
      });
      dire(PHRASES.retiensRetrouve);
    };

    if (voir) {
      direSuiteImages();
      $("#barre", ecran).animate([{ width: "100%" }, { width: "0%" }], { duration: duree, fill: "forwards" });
      minuteur = setTimeout(demander, duree);
    } else {
      // la suite est seulement dite ; on attend la fin de la voix (avec une limite) avant de demander
      const fini = direSuite([{ texte: PHRASES.ecouteConsigne }, ...suite.map(([nom]) => ({ texte: nom }))]);
      Promise.race([fini, new Promise(r => setTimeout(r, 2500 + longueur * 1400))]).then(() => { if (ecran.isConnected) demander(); });
    }

    function fin(reussi) {
      // écoute : une erreur est tolérée pour compter la manche comme réussie
      const parfaite = reussi && erreurs <= (voir ? 0 : 1);
      if (parfaite) parfaites++;
      const msg = $("#msg", ecran);
      if (reussi) {
        const gain = parfaite ? 2 * ETOILES_PAR_REPONSE : ETOILES_PAR_REPONSE;
        etoiles += gain; etoile(ecran, etoiles);
        msg.className = "message-jeu ok"; msg.textContent = `Bravo ! +${gain} ⭐`;
        dire(PHRASES.retiensBravo);
      } else {
        $$("#sequence .case", ecran).forEach((c, k) => { c.className = "case"; c.textContent = suite[k][1]; });
        msg.className = "message-jeu non"; msg.textContent = "Voici la bonne suite.";
        direSuite([{ texte: PHRASES.retiensRate }, ...suite.map(([nom]) => ({ texte: nom }))]);
      }
      manche++;
      minuteur = setTimeout(async () => {
        if (manche < MANCHES) return jouer();
        const niveau = await finDeSerie(id, parfaites / MANCHES);
        finir(id, etoiles, niveau);
      }, reussi ? 2200 : 4500);
    }
  }

  jouer();
  return () => clearTimeout(minuteur);
}

export const retiens = ecran => suiteARetrouver(ecran, "retiens", RETIENS_PAR_NIVEAU[niveauDe("retiens") - 1], true);
export const ecoute = ecran => suiteARetrouver(ecran, "ecoute", ECOUTE_PAR_NIVEAU[niveauDe("ecoute") - 1], false);

/* ---------- qu'est-ce qui a changé ? ---------- */

export function change(ecran) {
  const niv = niveauDe("change"), nombre = CHANGE_PAR_NIVEAU[niv - 1], bouger = niv >= 3;
  let manche = 0, premierCoup = 0, etoiles = 0, minuteur = null;

  function jouer() {
    const objets = melanger(OBJETS).slice(0, nombre), parti = Math.floor(Math.random() * nombre);
    let essais = 0, fini = false;
    const colonnes = nombre <= 4 ? 4 : nombre <= 6 ? 3 : nombre <= 8 ? 4 : 5;
    const grille = liste => `<div class="table-objets" style="grid-template-columns:repeat(${colonnes}, 1fr)">${liste.map(o => `<div class="objet">${o}</div>`).join("")}</div>`;
    ecran.innerHTML = entete("change", `<span class="puce">${nombre} objets · manche ${manche + 1}/${MANCHES}</span>`) + `
      <div class="carte" style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:16px">
        <div class="consigne"><button class="hp" id="dire-consigne" aria-label="Écouter">🔊</button><span id="consigne" class="lisible">${esc(PHRASES.changeRegarde)}</span></div>
        <div id="table">${grille(objets)}</div>
        <div class="choix-emo" id="choix"></div>
        <div class="message-jeu" id="msg"></div>
      </div>`;
    brancherRetour(ecran, "change", () => clearTimeout(minuteur));
    $("#dire-consigne", ecran).onclick = ev => dire($("#consigne", ecran).textContent, { bouton: ev.currentTarget });
    dire(PHRASES.changeRegarde);

    minuteur = setTimeout(() => {
      $("#table", ecran).innerHTML = `<div class="rideau">🙈</div>`;
      minuteur = setTimeout(() => {
        // l'objet disparu laisse une place vide ; à partir du niveau 3, les autres objets changent de place
        const restants = objets.filter((_, k) => k !== parti);
        $("#table", ecran).innerHTML = bouger ? grille(melanger(restants)) : grille(objets.map((o, k) => (k === parti ? "❔" : o)));
        $("#consigne", ecran).textContent = PHRASES.changeQuestion;
        dire(PHRASES.changeQuestion);
        const choix = melanger([objets[parti], ...melanger(restants).slice(0, 2)]);
        $("#choix", ecran).innerHTML = choix.map(o => `<button data-o="${o}">${o}</button>`).join("");
        $$("#choix button", ecran).forEach(b => b.onclick = () => {
          if (fini || b.classList.contains("faux")) return;
          essais++;
          const msg = $("#msg", ecran);
          if (b.dataset.o === objets[parti]) {
            fini = true;
            if (essais === 1) premierCoup++;
            etoiles += ETOILES_PAR_REPONSE; etoile(ecran, etoiles);
            b.classList.add("juste");
            msg.className = "message-jeu ok"; msg.textContent = `Bravo ! +${ETOILES_PAR_REPONSE} ⭐`;
            dire(PHRASES.bravo);
          } else if (essais < 2) {
            b.classList.add("faux"); msg.className = "message-jeu non"; msg.textContent = "Presque ! Essaie encore 💪";
            dire(PHRASES.presque);
          } else {
            fini = true; b.classList.add("faux");
            $(`#choix [data-o="${objets[parti]}"]`, ecran).classList.add("juste");
            msg.className = "message-jeu non"; msg.textContent = "C'était celui-ci.";
            dire(PHRASES.pasGrave);
          }
          if (fini) {
            manche++;
            minuteur = setTimeout(async () => {
              if (manche < MANCHES) return jouer();
              const niveau = await finDeSerie("change", premierCoup / MANCHES);
              finir("change", etoiles, niveau);
            }, 2000);
          }
        });
      }, 1300);
    }, 3000 + nombre * 500);
  }

  jouer();
  return () => clearTimeout(minuteur);
}

/* ---------- Simon des couleurs ---------- */

const NOTES = [329.6, 440, 554.4, 659.3]; // une note par couleur
let contexteAudio = null;
function note(k, duree) {
  try {
    contexteAudio = contexteAudio || new (window.AudioContext || window.webkitAudioContext)();
    if (contexteAudio.state === "suspended") contexteAudio.resume();
    const o = contexteAudio.createOscillator(), g = contexteAudio.createGain(), t = contexteAudio.currentTime;
    o.type = "sine"; o.frequency.value = NOTES[k];
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duree / 1000);
    o.connect(g).connect(contexteAudio.destination); o.start(t); o.stop(t + duree / 1000 + 0.05);
  } catch { /* pas de son : les couleurs suffisent */ }
}

export function simon(ecran) {
  const niv = niveauDe("simon"), depart = niv + 1, vitesse = SIMON_VITESSE[niv - 1];
  const pause = ms => new Promise(r => setTimeout(r, ms));
  let suite = [], saisie = 0, reussies = 0, etoiles = 0, deuxieme = false, ecoute = false, fini = false;

  ecran.innerHTML = entete("simon", `<span class="puce" id="longueur">Suite de ${depart}</span>`) + `
    <div class="simon-zone">
      <div class="simon">${SIMON_COULEURS.map(([nom, c], k) => `<button class="pad" data-k="${k}" style="--c:${c}" aria-label="${nom}"></button>`).join("")}</div>
      <div class="simon-cote">
        <div class="consigne lisible" id="consigne">Prêt ?</div>
        <div class="message-jeu" id="msg"></div>
        <button class="bouton vert" id="commencer">▶ Commencer</button>
      </div>
    </div>`;
  brancherRetour(ecran, "simon", () => { fini = true; });

  const allumer = async (k, duree) => {
    const pad = $(`.pad[data-k="${k}"]`, ecran);
    if (!pad) return;
    pad.classList.add("allume"); note(k, duree * 0.9);
    await pause(duree); pad.classList.remove("allume");
  };
  async function montrer() {
    ecoute = false;
    $("#consigne", ecran).textContent = "Regarde et écoute…";
    $("#longueur", ecran).textContent = `Suite de ${suite.length}`;
    await dire(PHRASES.simonRegarde); await pause(300);
    for (const k of suite) { if (fini) return; await allumer(k, vitesse); await pause(180); }
    saisie = 0; ecoute = true;
    $("#consigne", ecran).textContent = "À toi !";
    dire(PHRASES.simonATon);
  }
  async function terminerPartie() {
    fini = true; ecoute = false;
    $("#consigne", ecran).textContent = reussies ? `Tu as retenu une suite de ${depart + reussies - 1} couleurs !` : "On réessaiera !";
    await dire(PHRASES.simonFin);
    const niveau = await finDeSerie("simon", Math.min(1, reussies / 4));
    finir("simon", etoiles, niveau);
  }

  $("#commencer", ecran).onclick = ev => {
    ev.currentTarget.remove();
    note(0, 1); // débloque le son sur iPad
    suite = Array.from({ length: depart }, () => Math.floor(Math.random() * 4));
    montrer();
  };
  $$(".pad", ecran).forEach(p => p.onclick = async () => {
    if (!ecoute || fini) return;
    const k = +p.dataset.k;
    taire(); allumer(k, 250);
    const msg = $("#msg", ecran);
    if (k !== suite[saisie]) {
      ecoute = false;
      if (!deuxieme) { deuxieme = true; msg.className = "message-jeu non"; msg.textContent = "Oups !"; await dire(PHRASES.simonOups); await pause(400); return montrer(); }
      msg.className = "message-jeu non"; msg.textContent = "C'est fini pour cette fois.";
      return terminerPartie();
    }
    saisie++;
    if (saisie < suite.length) return;
    // suite complète : une étoile, et la suite s'allonge
    ecoute = false; reussies++; deuxieme = false;
    etoiles += ETOILES_PAR_REPONSE; etoile(ecran, etoiles);
    msg.className = "message-jeu ok"; msg.textContent = `Bravo ! +${ETOILES_PAR_REPONSE} ⭐`;
    await dire(PHRASES.bravo); await pause(500);
    if (reussies >= 6) return terminerPartie();
    suite.push(Math.floor(Math.random() * 4));
    montrer();
  });
  return () => { fini = true; };
}
