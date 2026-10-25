// Accueil : bonjour, cagnotte de la semaine, étoiles, et les trois entrées Lecture · Mémoire · Mathématique.
import { PLAFOND_EUROS, NIVEAUX_CALCUL } from "../config.js";
import { cagnotteSemaine, serie, luAujourdhui, motsAReviser } from "../progres.js";
import { etat, niveauCalcul, badgesGagnes } from "../jeux.js";
import { session, aller, nommer } from "../session.js";
import { $, esc, euros, compter, dateLongue, pluriel } from "../outils.js";

const ETAPES_LECTURE = ["lecture", "mots", "nombres", "questions", "recompense"];

export default function accueil(ecran) {
  const cagnotte = cagnotteSemaine(), s = session(), jours = serie();
  const enCours = s && ETAPES_LECTURE.includes(s.etape);
  const etatLecture = enCours ? "Continue ta lecture" : luAujourdhui() ? "✅ Lu aujourd'hui" : "Ton article t'attend";
  const aRevoir = motsAReviser([], Infinity).length;
  const badges = badgesGagnes().slice(-3).map(b => b.emoji).join(" ");

  ecran.innerHTML = `
    <div class="entete">
      <h1>${esc(nommer("Bonjour"))} ! <span class="anim-balance" style="display:inline-block">👋</span></h1>
      <div class="droite">
        ${jours ? `<span class="puce">🔥 ${pluriel(jours, "jour")} de suite</span>` : ""}
        <span class="puce">${dateLongue()}</span>
      </div>
    </div>
    <div class="bandeau">
      <div class="carte bandeau-cagnotte">
        <span style="font-size:48px">🐷</span>
        <div><div class="leg">Cagnotte de la semaine</div><div class="montant-mini" id="montant">0,00 €</div></div>
        <div class="jauge"><div id="jauge"></div></div>
        <span class="leg">${PLAFOND_EUROS} €</span>
      </div>
      <div class="carte bandeau-etoiles">
        <span style="font-size:44px">⭐</span>
        <div><div class="leg">Mes étoiles</div><div class="nb-etoiles">${etat().etoiles}</div></div>
        <div class="badges-mini" title="Mes badges">${badges}</div>
      </div>
    </div>
    <div class="trois">
      <button class="grande lecture" id="lecture">
        <span class="emo anim-rebond">📖</span><span class="nom">Lecture</span>
        <span class="etat">${etatLecture}</span><span class="gain">🐷 argent de poche</span>
      </button>
      <button class="grande memoire" id="memoire">
        <span class="emo">🧠</span><span class="nom">Mémoire</span>
        <span class="etat">${aRevoir ? pluriel(aRevoir, "mot") + " à revoir" : "Joue avec tes mots"}</span><span class="gain">⭐ étoiles</span>
      </button>
      <button class="grande maths" id="maths">
        <span class="emo">🔢</span><span class="nom">Mathématique</span>
        <span class="etat">Niveau ${niveauCalcul()} sur ${NIVEAUX_CALCUL.length}</span><span class="gain">⭐ étoiles</span>
      </button>
    </div>
    <button class="engrenage" id="engrenage" aria-label="Espace parent (3 appuis rapides)">⚙️</button>`;

  $("#lecture", ecran).onclick = () => aller(enCours ? s.etape : "envies");
  $("#memoire", ecran).onclick = () => aller("memoire");
  $("#maths", ecran).onclick = () => aller("maths");
  compter($("#montant", ecran), 0, cagnotte, 1400, euros);
  requestAnimationFrame(() => requestAnimationFrame(() => { $("#jauge", ecran).style.width = (cagnotte / PLAFOND_EUROS * 100) + "%"; }));

  // espace parent : 3 appuis rapides sur ⚙️, ou un appui long d'une seconde
  // (sur iPad, l'appui long peut être interrompu par le système : les 3 appuis marchent toujours)
  const g = $("#engrenage", ecran);
  let minuteur = null, appuis = [];
  const ouvrir = () => { clearTimeout(minuteur); g.classList.remove("appui"); aller("parent"); };
  g.addEventListener("pointerdown", e => {
    e.preventDefault();
    g.classList.add("appui");
    clearTimeout(minuteur);
    minuteur = setTimeout(ouvrir, 1000);
    const t = Date.now();
    appuis = [...appuis.filter(x => t - x < 1500), t];
    if (appuis.length >= 3) ouvrir();
  });
  ["pointerup", "pointercancel"].forEach(t => g.addEventListener(t, () => { clearTimeout(minuteur); g.classList.remove("appui"); }));
  g.addEventListener("contextmenu", e => e.preventDefault());
}
