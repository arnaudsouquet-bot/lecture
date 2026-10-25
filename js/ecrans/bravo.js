// Fin d'un jeu de Mémoire ou de Mathématique : étoiles gagnées et nouveaux badges.
import { BADGES } from "../config.js";
import { etat, dernierResultat } from "../jeux.js";
import { aller, nommer } from "../session.js";
import { direSuite } from "../voix.js";
import { PHRASES } from "../phrases.js";
import { $, esc, compter, confettis } from "../outils.js";

export default function bravo(ecran) {
  const r = dernierResultat();
  if (!r) { aller("accueil"); return; }
  const gagnes = etat().badges;
  ecran.innerHTML = `
    <div class="bravo">
      <h1>${esc(nommer("Bravo"))} ! 🎉</h1>
      <div class="gros">⭐ +<span id="n">0</span> étoile${r.etoiles > 1 ? "s" : ""}</div>
      ${r.nouveaux.map(b => `<div class="carte nouveau-badge"><span class="emo anim-rebond">${b.emoji}</span>
        <div><b>Nouveau badge : ${esc(b.titre)}</b><br><span class="petit-gris" style="font-size:20px">${esc(b.desc)}</span></div></div>`).join("")}
      <div class="collection">${BADGES.map(b => `<span class="${gagnes.includes(b.id) ? "" : "gris"}" title="${esc(b.titre)} : ${esc(b.desc)}">${b.emoji}</span>`).join("")}</div>
      <div class="petit-gris" style="font-size:20px">Tu as ${etat().etoiles} étoiles en tout.</div>
      <div style="display:flex;gap:16px">
        <button class="bouton clair" id="accueil">🏠 Accueil</button>
        <button class="bouton vert" id="encore">${r.retour === "memoire" ? "🧠 Mémoire" : "🔢 Mathématique"}</button>
      </div>
    </div>`;
  compter($("#n", ecran), 0, r.etoiles, 1000, v => Math.round(v));
  confettis(ecran, 60);
  direSuite([PHRASES.gagneEtoiles, ...(r.nouveaux.length ? [PHRASES.nouveauBadge, ...r.nouveaux.map(b => b.titre)] : [])].map(texte => ({ texte })));
  $("#accueil", ecran).onclick = () => aller("accueil");
  $("#encore", ecran).onclick = () => aller(r.retour);
}
