// Questionnaire « J'ai envie d'autre chose » : en 3 ou 4 étapes, l'enfant dit sur quoi il voudrait lire.
// Son envie est envoyée à l'espace parent, qui peut demander l'article à Claude.
import { THEMES, ANGLES } from "../config.js";
import { lire, ecrire } from "../store.js";
import { articlesDisponibles, dejaLu } from "../articles.js";
import { aller, nommer } from "../session.js";
import { dire, direSuite } from "../voix.js";
import { PHRASES } from "../phrases.js";
import { commencerArticle } from "./envies.js";
import { $, $$, esc, jour, etapes } from "../outils.js";

const AUTRE = "autre";

export default function questionnaire(ecran) {
  const r = { theme: null, sujet: null, emoji: "💡", angles: [], idee: "" };
  let etape = 1;

  function rendre(titre, contenu, { suite = "", retour = true } = {}) {
    ecran.innerHTML = `
      <div class="entete">
        <button class="hp" id="dire-titre" aria-label="Écouter">🔊</button>
        <h1>${titre}</h1>
        <div class="droite"><div class="points-etapes">${etapes(4, etape - 1)}</div></div>
      </div>
      ${contenu}
      <div class="bas">
        <button class="bouton clair petit" id="retour">◀ ${retour && etape > 1 ? "Retour" : "Mes envies"}</button>
        <span class="fin">${suite}</span>
      </div>`;
    $("#dire-titre", ecran).onclick = e => dire(titre.replace(/<[^>]+>/g, ""), { bouton: e.currentTarget });
    $("#retour", ecran).onclick = () => {
      if (etape === 1 || !retour) return aller("envies");
      etape = etape === 4 && !r.sujet ? (r.theme && r.theme !== AUTRE ? 2 : 1) : etape - 1;
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
        etape = t ? 2 : 4;
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
        etape = s ? 3 : 4;
        setTimeout(afficherEtape, 250);
      });
    } else if (etape === 3) {
      rendre(`${r.emoji} Qu'est-ce qui t'intéresse le plus ?`,
        `<p style="font-size:22px;margin:0 0 16px">Choisis 1 ou 2 réponses.</p>
         <div class="tuiles deux">${ANGLES.map(([nom, emo]) => tuile(nom, nom, emo, "large" + (r.angles.includes(nom) ? " choisie" : ""))).join("")}</div>`,
        { suite: `<button class="bouton" id="suite">Continuer ▶</button>` });
      const maj = () => { $("#suite", ecran).disabled = !r.angles.length; };
      $$("[data-cle]", ecran).forEach(b => b.onclick = () => {
        const nom = b.dataset.cle;
        if (r.angles.includes(nom)) r.angles = r.angles.filter(x => x !== nom);
        else { r.angles.push(nom); if (r.angles.length > 2) r.angles.shift(); dire(nom); }
        $$("[data-cle]", ecran).forEach(x => x.classList.toggle("choisie", r.angles.includes(x.dataset.cle)));
        maj();
      });
      $("#suite", ecran).onclick = () => { etape = 4; afficherEtape(); };
      maj();
    } else if (etape === 4) {
      const obligatoire = !r.sujet;
      rendre(obligatoire ? "✏️ Sur quoi aimerais-tu lire ?" : "✏️ Tu veux ajouter une idée ?",
        `<div class="carte" style="display:flex;flex-direction:column;gap:16px">
           <input class="champ-libre" id="idee" placeholder="${obligatoire ? "les pompiers, les chats…" : "par exemple : le requin le plus grand"}" value="${esc(r.idee)}" autocomplete="off" autocapitalize="off">
           <p class="petit-gris" style="font-size:20px;margin:0">🎤 Tu peux appuyer sur le micro du clavier et le dire à voix haute.</p>
         </div>`,
        { suite: `${obligatoire ? "" : `<button class="bouton clair petit" id="passer">Passer</button> `}<button class="bouton" id="suite">Continuer ▶</button>` });
      const champ = $("#idee", ecran);
      const maj = () => { $("#suite", ecran).disabled = obligatoire && !champ.value.trim(); };
      champ.oninput = maj; maj();
      $("#suite", ecran).onclick = () => { r.idee = champ.value.trim(); etape = 5; afficherEtape(); };
      if (!obligatoire) $("#passer", ecran).onclick = () => { r.idee = ""; etape = 5; afficherEtape(); };
    } else {
      const theme = THEMES.find(x => x.cle === r.theme);
      const sujet = r.sujet || r.idee;
      // résumé dit en morceaux déjà enregistrés ; seule l'idée tapée par l'enfant passe par la voix de l'appareil
      const resume = [PHRASES.resumeSujet, sujet,
        ...(r.angles.length ? [PHRASES.resumeAngles, ...r.angles.flatMap((x, i) => (i ? [PHRASES.et, x] : [x]))] : []),
        ...(r.sujet && r.idee ? [PHRASES.resumeIdee, r.idee] : [])].map(texte => ({ texte }));
      ecran.innerHTML = `
        <div class="entete"><h1>C'est bien ça ?</h1></div>
        <div class="carte resume-envie lisible" style="flex:1;display:flex;flex-direction:column;justify-content:center">
          <span class="grosse anim-rebond">${r.emoji}</span>
          <div>Tu aimerais lire sur : <b>${esc(sujet)}</b></div>
          ${r.angles.length ? `<div>Ce qui t'intéresse : <b>${r.angles.map(esc).join(" et ")}</b></div>` : ""}
          ${r.sujet && r.idee ? `<div>Ton idée : <b>${esc(r.idee)}</b></div>` : ""}
        </div>
        <div class="bas">
          <button class="hp large" id="ecouter">🔊 Écouter</button>
          <button class="bouton clair petit" id="changer">✏️ Changer</button>
          <button class="bouton vert fin" id="envoyer">Envoyer à mes parents ✉️</button>
        </div>`;
      $("#ecouter", ecran).onclick = e => direSuite(resume, { bouton: e.currentTarget });
      $("#changer", ecran).onclick = () => { etape = 1; afficherEtape(); };
      $("#envoyer", ecran).onclick = async () => {
        await ecrire("envies", [...lire("envies", []), {
          date: jour(), theme: theme ? theme.cle : null, sujet: r.sujet, angles: r.angles, idee: r.idee, faite: false
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
