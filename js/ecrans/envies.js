// 2 · Mes envies : l'enfant choisit le thème du jour, ou dit qu'il a envie d'autre chose (questionnaire).
import { THEMES } from "../config.js";
import { articlesDisponibles, dejaLu } from "../articles.js";
import { articlePayeAujourdhui } from "../progres.js";
import { aller, majSession } from "../session.js";
import { dire } from "../voix.js";
import { PHRASES, remplir } from "../phrases.js";
import { $, $$, esc } from "../outils.js";

export async function commencerArticle(a) {
  await majSession({
    article: a.id, titre: a.titre, etape: "lecture", page: 0, motIndex: 0,
    points: 0, bonnes: 0, total: 0, faites: {}, paye: articlePayeAujourdhui(), debut: Date.now()
  });
  aller("lecture");
}

export default function envies(ecran) {
  const tuiles = THEMES.map(t => {
    const dispo = articlesDisponibles(t.cle), a = dispo[0];
    const sous = !a ? "bientôt" : dejaLu(a.id) ? `relire : ${esc(a.titre)}` : esc(a.titre);
    return `<button class="tuile ${a ? "dispo" : "bientot"}" data-theme="${t.cle}">
      <span class="emo ${a ? "anim-flotte" : ""}">${a ? a.emoji || t.emoji : t.emoji}</span>
      <span class="nom">${t.nom}</span><span class="sous">${sous}</span></button>`;
  }).join("");
  const aucun = !articlesDisponibles().length;

  ecran.innerHTML = `
    <div class="entete">
      <button class="hp" id="dire-titre" aria-label="Écouter">🔊</button>
      <h1>Qu'est-ce qui te fait envie aujourd'hui ?</h1>
      <div class="droite"><button class="bouton clair petit" id="retour">◀ Accueil</button></div>
    </div>
    ${aucun ? `<p class="vide" style="padding:0 0 20px">Pas encore d'article prêt. Demande à tes parents d'en valider un !</p>` : ""}
    <div class="tuiles">
      ${tuiles}
      <button class="tuile idee" id="idee"><span class="emo">💡</span><span class="nom">J'ai envie d'autre chose</span><span class="sous">Dis-nous ce que tu aimes</span></button>
    </div>`;

  $("#dire-titre", ecran).onclick = e => dire(PHRASES.envie, { bouton: e.currentTarget });
  $("#retour", ecran).onclick = () => aller("accueil");
  $("#idee", ecran).onclick = () => { dire(PHRASES.autreChose); aller("questionnaire"); };
  $$("[data-theme]", ecran).forEach(b => b.onclick = () => {
    const t = THEMES.find(x => x.cle === b.dataset.theme), a = articlesDisponibles(t.cle)[0];
    if (a) commencerArticle(a);
    else dire(remplir(PHRASES.pasEncore, t.nom));
  });
}
