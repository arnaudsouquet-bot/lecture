// Mémoire : choix du jeu, réviser mes mots, jeu de paires, retiens et retrouve. Des étoiles, pas d'argent de poche.
import { ETOILES_PAR_REPONSE, ETOILES_RETIENS, IMAGES_MEMOIRE, RETIENS_MAX, RETIENS_DEPART } from "../config.js";
import { motsAReviser, motsAppris, reviser } from "../progres.js";
import { article, articlesDisponibles, phraseDuTexte } from "../articles.js";
import { etat, compter, terminer, changerRetiens } from "../jeux.js";
import { aller } from "../session.js";
import { dire, direSuite } from "../voix.js";
import { PHRASES } from "../phrases.js";
import { $, $$, esc, etapes, syllabesHTML, melanger, pluriel } from "../outils.js";

const entete = (titre, droite = "") => `
  <div class="entete">
    <h1>${titre}</h1>
    <div class="droite">${droite}<span class="points-coin" id="etoiles">⭐ ${etat().etoiles}</span>
      <button class="bouton clair petit" id="retour">◀ Mémoire</button></div>
  </div>`;

function etoile(ecran, gagnees) {
  const el = $("#etoiles", ecran);
  if (!el) return;
  el.textContent = `⭐ ${etat().etoiles + gagnees}`;
  el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
}

const finir = async (etoiles) => { await terminer(etoiles, "memoire"); aller("bravo"); };

// mots pour les jeux : ceux du carnet d'abord, puis ceux des articles validés
function motsDisponibles() {
  const vus = new Map(motsAppris().filter(m => m.emoji).map(m => [m.mot, m]));
  articlesDisponibles().forEach(a => a.mots.forEach(m => { if (!vus.has(m.mot) && m.emoji) vus.set(m.mot, { ...m, article: a.id }); }));
  return [...vus.values()];
}

/* ---------- choix du jeu ---------- */

export function memoire(ecran) {
  const aRevoir = motsAReviser([], Infinity).length, mots = motsDisponibles().length;
  ecran.classList.add("hub-memoire");
  ecran.innerHTML = `
    <div class="entete">
      <button class="hp" id="dire-titre" aria-label="Écouter">🔊</button>
      <h1>🧠 Mémoire</h1>
      <div class="droite"><span class="points-coin">⭐ ${etat().etoiles}</span><button class="bouton clair petit" id="accueil">◀ Accueil</button></div>
    </div>
    <div class="activites">
      <button class="activite" data-aller="reviser"><span class="emo">🔁</span><span class="nom">Réviser mes mots</span>
        <span class="desc">Les mots de tes articles, juste au moment où tu risques de les oublier.</span>
        <span class="badge">${aRevoir ? pluriel(aRevoir, "mot") + " à revoir" : "Rien à revoir aujourd'hui"}</span></button>
      <button class="activite" data-aller="paires"><span class="emo">🃏</span><span class="nom">Jeu de paires</span>
        <span class="desc">Retourne les cartes et trouve chaque mot avec son image.</span>
        <span class="badge">${Math.min(6, mots)} paires</span></button>
      <button class="activite" data-aller="retiens"><span class="emo">🧩</span><span class="nom">Retiens et retrouve</span>
        <span class="desc">Regarde bien, puis retrouve tout dans le bon ordre.</span>
        <span class="badge">Niveau : ${etat().niveauRetiens} images</span></button>
    </div>`;
  $("#dire-titre", ecran).onclick = e => dire(PHRASES.memoireTitre, { bouton: e.currentTarget });
  $("#accueil", ecran).onclick = () => aller("accueil");
  $$("[data-aller]", ecran).forEach(b => b.onclick = () => aller(b.dataset.aller));
}

/* ---------- réviser mes mots ---------- */

