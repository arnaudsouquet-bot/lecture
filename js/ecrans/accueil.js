// 1 · Accueil : bonjour, cagnotte de la semaine, bouton pour lire.
import { PLAFOND_EUROS } from "../config.js";
import { lire } from "../store.js";
import { cagnotteSemaine, serie, luAujourdhui, motsAppris } from "../progres.js";
import { session, aller, nommer } from "../session.js";
import { $, esc, euros, compter, dateLongue, pluriel } from "../outils.js";

export default function accueil(ecran) {
  const cagnotte = cagnotteSemaine(), reste = Math.max(0, PLAFOND_EUROS - cagnotte);
  const s = session(), jours = serie(), lus = lire("journal", []).length;
  const ETAPES = { lecture: "lecture", mots: "mots", nombres: "nombres", questions: "questions", recompense: "recompense" };

  let lancer;
  if (s && ETAPES[s.etape]) lancer = `<button class="bouton vert" id="go">📖 Continuer ma lecture</button><p>${s.titre || ""}</p>`;
  else if (luAujourdhui()) lancer = `<p style="font-size:30px">Bravo, tu as lu aujourd'hui ! 🎉</p>
    <button class="bouton clair" id="go">📚 Lire encore</button><p class="petit-gris" style="font-size:18px">pour le plaisir</p>`;
  else lancer = `<button class="bouton vert" id="go">📖 Lire aujourd'hui</button>`;

  ecran.innerHTML = `
    <div class="entete">
      <h1>${esc(nommer("Bonjour"))} ! <span class="anim-balance" style="display:inline-block">👋</span></h1>
      <div class="droite">
        ${jours ? `<span class="puce">🔥 ${pluriel(jours, "jour")} de suite</span>` : ""}
        <span class="puce">${dateLongue()}</span>
      </div>
    </div>
    <div class="accueil-grille">
      <div class="carte cagnotte">
        <div class="cochon anim-rebond">🐷</div>
        <div style="font-size:24px">Ta cagnotte de la semaine</div>
        <div class="montant" id="montant">0,00 €</div>
        <div class="jauge"><div id="jauge"></div></div>
        <div class="jauge-legende"><span>0 €</span><span>maximum ${PLAFOND_EUROS} €</span></div>
        <div style="font-size:20px">${reste > 0 ? `Encore <b>${euros(reste)}</b> pour remplir la cagnotte` : "Ta cagnotte est pleine ! 🎉"}</div>
      </div>
      <div class="accueil-droite">
        <div class="stats">
          <div class="carte stat"><div class="gros">${motsAppris().length}</div><div class="leg">mots appris</div></div>
          <div class="carte stat"><div class="gros">${lus}</div><div class="leg">${lus > 1 ? "articles lus" : "article lu"}</div></div>
        </div>
        <div class="lancer">${lancer}</div>
      </div>
    </div>
    <button class="engrenage" id="engrenage" aria-label="Espace parent (3 appuis rapides)">⚙️</button>`;

  $("#go", ecran).onclick = () => aller(s && ETAPES[s.etape] ? s.etape : "envies");
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
