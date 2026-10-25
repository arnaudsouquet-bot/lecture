// Questionnaire « J'ai envie d'autre chose » : l'enfant choisit un thème puis un sujet, et c'est envoyé aux parents.
// [Arnaud] pas de question de précision ; l'idée à taper ne sert que pour « Autre chose ».
// L'envie arrive dans l'espace parent, qui peut demander l'article à Claude.
import { THEMES } from "../config.js";
import { lire, ecrire } from "../store.js";
import { articlesDisponibles, dejaLu } from "../articles.js";
import { aller, nommer } from "../session.js";
import { dire, direSuite } from "../voix.js";
import { PHRASES } from "../phrases.js";
import { commencerArticle } from "./envies.js";
import { $, $$, esc, jour, etapes } from "../outils.js";

const AUTRE = "autre";

export default function questionnaire(ecran) {
  const r = { theme: null, sujet: null, emoji: "💡", idee: "" };
  let etape = 1; // 1 thème · 2 sujet · 3 idée libre (« Autre chose ») · 4 résumé

  function rendre(titre, contenu, { suite = "" } = {}) {
    ecran.innerHTML = `
      <div class="entete">
        <button class="hp" id="dire-titre" aria-label="Écouter">🔊</button>
        <h1>${titre}</h1>
        <div class="droite"><div class="points-etapes">${etapes(2, etape === 1 ? 0 : 1)}</div></div>
      </div>
      ${contenu}
      <div class="bas">
        <button class="bouton clair petit" id="retour">◀ ${etape > 1 ? "Retour" : "Mes envies"}</button>
        <span class="fin">${suite}</span>
      </div>`;
    $("#dire-titre", ecran).onclick = e => dire(titre.replace(/<[^>]+>/g, ""), { bouton: e.currentTarget });
    $("#retour", ecran).onclick = () => {
      if (etape === 1) return aller("envies");
      etape = etape === 3 && r.theme !== AUTRE ? 2 : 1;
      afficherEtape();
    };
  }

  const tuile = (cle, nom, emoji, cls = "") =>
    `<button class="tuile ${cls}" data-cle="${esc(cle)}"><span class="emo">${emoji}</span><span class="nom">${esc(nom)}</span></button>`;

  function afficherEtape() {
    if (etape === 1) {
      rendre("De quoi as-tu envie ?",
        `<div class="tuiles">${THEMES.map(t => tuile(t.cle, t.nom, t.emoji)).join("")}${tuile(AUTRE, "Autre chose", "✏️", "idee")}</div>`);
      $$("[data-cle]", ecran).forEach(b => b.onclick = () => {
        const t = THEMES.find(x => x.cle === b.dataset.cle);
        r.theme = b.dataset.cle; r.sujet = null; r.emoji = t ? t.emoji : "💡";
        dire(t ? t.nom : "Autre chose");
        etape = t ? 2 : 3;
        setTimeout(afficherEtape, 250);
      });
    } else if (etape === 2) {
      const t = THEMES.find(x => x.cle === r.theme);
      rendre(`${t.emoji} ${t.nom} : qu'est-ce qui te plaît ?`,
        `<div class="tuiles">${t.sujets.map(([nom, emo]) => tuile(nom, nom, emo)).join("")}${tuile(AUTRE, "Autre chose", "✏️", "idee")}</div>`);
      $$("[data-cle]", ecran).forEach(b => b.onclick = () => {
        const s = t.sujets.find(([nom]) => nom === b.dataset.cle);
        r.sujet = s ? s[0] : null; if (s) r.emoji = s[1];
        dire(s ? s[0] : "Autre chose");
        etape = s ? 4 : 3;
        setTimeout(afficherEtape, 250);
      });
    } else if (etape === 3) {
      rendre("✏️ Sur quoi aimerais-tu lire ?",
        `<div class="carte" style="display:flex;flex-direction:column;gap:16px">
           <input class="champ-libre" id="idee" placeholder="les pompiers, les chats…" value="${esc(r.idee)}" autocomplete="off" autocapitalize="off">
           <p class="petit-gris" style="font-size:20px;margin:0">🎤 Tu peux appuyer sur le micro du clavier et le dire à voix haute.</p>
         </div>`,
        { suite: `<button class="bouton" id="suite">Continuer ▶</button>` });
      const champ = $("#idee", ecran);
      const maj = () => { $("#suite", ecran).disabled = !champ.value.trim(); };
      champ.oninput = maj; maj();
      $("#suite", ecran).onclick = () => { r.idee = champ.value.trim(); etape = 4; afficherEtape(); };
    } else {
      const theme = THEMES.find(x => x.cle === r.theme);
      const sujet = r.sujet || r.idee;
      // résumé dit en morceaux déjà enregistrés ; seule l'idée tapée par l'enfant passe par la voix de l'appareil
      const resume = [PHRASES.resumeSujet, sujet].map(texte => ({ texte }));
      ecran.innerHTML = `
        <div class="entete"><h1>C'est bien ça ?</h1></div>
        <div class="carte resume-envie lisible" style="flex:1;display:flex;flex-direction:column;justify-content:center">
          <span class="grosse anim-rebond">${r.emoji}</span>
          <div>Tu aimerais lire sur : <b>${esc(sujet)}</b></div>
        </div>
        <div class="bas">
          <button class="hp large" id="ecouter">🔊 Écouter</button>
          <button class="bouton clair petit" id="changer">✏️ Changer</button>
          <button class="bouton vert fin" id="envoyer">Envoyer à mes parents ✉️</button>
        </div>`;
      direSuite(resume);
      $("#ecouter", ecran).onclick = e => direSuite(resume, { bouton: e.currentTarget });
      $("#changer", ecran).onclick = () => { etape = 1; afficherEtape(); };
      $("#envoyer", ecran).onclick = async () => {
        await ecrire("envies", [...lire("envies", []), {
          date: jour(), theme: theme ? theme.cle : null, sujet: r.sujet, idee: r.sujet ? "" : r.idee, faite: false
        }]);
        merci(theme);
      };
    }
  }

  function merci(theme) {
    const a = theme && articlesDisponibles(theme.cle).find(x => !dejaLu(x.id));
    ecran.innerHTML = `
      <div class="recompense">
        <div style="font-size:110px" class="anim-rebond">✉️</div>
        <h1 style="font-size:44px">${esc(nommer("Merci"))} !</h1>
        <p style="font-size:28px" class="lisible">Tes parents vont te préparer un article.</p>
        ${a ? `<p style="font-size:24px" class="lisible">En attendant, il y a déjà un article : <b>${esc(a.titre)}</b></p>` : ""}
        <div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center">
          ${a ? `<button class="bouton vert" id="lire">📖 Le lire</button>` : ""}
          <button class="bouton clair" id="autres">Voir les articles</button>
        </div>
      </div>`;
    dire(PHRASES.merci);
    if (a) $("#lire", ecran).onclick = () => commencerArticle(a);
    $("#autres", ecran).onclick = () => aller("envies");
  }

  afficherEtape();
}
