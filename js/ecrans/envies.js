// 2 · Mes envies : l'enfant choisit un thème, puis un article de ce thème ; ou dit qu'il a envie d'autre chose (questionnaire).
import { THEMES } from "../config.js";
import { articlesDisponibles, dejaLu } from "../articles.js";
import { articlePayeAujourdhui } from "../progres.js";
import { aller, majSession } from "../session.js";
import { dire } from "../voix.js";
import { PHRASES, remplir } from "../phrases.js";
import { $, $$, esc } from "../outils.js";

let themeChoisi = null;

export async function commencerArticle(a) {
  await majSession({
    article: a.id, titre: a.titre, etape: "lecture", page: 0, motIndex: 0,
    points: 0, bonnes: 0, total: 0, faites: {}, paye: articlePayeAujourdhui(), debut: Date.now()
  });
  aller("lecture");
}

export default function envies(ecran) {
  const tuiles = THEMES.map(t => {
    const dispo = articlesDisponibles(t.cle), nouveaux = dispo.filter(a => !dejaLu(a.id)).length;
    const sous = !dispo.length ? "bientôt" : `${dispo.length} article${dispo.length > 1 ? "s" : ""}${nouveaux && nouveaux < dispo.length ? ` · ${nouveaux} nouveau${nouveaux > 1 ? "x" : ""}` : ""}`;
    return `<button class="tuile ${dispo.length ? "dispo" : "bientot"}" data-theme="${t.cle}">
      <span class="emo ${dispo.length ? "anim-flotte" : ""}">${t.emoji}</span>
      <span class="nom">${t.nom}</span><span class="sous">${sous}</span></button>`;
  }).join("");
  const aucun = !articlesDisponibles().length;

  ecran.innerHTML = `
    <div class="entete">
      <button class="hp" id="dire-titre" aria-label="Écouter">🔊</button>
      <h1>Qu'est-ce qui te fait envie aujourd'hui ?</h1>
      <div class="droite"><button class="bouton clair petit" id="retour">◀ Accueil</button></div>
    </div>
    ${aucun ? `<p class="vide" style="padding:0 0 20px">Pas encore d'article prêt. Demande à tes parents d'en valider !</p>` : ""}
    <div class="tuiles">
      ${tuiles}
      <button class="tuile idee" id="idee"><span class="emo">💡</span><span class="nom">J'ai envie d'autre chose</span><span class="sous">Dis-nous ce que tu aimes</span></button>
    </div>`;

  $("#dire-titre", ecran).onclick = e => dire(PHRASES.envie, { bouton: e.currentTarget });
  $("#retour", ecran).onclick = () => aller("accueil");
  $("#idee", ecran).onclick = () => { dire(PHRASES.autreChose); aller("questionnaire"); };
  $$("[data-theme]", ecran).forEach(b => b.onclick = () => {
    const t = THEMES.find(x => x.cle === b.dataset.theme);
    if (!articlesDisponibles(t.cle).length) return dire(remplir(PHRASES.pasEncore, t.nom));
    themeChoisi = t.cle;
    dire(t.nom);
    aller("articles");
  });
}

// tous les articles du thème choisi : les nouveaux d'abord, puis ceux déjà lus (à relire pour le plaisir)
export function articlesDuTheme(ecran) {
  const t = THEMES.find(x => x.cle === themeChoisi);
  if (!t) { aller("envies"); return; }
  const liste = articlesDisponibles(t.cle);
  ecran.innerHTML = `
    <div class="entete">
      <button class="hp" id="dire-titre" aria-label="Écouter">🔊</button>
      <h1>${t.emoji} ${esc(t.nom)}</h1>
      <div class="droite"><button class="bouton clair petit" id="retour">◀ Thèmes</button></div>
    </div>
    <div class="tuiles">
      ${liste.map(a => `<button class="tuile ${dejaLu(a.id) ? "" : "dispo"}" data-article="${esc(a.id)}">
        <span class="emo ${dejaLu(a.id) ? "" : "anim-flotte"}">${a.emoji || t.emoji}</span>
        <span class="nom">${esc(a.titre)}</span><span class="sous">${dejaLu(a.id) ? "✅ déjà lu" : "nouveau"}</span></button>`).join("")}
      <button class="tuile idee" id="idee"><span class="emo">💡</span><span class="nom">J'ai envie d'autre chose</span><span class="sous">Dis-nous ce que tu aimes</span></button>
    </div>`;
  $("#dire-titre", ecran).onclick = e => dire(t.nom, { bouton: e.currentTarget });
  $("#retour", ecran).onclick = () => aller("envies");
  $("#idee", ecran).onclick = () => { dire(PHRASES.autreChose); aller("questionnaire"); };
  $$("[data-article]", ecran).forEach(b => b.onclick = () => commencerArticle(liste.find(a => a.id === b.dataset.article)));
}