export function reviserMots(ecran) {
  const dus = motsAReviser([], 10);
  let cartes = dus.map(m => ({ ...m, du: true })), i = 0, etoiles = 0;

  function vide() {
    const carnet = motsAppris();
    ecran.innerHTML = entete("🔁 Réviser mes mots") + `
      <div class="vide-jeu">
        <div style="font-size:90px">${carnet.length ? "🎉" : "📖"}</div>
        <div class="lisible">${carnet.length ? esc(PHRASES.rienAReviser) : esc(PHRASES.lisUnArticle)}</div>
        ${carnet.length ? `<button class="bouton" id="quand-meme">Revoir 3 mots quand même</button>` : ""}
      </div>`;
    $("#retour", ecran).onclick = () => aller("memoire");
    dire(carnet.length ? PHRASES.rienAReviser : PHRASES.lisUnArticle);
    const q = $("#quand-meme", ecran);
    if (q) q.onclick = () => { cartes = melanger(carnet).slice(0, 3).map(m => ({ ...m, du: false })); i = 0; carte(); };
  }

  function carte() {
    const m = cartes[i], a = article(m.article), ctx = a ? phraseDuTexte(a, m.mot) : null;
    ecran.innerHTML = entete("🔁 Tu te souviens ?", `<div class="points-etapes">${etapes(cartes.length, i)}</div>`) + `
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
    $("#retour", ecran).onclick = () => aller("memoire");
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
      if (i < cartes.length) setTimeout(carte, 700); else setTimeout(() => finir(etoiles), 900);
    });
  }

  if (cartes.length) carte(); else vide();
}

/* ---------- jeu de paires ---------- */

export function paires(ecran) {
  const mots = melanger(motsDisponibles()).slice(0, 6);
  if (mots.length < 3) {
    ecran.innerHTML = entete("🃏 Jeu de paires") + `<div class="vide-jeu"><div style="font-size:90px">📖</div><div class="lisible">${esc(PHRASES.lisUnArticle)}</div></div>`;
    $("#retour", ecran).onclick = () => aller("memoire");
    dire(PHRASES.lisUnArticle);
    return;
  }
  const cartes = melanger(mots.flatMap((m, k) => [{ k, texte: m.mot, mot: m.mot }, { k, texte: m.emoji, emo: true }]));
  let ouvertes = [], trouvees = 0, etoiles = 0;
  ecran.innerHTML = entete("🃏 Jeu de paires", `<span class="puce" id="reste">${mots.length} paires à trouver</span>`) + `
    <div class="plateau" style="grid-template-rows:repeat(${Math.ceil(cartes.length / 4)}, 1fr)">
      ${cartes.map((c, n) => `<div class="carte-jeu" data-n="${n}"><div class="in"><div class="face dos">?</div>
        <div class="face devant ${c.emo ? "emo" : "lisible"}">${c.emo ? c.texte : syllabesHTML(mots[c.k].syllabes)}</div></div></div>`).join("")}
    </div>`;
  $("#retour", ecran).onclick = () => aller("memoire");
  dire(PHRASES.pairesConsigne);
  $$(".carte-jeu", ecran).forEach(el => el.onclick = () => {
    const c = cartes[+el.dataset.n];
    if (ouvertes.length === 2 || el.classList.contains("retournee") || el.classList.contains("trouvee")) return;
    el.classList.add("retournee");
    if (!c.emo) dire(c.mot);
    ouvertes.push(el);
    if (ouvertes.length < 2) return;
    const [a, b] = ouvertes.map(x => cartes[+x.dataset.n]);
    setTimeout(async () => {
      if (a.k === b.k) {
        ouvertes.forEach(x => x.classList.add("trouvee"));
        trouvees++; etoiles += ETOILES_PAR_REPONSE; etoile(ecran, etoiles);
        $("#reste", ecran).textContent = trouvees < mots.length ? `${mots.length - trouvees} paires à trouver` : "Toutes trouvées ! 🎉";
        if (trouvees === mots.length) { dire(PHRASES.bravo); await compter("pairesGagnees"); setTimeout(() => finir(etoiles), 1200); }
      } else ouvertes.forEach(x => x.classList.remove("retournee"));
      ouvertes = [];
    }, 1000);
  });
}

/* ---------- retiens et retrouve ---------- */

const MANCHES = 5;

export function retiens(ecran) {
  let manche = 0, etoiles = 0, minuteur = null;

  function jouer() {
    const e = etat(), n = Math.min(RETIENS_MAX, Math.max(RETIENS_DEPART, e.niveauRetiens));
    const suite = melanger(IMAGES_MEMOIRE).slice(0, n);
    const duree = 4000 + (n - 3) * 1000;
    let attendu = 0, erreurs = 0;
    ecran.innerHTML = entete("🧩 Retiens et retrouve", `<span class="puce">${n} images · manche ${manche + 1}/${MANCHES}</span>`) + `
      <div class="carte" style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:14px">
        <div class="consigne"><button class="hp" id="dire-consigne" aria-label="Écouter">🔊</button><span id="consigne" class="lisible">${esc(PHRASES.retiensRegarde)}</span></div>
        <div class="chrono" id="chrono"><div id="barre"></div></div>
        <div class="sequence" id="sequence">${suite.map(([, emo]) => `<div class="case">${emo}</div>`).join("")}</div>
        <div class="choix-emo" id="choix"></div>
        <div class="message-jeu" id="msg"></div>
      </div>`;
    $("#retour", ecran).onclick = () => { clearTimeout(minuteur); aller("memoire"); };
    $("#dire-consigne", ecran).onclick = ev => dire($("#consigne", ecran).textContent, { bouton: ev.currentTarget });
    direSuite([{ texte: PHRASES.retiensRegarde }, ...suite.map(([nom]) => ({ texte: nom }))]);
    const barre = $("#barre", ecran);
    barre.animate([{ width: "100%" }, { width: "0%" }], { duration: duree, fill: "forwards" });

    minuteur = setTimeout(() => {
      $("#chrono", ecran).style.visibility = "hidden";
      $("#consigne", ecran).textContent = PHRASES.retiensRetrouve;
      dire(PHRASES.retiensRetrouve);
      $("#sequence", ecran).innerHTML = suite.map(() => `<div class="case vide">?</div>`).join("");
      const choix = melanger([...suite, ...melanger(IMAGES_MEMOIRE.filter(x => !suite.includes(x))).slice(0, Math.min(3, IMAGES_MEMOIRE.length - n))]);
      $("#choix", ecran).innerHTML = choix.map(([nom, emo]) => `<button data-nom="${esc(nom)}" aria-label="${esc(nom)}">${emo}</button>`).join("");
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
    }, duree);

    async function fin(reussi) {
      const r = { ...e.retiens };
      let niveau = n;
      if (reussi && !erreurs) { r.reussites++; r.echecs = 0; if (r.reussites >= 3) { niveau = Math.min(RETIENS_MAX, n + 1); r.reussites = 0; } }
      else if (!reussi) { r.echecs++; r.reussites = 0; if (r.echecs >= 2) { niveau = Math.max(RETIENS_DEPART, n - 1); r.echecs = 0; } }
      await changerRetiens(niveau, r);
      const msg = $("#msg", ecran);
      if (reussi) {
        const gain = erreurs ? 1 : ETOILES_RETIENS;
        etoiles += gain; etoile(ecran, etoiles);
        msg.className = "message-jeu ok"; msg.textContent = `Bravo ! +${gain} ⭐`;
        dire(PHRASES.retiensBravo);
      } else {
        $$("#sequence .case", ecran).forEach((c, k) => { c.className = "case"; c.textContent = suite[k][1]; });
        msg.className = "message-jeu non"; msg.textContent = "Voici la bonne suite.";
        direSuite([{ texte: PHRASES.retiensRate }, ...suite.map(([nom]) => ({ texte: nom }))]);
      }
      manche++;
      minuteur = setTimeout(() => (manche < MANCHES ? jouer() : finir(etoiles)), reussi ? 2200 : 4500);
    }
  }

  jouer();
  return () => clearTimeout(minuteur);
}
